/**
 * PantryManagementScreen — Kayıtlı Buzdolabı Yönetimi
 * =========================================================
 * - Mevcut malzemeleri liste
 * - Yenisini ekle (kategoriden veya search)
 * - Sil (swipe veya X)
 * - Son kullanma tarihi uyarısı
 * - Empty state ile hızlı başlangıç
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useUserPantry } from '../hooks';
import { IngredientChip } from '../components/IngredientChip';
import { EmptyState } from '../components/EmptyState';
import { INGREDIENT_CATALOG, FREQUENT_INGREDIENTS, getEmoji } from '../api/ingredients';
import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { PantryItem, IngredientToken } from '../types';

export default function PantryManagementScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { pantry, loading, addItem, removeItem } = useUserPantry();
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  const handleRemove = useCallback((token: string) => {
    Alert.alert(
      t('pantry_management.remove_title'),
      t('pantry_management.remove_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await removeItem(token);
            analytics.track('pantry_item_removed', { token });
          },
        },
      ]
    );
  }, [removeItem, t]);
  
  const handleAdd = useCallback(async (token: IngredientToken) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const item: PantryItem = {
      token,
      display_name: t(`ingredient.${token}`),
      quantity: null,
      expires_at: null,
      source: 'manual',
      added_at: new Date().toISOString(),
    };
    
    await addItem(item);
    analytics.track('pantry_item_added', { token, source: 'manual' });
    setAddModalVisible(false);
  }, [addItem, t]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('pantry_management.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* List */}
      {pantry.length === 0 ? (
        <EmptyState
          icon="🗄️"
          title={t('pantry_management.empty_title')}
          message={t('pantry_management.empty_message')}
          actionLabel={t('pantry_management.add_first')}
          onAction={() => setAddModalVisible(true)}
        />
      ) : (
        <>
          <Text style={styles.count}>
            {t('pantry_management.item_count', { count: pantry.length })}
          </Text>
          
          <FlashList
            data={pantry}
            keyExtractor={item => item.token}
            estimatedItemSize={70}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemEmoji}>{getEmoji(item.token)}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.display_name}</Text>
                  {item.quantity && (
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  )}
                  {item.expires_at && (
                    <Text style={styles.itemExpiry}>
                      ⚠️ {t('pantry_management.expires', { date: item.expires_at })}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemove(item.token)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
      
      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Add Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Text style={styles.modalCancel}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('pantry_management.add_title')}</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>
              {t('pantry_management.frequent')}
            </Text>
            <View style={styles.chipGrid}>
              {FREQUENT_INGREDIENTS
                .filter(token => !pantry.some(p => p.token === token))
                .map(token => (
                  <IngredientChip
                    key={token}
                    emoji={getEmoji(token)}
                    label={t(`ingredient.${token}`)}
                    onPress={() => handleAdd(token)}
                  />
                ))
              }
            </View>
            
            <Text style={styles.modalSectionTitle}>
              {t('pantry_management.all_ingredients')}
            </Text>
            <View style={styles.chipGrid}>
              {(Object.keys(INGREDIENT_CATALOG) as IngredientToken[])
                .filter(token => !pantry.some(p => p.token === token))
                .filter(token => !FREQUENT_INGREDIENTS.includes(token))
                .map(token => (
                  <IngredientChip
                    key={token}
                    emoji={getEmoji(token)}
                    label={t(`ingredient.${token}`)}
                    onPress={() => handleAdd(token)}
                  />
                ))
              }
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    color: theme.colors.text,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  
  count: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 100,
  },
  
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    padding: theme.spacing.base,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  itemEmoji: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemQuantity: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  itemExpiry: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.cardElevated,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
    lineHeight: 36,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCancel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
