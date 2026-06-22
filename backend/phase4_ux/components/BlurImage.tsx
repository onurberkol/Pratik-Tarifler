/**
 * BlurImage — Progressive Image Loading
 * =========================================
 * 3 aşamada yüklenir:
 *   1. blur_hash placeholder (anlık, base64)
 *   2. thumb URL (~30KB, hızlı)
 *   3. full URL (~150KB, opsiyonel)
 * 
 * UI hiçbir zaman boş kalmaz, kullanıcıya hızlı görsel feedback verir.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ImageStyle, ViewStyle, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Blurhash } from 'react-native-blurhash';
import { theme } from '../styles/theme';

interface BlurImageProps {
  url: string | null;
  thumbUrl?: string | null;
  blurHash?: string | null;
  width: number;
  height: number;
  style?: ImageStyle | ViewStyle;
  contentFit?: 'cover' | 'contain' | 'fill';
  priority?: 'low' | 'normal' | 'high';
}

export function BlurImage({
  url,
  thumbUrl,
  blurHash,
  width,
  height,
  style,
  contentFit = 'cover',
  priority = 'normal',
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);
  
  // No image at all - sadece blurhash veya placeholder
  if (!url && !thumbUrl) {
    return (
      <View style={[styles.container, { width, height }, style as ViewStyle]}>
        {blurHash ? (
          <Blurhash
            blurhash={blurHash}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[styles.placeholder, StyleSheet.absoluteFill]} />
        )}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { width, height }, style as ViewStyle]}>
      {/* Katman 1: BlurHash placeholder */}
      {blurHash && !loaded && (
        <Blurhash
          blurhash={blurHash}
          style={StyleSheet.absoluteFill}
        />
      )}
      
      {/* Katman 2: Ana resim — Expo Image cache'i optimize eder */}
      <ExpoImage
        source={{ uri: thumbUrl || url || undefined }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        priority={priority}
        cachePolicy="memory-disk"
        transition={250}
        onLoad={() => setLoaded(true)}
        placeholder={blurHash ? { blurhash: blurHash } : undefined}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.backgroundMuted,
  },
  placeholder: {
    backgroundColor: theme.colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
