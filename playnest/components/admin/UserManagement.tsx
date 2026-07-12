import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Users, Ban, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert('Error', 'Failed to fetch users. Please check your permissions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers(true);
  }, [fetchUsers]);

  const toggleBanStatus = async (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'Unban' : 'Ban';
    Alert.alert(`${actionText} User`, `Are you sure you want to ${actionText.toLowerCase()} this user?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: actionText, 
        style: currentStatus ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'users', userId), {
              isBanned: !currentStatus
            });
            fetchUsers(true);
          } catch (error) {
            console.error(`Error ${actionText.toLowerCase()}ing user:`, error);
            Alert.alert('Error', `Failed to ${actionText.toLowerCase()} user.`);
          }
        }
      }
    ]);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Users color="#71717a" size={40} />
      </View>
      <Text style={styles.emptyText}>No Users Found</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.id === currentUser?.uid;
    const isAdminRole = item.role === 'admin' || item.isAdmin;
    const showBanButton = !isAdminRole && !isCurrentUser;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.emailText} numberOfLines={1}>
              {item.email || item.id}
            </Text>
            
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, item.isBanned ? styles.badgeBanned : styles.badgeActive]}>
                <Text style={[styles.badgeText, item.isBanned ? styles.badgeTextBanned : styles.badgeTextActive]}>
                  {item.isBanned ? 'BANNED' : 'ACTIVE'}
                </Text>
              </View>
              
              <Text style={styles.roleText} numberOfLines={1}>
                Role: {item.role || (item.isAdmin ? 'Admin' : 'User')}
              </Text>
            </View>
          </View>

          {showBanButton && (
            <TouchableOpacity 
              style={[styles.banButton, item.isBanned ? styles.banButtonActive : styles.banButtonBanned]}
              onPress={() => toggleBanStatus(item.id, item.isBanned || false)}
              activeOpacity={0.7}
            >
              {item.isBanned ? (
                <CheckCircle color="#34d399" size={20} />
              ) : (
                <Ban color="#fca5a5" size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#f59e0b" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#f59e0b"
            colors={['#f59e0b']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 32,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 96,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#1E1E23',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 16,
  },
  emailText: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeBanned: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextActive: {
    color: '#34d399',
  },
  badgeTextBanned: {
    color: '#f87171',
  },
  roleText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  banButton: {
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  banButtonBanned: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  }
});
