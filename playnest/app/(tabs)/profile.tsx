import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../services/firebase/config';
import { signOut } from 'firebase/auth';
import { User, ShieldCheck, Key, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, isAdmin, deviceStatus } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Logout Failed', 'An error occurred while signing out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Ambient Mesh Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#1e1b4b', 'transparent']}
          style={styles.gradientTop}
        />
        <LinearGradient
          colors={['transparent', '#312e81', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientMiddle}
        />
        <LinearGradient
          colors={['transparent', '#000000']}
          style={styles.gradientBottom}
        />
      </View>
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileCardInner}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <User color="#818cf8" size={40} />
              </View>
              <Text style={styles.emailText}>{user?.email}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, styles.deviceIconBg]}>
                  <ShieldCheck color="#34d399" size={20} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Device Status</Text>
                  <Text style={styles.infoValue}>{deviceStatus}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, styles.userIconBg]}>
                  <Key color="#60a5fa" size={20} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>User ID</Text>
                  <Text style={styles.infoValueSmall} numberOfLines={1} ellipsizeMode="middle">
                    {user?.uid}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          activeOpacity={0.7}
          style={styles.logoutButton}
        >
          <View style={styles.logoutButtonInner}>
            <LogOut color="#fca5a5" size={20} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: '60%',
  },
  gradientMiddle: {
    position: 'absolute',
    inset: 0,
    opacity: 0.6,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 20,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(30, 30, 35, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  profileCardInner: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 0,
  },
  adminBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  adminBadgeText: {
    color: '#fbbf24',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  deviceIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  userIconBg: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoValueSmall: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  logoutButton: {
    borderRadius: 16,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  logoutButtonInner: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
