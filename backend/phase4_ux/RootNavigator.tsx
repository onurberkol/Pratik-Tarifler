/**
 * Navigation Root — Tüm App Navigation Yapısı
 * ===============================================
 * - AuthStack: Welcome / SignIn / SignUp
 * - MainTabs: Home / Search / Favorites / Profile
 * - Modal: RecipeDetail / CookMode / Rating / Subscription
 * 
 * Auth durumuna göre AuthStack veya MainTabs gösterilir.
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { useAuth } from './hooks';
import { theme } from './styles/theme';

// Auth Screens
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';

// Main Tabs
import ModeSelectionScreen from './screens/ModeSelectionScreen';
import SearchScreen from './screens/SearchScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';

// Mode 1 Stack
import PantryInputScreen from './screens/PantryInputScreen';
import PhotoCameraScreen from './screens/PhotoCameraScreen';
import PhotoReviewScreen from './screens/PhotoReviewScreen';
import IngredientListScreen from './screens/IngredientListScreen';
import PantryResultsScreen from './screens/PantryResultsScreen';

// Mode 2 Stack
import SupplyResultsScreen from './screens/SupplyResultsScreen';

// Mode 3 Stack
import DiscoverScreen from './screens/DiscoverScreen';

// Modal Screens
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import CookModeScreen from './screens/CookModeScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';

// ============================================================
// Type definitions
// ============================================================
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
};

export type HomeStackParamList = {
  ModeSelection: undefined;
  // Mode 1
  PantryInput: { mode?: 'pantry' | 'supply' };
  PhotoCamera: { mode: 'pantry' | 'supply' };
  PhotoReview: { photoUri: string; mode: 'pantry' | 'supply' };
  IngredientList: { mode: 'pantry' | 'supply'; initialItems?: string[] };
  PantryResults: { ingredients: string[] };
  // Mode 2
  SupplyResults: { ingredients: string[] };
  // Mode 3
  Discover: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RecipeDetail: { recipeId: string; missing_ingredients?: any[] };
  CookMode: { recipeId: string };
  Subscription: { source?: string };
  PantryManagement: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};


// ============================================================
// Stack Navigators
// ============================================================
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();


function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}


function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ModeSelection" component={ModeSelectionScreen} />
      <HomeStack.Screen name="PantryInput" component={PantryInputScreen} />
      <HomeStack.Screen 
        name="PhotoCamera" 
        component={PhotoCameraScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <HomeStack.Screen name="PhotoReview" component={PhotoReviewScreen} />
      <HomeStack.Screen name="IngredientList" component={IngredientListScreen} />
      <HomeStack.Screen name="PantryResults" component={PantryResultsScreen} />
      <HomeStack.Screen name="SupplyResults" component={SupplyResultsScreen} />
      <HomeStack.Screen name="Discover" component={DiscoverScreen} />
    </HomeStack.Navigator>
  );
}


function TabBarIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, !focused && styles.tabEmojiInactive]}>{emoji}</Text>
    </View>
  );
}


function MainTabNavigator() {
  const { t } = useTranslation();
  
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <MainTab.Screen 
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🏠" focused={focused} />,
        }}
      />
      <MainTab.Screen 
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: t('tabs.search'),
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🔍" focused={focused} />,
        }}
      />
      <MainTab.Screen 
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: t('tabs.favorites'),
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="⭐" focused={focused} />,
        }}
      />
      <MainTab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="👤" focused={focused} />,
        }}
      />
    </MainTab.Navigator>
  );
}


export function RootNavigator() {
  const { firebaseUser, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🍳</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {firebaseUser ? (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="RecipeDetail" 
              component={RecipeDetailScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <RootStack.Screen 
              name="CookMode" 
              component={CookModeScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <RootStack.Screen 
              name="Subscription" 
              component={SubscriptionScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingEmoji: { fontSize: 80 },
  
  tabBar: {
    backgroundColor: theme.colors.backgroundElevated,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabEmoji: {
    fontSize: 24,
  },
  tabEmojiInactive: {
    opacity: 0.4,
  },
});
