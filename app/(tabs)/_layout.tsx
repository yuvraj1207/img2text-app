import React from 'react';
import { Stack, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        // =========================
        // HEADER STYLING (Top)
        // =========================
        headerStyle: {
          backgroundColor: '#FFFDEB', 
        },
        headerShadowVisible: false, // Disables native platform shadows to keep it clean
        headerTitleStyle: {
          fontWeight: '800',
          color: '#141414', 
          fontSize: 24, // Bumped from 20 to 22 for better visual presence
        },
        headerTitleAlign: 'center',
        headerTintColor: '#141414', 
      }}
    >
      {/* SCANNER SCREEN (Main) */}
      <Stack.Screen
        name="index"
        options={{
          title: 'TextLens Scanner',
          headerRight: () => (
            <Link href="/history" asChild>
              <Pressable 
                hitSlop={15} 
                // Added explicit margin right to pull the icon away from the glass edge
                style={{ marginRight: 24 }} 
              >
                {/* Increased size from 28 to 32 to make it a distinct touch target */}
                <Ionicons name="time-outline" size={40} color="#141414" />
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* HISTORY SCREEN */}
      <Stack.Screen
        name="history"
        options={{
          title: 'Scan History',
        }}
      />
    </Stack>
  );
}