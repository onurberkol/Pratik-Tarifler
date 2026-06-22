/**
 * PhotoCameraScreen — Buzdolabı Fotoğrafı Çekme
 * =================================================
 * - Expo Camera entegrasyonu
 * - Çerçeve overlay (kullanıcıyı yönlendir)
 * - Flash, kamera flip, galeriden seç
 * - Çekildikten sonra → PhotoReviewScreen
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { analytics } from '../api/analytics';
import { theme } from '../styles/theme';
import type { RecommendationMode } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoCameraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  
  const mode: RecommendationMode = route.params?.mode || 'pantry';
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [taking, setTaking] = useState(false);
  
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);
  
  // İzin yok
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.textInverse} />
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.containerDark}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t('camera.permission_title')}</Text>
          <Text style={styles.permissionMessage}>{t('camera.permission_message')}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t('camera.grant_permission')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleCapture = async () => {
    if (!cameraRef.current || taking) return;
    
    try {
      setTaking(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      analytics.scanStarted('camera');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        exif: false,
      });
      
      if (photo) {
        navigation.replace('PhotoReview', { 
          photoUri: photo.uri, 
          mode 
        });
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message);
    } finally {
      setTaking(false);
    }
  };
  
  const handleGallery = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.scanStarted('gallery');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      navigation.replace('PhotoReview', {
        photoUri: result.assets[0].uri,
        mode,
      });
    }
  };
  
  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };
  
  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  };
  
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />
      
      {/* Top overlay */}
      <SafeAreaView style={styles.topOverlay}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.topButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.topButtonText}>✕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.topButton}
            onPress={toggleFlash}
          >
            <Text style={styles.topButtonText}>
              {flash === 'on' ? '⚡' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Frame overlay */}
      <View style={styles.frameContainer} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>
        <Text style={styles.frameInstruction}>
          {t('camera.frame_instruction')}
        </Text>
      </View>
      
      {/* Bottom controls */}
      <SafeAreaView style={styles.bottomOverlay}>
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.sideButton}
            onPress={handleGallery}
          >
            <Text style={styles.sideButtonIcon}>🖼️</Text>
            <Text style={styles.sideButtonText}>{t('camera.gallery')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={taking}
          >
            {taking ? (
              <ActivityIndicator color={theme.colors.text} size="large" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sideButton}
            onPress={toggleFacing}
          >
            <Text style={styles.sideButtonIcon}>🔄</Text>
            <Text style={styles.sideButtonText}>{t('camera.flip')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}


const FRAME_SIZE = SCREEN_WIDTH * 0.85;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  permissionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  permissionMessage: {
    fontSize: theme.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderRadius: theme.radius.base,
    marginBottom: theme.spacing.base,
  },
  permissionButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.fontSize.base,
    marginTop: theme.spacing.base,
  },
  
  // Top overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.base,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonText: {
    color: '#FFF',
    fontSize: 22,
  },
  
  // Frame
  frameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  frameInstruction: {
    color: '#FFF',
    fontSize: theme.fontSize.base,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Bottom
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sideButton: {
    width: 56,
    alignItems: 'center',
    gap: 4,
  },
  sideButtonIcon: {
    fontSize: 28,
  },
  sideButtonText: {
    color: '#FFF',
    fontSize: theme.fontSize.xs,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF',
  },
});
