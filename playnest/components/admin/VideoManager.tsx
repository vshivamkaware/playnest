import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Switch, Dimensions, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Plus, X, Trash2, Film, CheckCircle, Eye, EyeOff, Edit2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function VideoManager() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { height } = Dimensions.get('window');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [category, setCategory] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchVideos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      Alert.alert('Error', 'Failed to fetch videos. Please check your permissions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos(true);
  }, [fetchVideos]);

  const handleSaveVideo = async () => {
    if (!title || !driveLink || !thumbnailUrl) {
      Alert.alert('Error', 'Title, Drive Link, and Thumbnail URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const videoData = {
        title,
        description,
        thumbnailUrl,
        driveLink,
        category: category.trim(),
        isPremium,
        price: isPremium ? Number(price) || 0 : 0,
        isHidden,
      };

      if (editingId) {
        await updateDoc(doc(db, 'videos', editingId), videoData);
      } else {
        await addDoc(collection(db, 'videos'), {
          ...videoData,
          createdAt: serverTimestamp(),
        });
      }
      
      setModalVisible(false);
      resetForm();
      fetchVideos(true);
    } catch (error) {
      console.error("Error saving video:", error);
      Alert.alert('Error', 'Failed to save video.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (video: any) => {
    setEditingId(video.id);
    setTitle(video.title || '');
    setDescription(video.description || '');
    setThumbnailUrl(video.thumbnailUrl || '');
    setDriveLink(video.driveLink || '');
    setCategory(video.category || '');
    setIsPremium(video.isPremium || false);
    setPrice(video.price ? video.price.toString() : '');
    setIsHidden(video.isHidden || false);
    setModalVisible(true);
  };

  const handleToggleVisibility = async (video: any) => {
    try {
      const newStatus = !video.isHidden;
      await updateDoc(doc(db, 'videos', video.id), { isHidden: newStatus });
      fetchVideos(true); // refresh
    } catch (error) {
      console.error("Error toggling visibility:", error);
      Alert.alert('Error', 'Failed to change video visibility.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Video', 'Are you sure you want to delete this video?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'videos', id));
            fetchVideos(true);
          } catch (error) {
            console.error("Error deleting video:", error);
            Alert.alert('Error', 'Failed to delete video.');
          }
        }
      }
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    setDriveLink('');
    setCategory('');
    setIsPremium(false);
    setPrice('');
    setIsHidden(false);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Film color="#71717a" size={40} />
      </View>
      <Text style={styles.emptyText}>No Content Yet</Text>
      <Text style={styles.emptySubText}>
        Tap the golden plus button below to add your first video to PlayNest.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <View style={styles.videoInfoContainer}>
          <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, item.isPremium ? styles.badgePremium : styles.badgeFree]}>
              <Text style={[styles.badgeText, item.isPremium ? styles.badgeTextPremium : styles.badgeTextFree]}>
                {item.isPremium ? `Premium (₹${item.price})` : 'Free'}
              </Text>
            </View>
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category || 'No Category'}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => handleEdit(item)} 
            style={[styles.deleteButton, { marginRight: 8, backgroundColor: 'rgba(255,255,255,0.1)' }]}
            activeOpacity={0.7}
          >
            <Edit2 color="#34d399" size={20} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)} 
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Trash2 color="#fca5a5" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#f59e0b" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
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

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          style={StyleSheet.absoluteFill}
        />
        <Plus color="white" size={32} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: height * 0.92 }]}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.15)', 'transparent']}
              style={styles.modalGradient}
            />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Video' : 'New Video'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X color="white" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[]}
              keyExtractor={() => "dummy"}
              renderItem={() => null}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
              ListHeaderComponent={
                <View style={styles.formContainer}>
                  <GlassInput label="Title *" value={title} onChange={setTitle} placeholder="Video Title" />
                  <GlassInput label="Google Drive Link *" value={driveLink} onChange={setDriveLink} placeholder="https://drive.google.com/file/d/..." />
                  <GlassInput label="Thumbnail URL *" value={thumbnailUrl} onChange={setThumbnailUrl} placeholder="https://..." />
                  <GlassInput label="Category" value={category} onChange={setCategory} placeholder="Action, Documentary, 4K" />

                  <View style={[styles.premiumToggleContainer, isPremium ? styles.premiumToggleActive : styles.premiumToggleInactive]}>
                    <View style={styles.premiumToggleRow}>
                      <View style={styles.premiumToggleInfo}>
                        <View style={[styles.premiumIconContainer, isPremium ? styles.premiumIconActive : styles.premiumIconInactive]}>
                          <CheckCircle color={isPremium ? "#f59e0b" : "#71717a"} size={20} />
                        </View>
                        <View>
                          <Text style={[styles.premiumToggleTitle, isPremium ? styles.textAmber : styles.textWhite]}>
                            PREMIUM
                          </Text>
                          <Text style={styles.premiumToggleSubtitle}>
                            Monetize this content
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={isPremium}
                        onValueChange={setIsPremium}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(245,158,11,0.5)' }}
                        thumbColor={isPremium ? '#f59e0b' : '#ffffff'}
                      />
                    </View>
                  </View>

                  <View style={[styles.premiumToggleContainer, styles.premiumToggleInactive, { marginTop: 12 }]}>
                    <View style={styles.premiumToggleRow}>
                      <View style={styles.premiumToggleInfo}>
                        <View style={[styles.premiumIconContainer, styles.premiumIconInactive]}>
                          {isHidden ? <EyeOff color="#71717a" size={20} /> : <Eye color="#71717a" size={20} />}
                        </View>
                        <View>
                          <Text style={[styles.premiumToggleTitle, styles.textWhite]}>
                            HIDDEN
                          </Text>
                          <Text style={styles.premiumToggleSubtitle}>
                            Hide from normal users
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={isHidden}
                        onValueChange={setIsHidden}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(156,163,175,0.5)' }}
                        thumbColor={isHidden ? '#9ca3af' : '#ffffff'}
                      />
                    </View>
                  </View>

                  {isPremium && (
                    <GlassInput label="Price (₹) *" value={price} onChange={setPrice} placeholder="e.g. 99" keyboardType="numeric" />
                  )}
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="About this video..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      multiline
                      numberOfLines={4}
                      style={[styles.inputField, styles.textArea]}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveVideo}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={submitting ? ['#6366f1', '#4f46e5'] : ['#818cf8', '#4f46e5']}
                      style={styles.saveButtonGradient}
                    >
                      <View style={styles.saveButtonContent}>
                        {submitting ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <CheckCircle color="white" size={22} />
                            <Text style={styles.saveButtonText}>Save Video</Text>
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function GlassInput({ label, value, onChange, placeholder, keyboardType = 'default' }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        keyboardType={keyboardType}
        style={styles.inputField}
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
  emptySubText: {
    textAlign: 'center',
    color: '#a1a1aa',
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
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
  videoInfoContainer: {
    flex: 1,
    marginRight: 16,
  },
  titleText: {
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
  badgePremium: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeFree: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextPremium: {
    color: '#fbbf24',
  },
  badgeTextFree: {
    color: '#ffffff',
  },
  categoryText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  fab: {
    position: 'absolute',
    bottom: 112,
    right: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  modalGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formContent: {
    padding: 24,
    paddingBottom: 100,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '700',
    color: '#a1a1aa',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
  },
  inputField: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  premiumToggleContainer: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
  },
  premiumToggleActive: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  premiumToggleInactive: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  premiumToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumIconActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  premiumIconInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumToggleTitle: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  textAmber: {
    color: '#fbbf24',
  },
  textWhite: {
    color: '#ffffff',
  },
  premiumToggleSubtitle: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  saveButtonGradient: {
    paddingVertical: 16,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});
