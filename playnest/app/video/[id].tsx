import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Linking, Dimensions, StyleSheet, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MonitorPlay, ChevronLeft, Play, IndianRupee, CheckCircle2, Download } from 'lucide-react-native';
import { videoService } from '../../services/firebase/videoService';
import { userService } from '../../services/firebase/userService';
import { db } from '../../services/firebase/config';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { DownloadManager } from '../../services/downloads/DownloadManager';
import { useAuthStore } from '../../store/useAuthStore';
import { Video } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id && user) {
      loadVideo(id as string, user.uid);
      checkDownloadStatus(id as string);
      checkPendingPayment(id as string, user.uid);
    }
  }, [id, user]);

  const checkDownloadStatus = async (videoId: string) => {
    const downloads = await DownloadManager.getDownloads();
    const downloaded = downloads.some(d => d.id === videoId);
    setIsDownloaded(downloaded);
  };

  const checkPendingPayment = async (videoId: string, userId: string) => {
    try {
      const q = query(
        collection(db, 'paymentRequests'), 
        where('userId', '==', userId), 
        where('videoId', '==', videoId), 
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setHasPendingPayment(!snapshot.empty);
    } catch (e) {
      console.error("Error checking pending payment:", e);
    }
  };

  const loadVideo = async (videoId: string, userId: string) => {
    try {
      const v = await videoService.getVideo(videoId);
      setVideo(v);

      if (v) {
        if (!v.isPremium || isAdmin) {
          setHasAccess(true);
        } else {
          const unlocked = await userService.hasUnlockedVideo(userId, videoId);
          setHasAccess(unlocked);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load video details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayOrPay = async () => {
    if (!video || !user) return;

    if (hasAccess) {
      if (isDownloaded) {
        router.push(`/player/${video.id}?offline=true`);
      } else {
        router.push(`/player/${video.id}`);
      }
      return;
    }
    
    if (hasPendingPayment) {
      Alert.alert('Payment Pending', 'Your payment is being verified by an administrator. You will get access once approved.');
      return;
    }

    setProcessingPayment(true);
    try {
      // Fetch the actual Admin UPI ID from settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'config'));
      const adminUpiId = settingsDoc.exists() ? settingsDoc.data().adminUpiId : 'admin@sv.in';
      
      const amount = video.price;
      const url = `upi://pay?pa=${adminUpiId}&pn=PlayNest&am=${amount}&cu=INR&tn=Unlock%20${encodeURIComponent(video.title)}`;
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        // After return, we ask the user for their UTR
        setTimeout(() => {
          setProcessingPayment(false);
          setShowUtrModal(true);
        }, 1500);
      } else {
        // Fallback if no UPI app found
        setProcessingPayment(false);
        Alert.alert(
          'No UPI App Found', 
          `Please manually pay ₹${amount} to ${adminUpiId} using any UPI app, then click 'Submit UTR' to claim access.`
        );
        setShowUtrModal(true);
      }
    } catch (error) {
      setProcessingPayment(false);
      Alert.alert('Payment Error', 'Could not process the payment intent.');
    }
  };

  const submitUtr = async () => {
    if (!utrInput.trim()) {
      Alert.alert('Error', 'Please enter a valid UTR / Transaction ID');
      return;
    }
    setProcessingPayment(true);
    try {
      await addDoc(collection(db, 'paymentRequests'), {
        userId: user!.uid,
        userEmail: user!.email,
        videoId: video!.id,
        videoTitle: video!.title,
        utr: utrInput.trim(),
        status: 'pending',
        createdAt: new Date()
      });
      setShowUtrModal(false);
      setHasPendingPayment(true);
      Alert.alert('Request Sent', 'Your payment is under review. The video will be unlocked once approved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit payment request');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownload = async () => {
    if (!video || !hasAccess) {
      Alert.alert('Access Denied', 'You must purchase this video before downloading.');
      return;
    }
    if (isDownloaded) {
      Alert.alert(
        'Downloaded Video',
        'This video is downloaded to your device.',
        [
          { text: 'Play Offline', onPress: () => router.push(`/player/${video.id}?offline=true`) },
          { text: 'Remove Download', style: 'destructive', onPress: async () => {
            const downloads = await DownloadManager.getDownloads();
            const d = downloads.find(x => x.id === video.id);
            if (d) {
              const FileSystem = require('expo-file-system/legacy');
              await FileSystem.deleteAsync(d.encryptedFilePath);
              const updated = downloads.filter(x => x.id !== video.id);
              await FileSystem.writeAsStringAsync(
                FileSystem.documentDirectory + 'downloads_metadata.json',
                JSON.stringify(updated)
              );
              setIsDownloaded(false);
              Alert.alert('Removed', 'Download removed from device.');
            }
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    try {
      const getDirectDriveLink = (link: string) => {
        if (!link) return '';
        const match = link.match(/\/d\/(.*?)\//) || link.match(/id=(.*?)&/) || link.match(/id=(.*)$/);
        const id = match ? match[1] : null;
        return id ? `https://drive.google.com/uc?export=download&id=${id}` : link;
      };
      
      const sourceUrl = getDirectDriveLink(video.driveLink);
      
      await DownloadManager.downloadAndEncryptVideo(
        video.id!,
        video.title,
        video.thumbnailUrl,
        sourceUrl,
        (progress) => {
          setDownloadProgress(progress);
        }
      );
      setIsDownloaded(true);
      Alert.alert('Download Complete', 'Video has been securely saved to your device.');
    } catch (e) {
      Alert.alert('Download Failed', 'Failed to download video.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Video not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} bounces={false}>
        <View style={styles.videoHeader}>
          {video.thumbnailUrl ? (
            <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnailImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderContainer}>
              <MonitorPlay color="#52525b" size={60} />
            </View>
          )}
          
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(9,9,11,1)']}
            style={StyleSheet.absoluteFill}
          />

          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 12 }]}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonInner}>
              <ChevronLeft color="white" size={24} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.titleText}>{video.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.priceText}>
                  {video.isPremium ? (video.price > 0 ? `₹${video.price}` : 'PREMIUM') : 'FREE'}
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.categoryText}>{video.category || 'General'}</Text>
                {hasAccess && video.isPremium && !isAdmin && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.purchasedText}>Purchased</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.primaryAction, hasAccess ? styles.playButton : styles.payButton]}
                onPress={handlePlayOrPay}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    {hasAccess ? (
                      <Play color="black" fill="black" size={20} />
                    ) : (
                      <IndianRupee color="white" size={20} />
                    )}
                    <Text style={[styles.primaryActionText, hasAccess ? styles.playText : styles.payText]}>
                      {hasAccess ? (isDownloaded ? 'Play Offline' : 'Play Now') : hasPendingPayment ? 'Approval Pending' : `Pay ₹${video.price} to Unlock`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {hasAccess && (
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={handleDownload}
                disabled={downloading}
              >
                <View style={styles.downloadButtonInner}>
                  {downloading ? (
                    <>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.downloadText}>Downloading ({Math.round(downloadProgress * 100)}%)</Text>
                    </>
                  ) : (
                    <>
                      {isDownloaded ? (
                        <CheckCircle2 color="#34d399" size={20} />
                      ) : (
                        <Download color="white" size={20} />
                      )}
                      <Text style={[styles.downloadText, isDownloaded && styles.downloadTextSuccess]}>
                        {isDownloaded ? 'Downloaded' : 'Download Video'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>
              {video.description || 'No description available for this video. Experience it now on PlayNest.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* UTR Modal */}
      <Modal
        visible={showUtrModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalSubtitle}>
              Please enter the 12-digit UPI Transaction ID (UTR) from your payment app to verify your purchase.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter UTR Number"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={utrInput}
              onChangeText={setUtrInput}
              autoCapitalize="none"
              keyboardType="number-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowUtrModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={submitUtr}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonTextSubmit}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollView: {
    flex: 1,
  },
  videoHeader: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  backButtonInner: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentContainer: {
    padding: 24,
    marginTop: -16,
    zIndex: 10,
    paddingBottom: 40,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  priceText: {
    color: '#34d399',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  metaDot: {
    color: '#52525b',
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  categoryText: {
    color: '#d4d4d8',
    fontSize: 14,
    fontWeight: '500',
  },
  purchasedText: {
    color: '#818cf8',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButton: {
    backgroundColor: 'white',
  },
  payButton: {
    backgroundColor: '#4f46e5',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.5)',
  },
  primaryActionText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  playText: {
    color: 'black',
  },
  payText: {
    color: 'white',
  },
  downloadButton: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  downloadButtonInner: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Replaces BlurView
  },
  downloadText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  downloadTextSuccess: {
    color: '#34d399',
  },
  aboutContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 24,
    marginTop: 24,
  },
  aboutTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  aboutText: {
    color: '#a1a1aa',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: 'white',
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalButtonSubmit: {
    backgroundColor: '#4f46e5',
  },
  modalButtonTextCancel: {
    color: '#d4d4d8',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonTextSubmit: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
