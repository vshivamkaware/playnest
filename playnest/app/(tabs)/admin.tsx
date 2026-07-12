import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { DeviceRequests } from '../../components/admin/DeviceRequests';
import { VideoManager } from '../../components/admin/VideoManager';
import { UserManagement } from '../../components/admin/UserManagement';
import { SettingsManager } from '../../components/admin/SettingsManager';
import { PaymentRequests } from '../../components/admin/PaymentRequests';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldAlert } from 'lucide-react-native';

type AdminTab = 'videos' | 'users' | 'devices' | 'payments' | 'settings';

export default function AdminScreen() {
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('videos');
  const insets = useSafeAreaInsets();

  if (!isAdmin) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Ambient Mesh Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#451a03', 'transparent']}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', '#31160c', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.meshGradient}
        />
        <LinearGradient
          colors={['transparent', '#000000']}
          style={styles.bottomGradient}
        />
      </View>
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.titleRow}>
          <ShieldAlert color="#f59e0b" size={28} />
          <Text style={styles.title}>Admin</Text>
        </View>
        
        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TabButton label="Videos" active={activeTab === 'videos'} onPress={() => setActiveTab('videos')} />
          <TabButton label="Users" active={activeTab === 'users'} onPress={() => setActiveTab('users')} />
          <TabButton label="Devices" active={activeTab === 'devices'} onPress={() => setActiveTab('devices')} />
          <TabButton label="Payments" active={activeTab === 'payments'} onPress={() => setActiveTab('payments')} />
          <TabButton label="Settings" active={activeTab === 'settings'} onPress={() => setActiveTab('settings')} />
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'videos' && <VideoManager />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'devices' && <DeviceRequests />}
        {activeTab === 'payments' && <PaymentRequests />}
        {activeTab === 'settings' && <SettingsManager />}
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: '50%',
  },
  meshGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: 10,
    letterSpacing: -0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabLabel: {
    fontWeight: '700',
    fontSize: 12,
    color: 'rgba(255, 243, 224, 0.6)',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
