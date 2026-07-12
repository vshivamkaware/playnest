import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../store/useAuthStore';
import { Home, Download, User, Shield } from 'lucide-react-native';

export default function TabLayout() {
  const { isAdmin } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: Platform.OS === 'android' ? 'rgba(9, 9, 11, 0.85)' : 'transparent',
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              tint="dark"
              intensity={80} 
              style={StyleSheet.absoluteFill} 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(9, 9, 11, 0.95)' }]} />
          )
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Downloads',
          tabBarIcon: ({ color }) => <Download color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? '/(tabs)/admin' : null,
          tabBarIcon: ({ color }) => <Shield color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
