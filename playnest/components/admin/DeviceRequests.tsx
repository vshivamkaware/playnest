import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Smartphone } from 'lucide-react-native';

export function DeviceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingRequests = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('deviceStatus', '==', 'PENDING'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert('Error', 'Failed to fetch device requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingRequests(true);
  }, [fetchPendingRequests]);

  const handleApprove = async (userId: string, newDeviceId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        deviceId: newDeviceId,
        deviceStatus: 'APPROVED',
        newDeviceId: null,
      });
      fetchPendingRequests(true);
    } catch (error) {
      console.error("Error approving request:", error);
      Alert.alert('Error', 'Failed to approve request.');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        deviceStatus: 'REJECTED',
      });
      fetchPendingRequests(true);
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Smartphone color="#52525b" size={32} />
      </View>
      <Text style={styles.emptyText}>All Caught Up!</Text>
      <Text style={styles.emptySubText}>There are no pending device requests right now.</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Text style={styles.emailText} numberOfLines={1}>
          {item.email || item.id}
        </Text>
        <Text style={styles.deviceText} numberOfLines={1}>
          Device ID: {item.newDeviceId || 'Unknown'}
        </Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id, item.newDeviceId)}
            activeOpacity={0.7}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#4f46e5" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#4f46e5"
            colors={['#4f46e5']}
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
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    textAlign: 'center',
    color: '#71717a',
    marginTop: 8,
    fontSize: 14,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  emailText: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
    color: '#ffffff',
  },
  deviceText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  approveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  rejectButtonText: {
    color: '#f87171',
    fontWeight: '700',
  },
});
