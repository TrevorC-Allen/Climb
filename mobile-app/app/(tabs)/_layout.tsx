import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size || 28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Index',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size || 28} color={color} />,
        }}
      />
    </Tabs>
  );
}
