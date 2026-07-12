import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, StyleSheet, Platform, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { DownloadManager, DownloadedVideo } from '../../services/downloads/DownloadManager';
import { Image } from 'expo-image';
import { Play, Trash2, DownloadCloud } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadedVideo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadDownloads = async () => {
    try {
      const data = await DownloadManager.getDownloads();
      setDownloads(data);
    } catch (error) {
      console.error('Failed to load downloads', error);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDownloads();
    setRefreshing(false);
  }, []);

  const handlePlay = (id: string) => {
    router.push(`/player/${id}?offline=true`);
  };

  const handleDelete = async (id: string, path: string) => {
    try {
      await FileSystem.deleteAsync(path);
      const updated = downloads.filter(d => d.id !== id);
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'downloads_metadata.json', 
        JSON.stringify(updated)
      );
      setDownloads(updated);
    } catch (error) {
      console.error('Failed to delete download', error);
      Alert.alert('Error', 'Failed to delete the download.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Ambient Mesh Gradient Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#064e3b', 'transparent']} // Emerald glow
          style={styles.gradientTop}
        />
        <LinearGradient
          colors={['transparent', '#022c22', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientMiddle}
        />
        <LinearGradient
          colors={['transparent', '#000000']}
          style={styles.gradientBottom}
        />
      </View>

      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Downloads</Text>
      </View>

      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <DownloadCloud color="#34d399" size={48} />
            </View>
            <Text style={styles.emptyTitle}>
              No downloads yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Videos you download will appear here. They are securely encrypted and can only be played in PlayNest offline.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => handlePlay(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.itemInner}>
              <DownloadItemContent item={item} onDelete={() => handleDelete(item.id, item.encryptedFilePath)} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function DownloadItemContent({ item, onDelete }: any) {
  return (
    <>
      <View style={styles.thumbnailContainer}>
        <Image
          source={item.thumbnailUrl}
          style={styles.thumbnailImage}
          contentFit="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <View style={styles.playIconContainer}>
            <Play fill="white" color="white" size={20} style={styles.playIconOffset} />
          </View>
        </View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Ready Offline
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 color="#fca5a5" size={18} />
      </TouchableOpacity>
    </>
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
    height: '50%',
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
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 128,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: 'rgba(209, 250, 229, 0.6)',
    lineHeight: 24,
    fontWeight: '500',
    fontSize: 16,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(30, 30, 35, 0.8)', // Replaces BlurView
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  itemInner: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 120,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playIconOffset: {
    marginLeft: 3,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: 'white',
    letterSpacing: 0,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34d399',
    marginRight: 8,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34d399',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deleteButton: {
    padding: 12,
    marginLeft: 4,
  },
});
