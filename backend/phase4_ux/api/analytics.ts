/**
 * Analytics — Event Tracking Wrapper
 * =======================================
 * Tüm app boyunca analitik event'ler tek noktadan geçer.
 * 
 * Default: Firebase Analytics (Expo Application Services)
 * Geliştirme modunda console.log + queue, production'da Firebase'e gönderir.
 * 
 * Kullanım:
 *   import { analytics } from '@/api/analytics';
 *   analytics.track('recipe_opened', { recipe_id, mode });
 */

interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp: number;
}

class AnalyticsClient {
  private enabled: boolean = true;
  private userId: string | null = null;
  private superProperties: Record<string, any> = {};
  private queue: AnalyticsEvent[] = [];
  private isDev: boolean = __DEV__;
  
  /**
   * Kullanıcı login sonrası userId set et
   */
  setUser(userId: string | null, properties?: Record<string, any>) {
    this.userId = userId;
    if (properties) {
      this.superProperties = { ...this.superProperties, ...properties };
    }
    
    if (this.isDev) {
      console.log('[Analytics] setUser', { userId, properties });
    }
    
    // PROD: Firebase Analytics setUserId(userId)
  }
  
  /**
   * Tüm event'lere otomatik eklenecek metadata
   */
  setSuperProperty(key: string, value: any) {
    this.superProperties[key] = value;
  }
  
  /**
   * Event gönder
   */
  track(eventName: string, params?: Record<string, any>) {
    if (!this.enabled) return;
    
    const event: AnalyticsEvent = {
      name: eventName,
      params: {
        ...this.superProperties,
        ...params,
        user_id: this.userId,
      },
      timestamp: Date.now(),
    };
    
    this.queue.push(event);
    
    if (this.isDev) {
      console.log(`[Analytics] ${eventName}`, params);
    } else {
      // PROD: Firebase Analytics logEvent
      // logEvent(getAnalytics(), eventName, params);
    }
  }
  
  /**
   * Screen view eventi
   */
  screen(screenName: string, params?: Record<string, any>) {
    this.track('screen_view', {
      screen_name: screenName,
      ...params,
    });
  }
  
  /**
   * Hata logla
   */
  error(error: Error | string, context?: Record<string, any>) {
    const message = typeof error === 'string' ? error : error.message;
    this.track('error_occurred', {
      error_message: message,
      ...context,
    });
    
    if (this.isDev) {
      console.error('[Analytics Error]', error, context);
    }
  }
  
  /**
   * Debugger için queue'yu döndür
   */
  getQueue(): AnalyticsEvent[] {
    return this.queue;
  }
  
  /**
   * Disable (örn. opt-out)
   */
  disable() {
    this.enabled = false;
  }
  
  /**
   * Enable
   */
  enable() {
    this.enabled = true;
  }
}

export const analytics = new AnalyticsClient();

// ============================================================
// İZLENEN ÖNEMLİ EVENT'LER (referans)
// ============================================================
export const ANALYTICS_EVENTS = {
  // Mod seçimi
  MODE_PANTRY_SELECTED: 'mode_pantry_selected',
  MODE_SUPPLY_SELECTED: 'mode_supply_selected',
  MODE_DISCOVER_SELECTED: 'mode_discover_selected',
  
  // Mod 1 / 2 — Pantry
  SCAN_CAMERA_OPENED: 'scan_camera_opened',
  SCAN_PHOTO_TAKEN: 'scan_photo_taken',
  SCAN_COMPLETED: 'pantry_scan_completed',
  SCAN_LIMIT_HIT: 'scan_limit_hit',
  MANUAL_LIST_OPENED: 'manual_list_opened',
  SAVED_PANTRY_USED: 'saved_pantry_used',
  INGREDIENT_ADDED: 'ingredient_added',
  INGREDIENT_REMOVED: 'ingredient_removed',
  RECIPE_SEARCH_STARTED: 'recipe_search_started',
  
  // Recipe interactions
  RECIPE_VIEWED: 'recipe_viewed',
  RECIPE_OPENED: 'recipe_opened',
  RECIPE_FAVORITED: 'recipe_favorited',
  RECIPE_UNFAVORITED: 'recipe_unfavorited',
  RECIPE_SHARED: 'recipe_shared',
  COOK_MODE_STARTED: 'cook_mode_started',
  COOK_MODE_COMPLETED: 'cook_mode_completed',
  COOK_STEP_COMPLETED: 'cook_step_completed',
  
  // Mod 3 — Discover
  CUISINE_BROWSED: 'cuisine_browsed',
  ALL_RECIPES_OPENED: 'all_recipes_opened',
  ROTD_PRESSED: 'rotd_pressed',
  
  // Cross-sell
  MODE_SWITCH: 'mode_switch',
  SHOPPING_LIST_OPENED: 'shopping_list_opened',
  
  // Premium
  PREMIUM_GATE_SHOWN: 'premium_gate_shown',
  PREMIUM_UPGRADE_STARTED: 'premium_upgrade_started',
  PREMIUM_UPGRADE_COMPLETED: 'premium_upgrade_completed',
  
  // Auth
  SIGN_UP_STARTED: 'sign_up_started',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  SIGN_IN_COMPLETED: 'sign_in_completed',
  SIGN_OUT: 'sign_out',
} as const;
