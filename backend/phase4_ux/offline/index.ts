/**
 * Offline Mode — SQLite Cache + Sync Queue
 * ===========================================
 * 
 * STRATEJI:
 *   1. Tüm favori tarifler SQLite'a indir (full content + images URI)
 *   2. Son görülenler son 50 tarifi cache'le
 *   3. Offline'da favori/rating toggle queue'ya yaz, online olunca sync
 *   4. Network state listener — online/offline UI badge
 * 
 * KULLANIM:
 *   import { offlineDB, initOfflineDB } from './offline';
 *   await initOfflineDB();
 *   await offlineDB.cacheRecipe(recipe);
 *   const cached = await offlineDB.getRecipe(id);
 */

import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Recipe } from '../types';
import * as api from '../api/client';


let db: SQLite.SQLiteDatabase | null = null;


// ============================================================
// SCHEMA
// ============================================================
const SCHEMA_VERSION = 1;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS recipes_cache (
    id TEXT PRIMARY KEY,
    lang TEXT NOT NULL,
    data TEXT NOT NULL,                  -- JSON serialize edilmiş Recipe
    cached_at INTEGER NOT NULL,          -- UNIX timestamp
    is_favorite INTEGER DEFAULT 0,       -- 0 / 1
    last_viewed_at INTEGER
  );
  
  CREATE INDEX IF NOT EXISTS idx_recipes_cache_lang ON recipes_cache(lang);
  CREATE INDEX IF NOT EXISTS idx_recipes_cache_favorite ON recipes_cache(is_favorite);
  CREATE INDEX IF NOT EXISTS idx_recipes_cache_viewed ON recipes_cache(last_viewed_at DESC);
  
  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,           -- 'favorite_add' | 'favorite_remove' | 'rating'
    payload TEXT NOT NULL,               -- JSON
    created_at INTEGER NOT NULL,
    retries INTEGER DEFAULT 0,
    last_error TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON sync_queue(retries);
  
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`;


// ============================================================
// INITIALIZATION
// ============================================================
export async function initOfflineDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('pratik_tarifler.db');
  
  // Schema yarat
  await db.execAsync(SCHEMA);
  
  // Version check
  const versionRow = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    ['schema_version']
  );
  
  if (!versionRow) {
    await db.runAsync(
      'INSERT INTO app_meta (key, value) VALUES (?, ?)',
      ['schema_version', String(SCHEMA_VERSION)]
    );
  }
}


function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Offline DB not initialized. Call initOfflineDB() first.');
  return db;
}


// ============================================================
// RECIPE CACHING
// ============================================================
export const offlineDB = {
  
  async cacheRecipe(recipe: Recipe, isFavorite: boolean = false): Promise<void> {
    const d = getDB();
    await d.runAsync(
      `INSERT OR REPLACE INTO recipes_cache 
       (id, lang, data, cached_at, is_favorite, last_viewed_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recipe.id,
        recipe.language || 'tr',
        JSON.stringify(recipe),
        Date.now(),
        isFavorite ? 1 : 0,
        Date.now(),
      ]
    );
  },
  
  async getRecipe(id: string): Promise<Recipe | null> {
    const d = getDB();
    const row = await d.getFirstAsync<{ data: string }>(
      'SELECT data FROM recipes_cache WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    return JSON.parse(row.data);
  },
  
  async getFavorites(lang: string = 'tr'): Promise<Recipe[]> {
    const d = getDB();
    const rows = await d.getAllAsync<{ data: string }>(
      `SELECT data FROM recipes_cache 
       WHERE is_favorite = 1 AND lang = ? 
       ORDER BY cached_at DESC`,
      [lang]
    );
    
    return rows.map(r => JSON.parse(r.data));
  },
  
  async getRecentlyViewed(limit: number = 50, lang: string = 'tr'): Promise<Recipe[]> {
    const d = getDB();
    const rows = await d.getAllAsync<{ data: string }>(
      `SELECT data FROM recipes_cache 
       WHERE lang = ? 
       ORDER BY last_viewed_at DESC 
       LIMIT ?`,
      [lang, limit]
    );
    
    return rows.map(r => JSON.parse(r.data));
  },
  
  async markFavorite(id: string, isFavorite: boolean): Promise<void> {
    const d = getDB();
    await d.runAsync(
      'UPDATE recipes_cache SET is_favorite = ? WHERE id = ?',
      [isFavorite ? 1 : 0, id]
    );
  },
  
  async clearNonFavorites(olderThanDays: number = 7): Promise<number> {
    const d = getDB();
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    
    const result = await d.runAsync(
      `DELETE FROM recipes_cache 
       WHERE is_favorite = 0 AND last_viewed_at < ?`,
      [cutoff]
    );
    
    return result.changes;
  },
  
  async getCacheSize(): Promise<{ count: number; sizeKB: number }> {
    const d = getDB();
    const row = await d.getFirstAsync<{ count: number; total_size: number }>(
      'SELECT COUNT(*) as count, SUM(LENGTH(data)) as total_size FROM recipes_cache'
    );
    
    return {
      count: row?.count || 0,
      sizeKB: Math.round((row?.total_size || 0) / 1024),
    };
  },
};


// ============================================================
// SYNC QUEUE — Offline'da yapılan değişiklikleri biriktir
// ============================================================
type SyncAction = 
  | { type: 'favorite_add'; recipe_id: string; recipe_title: string; recipe_thumb: string }
  | { type: 'favorite_remove'; recipe_id: string }
  | { type: 'rating'; recipe_id: string; score: number; review?: string };


export const syncQueue = {
  
  async enqueue(action: SyncAction): Promise<void> {
    const d = getDB();
    await d.runAsync(
      'INSERT INTO sync_queue (action_type, payload, created_at) VALUES (?, ?, ?)',
      [action.type, JSON.stringify(action), Date.now()]
    );
  },
  
  async processAll(): Promise<{ succeeded: number; failed: number }> {
    const d = getDB();
    const rows = await d.getAllAsync<{
      id: number;
      action_type: string;
      payload: string;
      retries: number;
    }>(
      'SELECT * FROM sync_queue WHERE retries < 5 ORDER BY created_at ASC'
    );
    
    let succeeded = 0;
    let failed = 0;
    
    for (const row of rows) {
      try {
        const action = JSON.parse(row.payload) as SyncAction;
        await executeSyncAction(action);
        
        await d.runAsync('DELETE FROM sync_queue WHERE id = ?', [row.id]);
        succeeded++;
      } catch (error: any) {
        await d.runAsync(
          'UPDATE sync_queue SET retries = retries + 1, last_error = ? WHERE id = ?',
          [String(error?.message || error), row.id]
        );
        failed++;
      }
    }
    
    return { succeeded, failed };
  },
  
  async getPendingCount(): Promise<number> {
    const d = getDB();
    const row = await d.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue WHERE retries < 5'
    );
    return row?.count || 0;
  },
  
  async clearOld(olderThanDays: number = 30): Promise<void> {
    const d = getDB();
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    await d.runAsync(
      'DELETE FROM sync_queue WHERE created_at < ? OR retries >= 5',
      [cutoff]
    );
  },
};


async function executeSyncAction(action: SyncAction): Promise<void> {
  const user = api.auth.currentUser;
  if (!user) throw new Error('Not signed in');
  
  switch (action.type) {
    case 'favorite_add':
      await api.addFavorite(
        user.uid,
        action.recipe_id,
        action.recipe_title,
        action.recipe_thumb
      );
      break;
    
    case 'favorite_remove':
      await api.removeFavorite(user.uid, action.recipe_id);
      break;
    
    case 'rating':
      // submitRating cloud function
      // await api.submitRating(action.recipe_id, action.score, action.review);
      break;
  }
}


// ============================================================
// NETWORK STATE MANAGEMENT
// ============================================================
let isOnline = true;
let networkListeners: Array<(online: boolean) => void> = [];


export function startNetworkMonitoring() {
  return NetInfo.addEventListener((state) => {
    const wasOnline = isOnline;
    isOnline = !!state.isConnected && !!state.isInternetReachable;
    
    if (!wasOnline && isOnline) {
      // Online'a geçtik — queue'yu işle
      console.log('🟢 Back online, syncing...');
      syncQueue.processAll().then(({ succeeded, failed }) => {
        console.log(`Synced: ${succeeded} ok, ${failed} failed`);
      });
    } else if (wasOnline && !isOnline) {
      console.log('🔴 Offline');
    }
    
    networkListeners.forEach(l => l(isOnline));
  });
}


export function onNetworkChange(listener: (online: boolean) => void) {
  networkListeners.push(listener);
  return () => {
    networkListeners = networkListeners.filter(l => l !== listener);
  };
}


export function getIsOnline(): boolean {
  return isOnline;
}


// ============================================================
// PREFETCH — Önemli tarifleri proaktif indir
// ============================================================
export async function prefetchFavoritesAndRecent(): Promise<void> {
  const user = api.auth.currentUser;
  if (!user) return;
  
  try {
    // Tüm favorileri indir
    const favoriteIds = await api.getFavorites(user.uid);
    
    for (const id of favoriteIds) {
      // Zaten cache'te mi?
      const cached = await offlineDB.getRecipe(id);
      if (cached) {
        // Sadece favorite flag'i güncelle
        await offlineDB.markFavorite(id, true);
        continue;
      }
      
      // İndir
      const recipe = await api.getRecipe(id);
      if (recipe) {
        await offlineDB.cacheRecipe(recipe, true);
      }
    }
    
    console.log(`Prefetched ${favoriteIds.length} favorites`);
  } catch (error) {
    console.error('Prefetch failed:', error);
  }
}


// ============================================================
// HOOK — React'te kullanım için
// ============================================================
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [online, setOnline] = useState(isOnline);
  
  useEffect(() => {
    return onNetworkChange(setOnline);
  }, []);
  
  return online;
}


export function usePendingSyncCount() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const update = () => syncQueue.getPendingCount().then(setCount);
    update();
    
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return count;
}
