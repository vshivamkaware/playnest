import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { CheckCircle2, XCircle, Clock } from 'lucide-react-native';
import { userService } from '../../services/firebase/userService';

type PaymentRequest = {
  id: string;
  userId: string;
  userEmail: string;
  videoId: string;
  videoTitle: string;
  utr: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
};

export function PaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'paymentRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentRequest[];
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching payment requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: PaymentRequest) => {
    Alert.alert(
      'Approve Payment',
      `Are you sure you want to approve UTR: ${request.utr} and unlock the video for ${request.userEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          style: 'default',
          onPress: async () => {
            setProcessingId(request.id);
            try {
              // Unlock video for user
              await userService.unlockVideoForUser(request.userId, request.videoId);
              // Update request status
              await updateDoc(doc(db, 'paymentRequests', request.id), {
                status: 'approved',
                updatedAt: new Date()
              });
              Alert.alert('Success', 'Video unlocked successfully.');
            } catch (error) {
              console.error("Error approving payment:", error);
              Alert.alert('Error', 'Failed to approve payment.');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (request: PaymentRequest) => {
    Alert.alert(
      'Reject Payment',
      `Are you sure you want to reject UTR: ${request.utr}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async () => {
            setProcessingId(request.id);
            try {
              await updateDoc(doc(db, 'paymentRequests', request.id), {
                status: 'rejected',
                updatedAt: new Date()
              });
            } catch (error) {
              console.error("Error rejecting payment:", error);
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No payment requests found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{item.userEmail}</Text>
                <Text style={styles.videoTitle}>Video: {item.videoTitle}</Text>
              </View>
              {item.status === 'pending' && <Clock color="#fbbf24" size={20} />}
              {item.status === 'approved' && <CheckCircle2 color="#22c55e" size={20} />}
              {item.status === 'rejected' && <XCircle color="#ef4444" size={20} />}
            </View>

            <View style={styles.utrContainer}>
              <Text style={styles.utrLabel}>UTR / Transaction ID:</Text>
              <Text style={styles.utrValue} selectable>{item.utr}</Text>
            </View>

            {item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item)}
                  disabled={processingId === item.id}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.approveButtonText}>Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 35, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userEmail: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoTitle: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  utrContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  utrLabel: {
    color: '#d4d4d8',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  utrValue: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  approveButton: {
    backgroundColor: '#f59e0b',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  approveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#a1a1aa',
    fontSize: 16,
  }
});
