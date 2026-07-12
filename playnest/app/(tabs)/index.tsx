import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MonitorPlay, Play, Info, Film } from 'lucide-react-native';
import { videoService } from '../../services/firebase/videoService';
import { Video } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function TabOneScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadVideos = async () => {
    try {
      const v = await videoService.getVideos();
      setVideos(v);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load videos. Please pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVideos();
  }, []);

  // Group videos by category
  const groupedVideos = videos.reduce((acc, video) => {
    const cat = video.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  const featuredVideo = videos.length > 0 ? videos[0] : null;

  return (
    <View style={styles.container}>
      {/* Ambient Mesh Gradient Background for Glass effect */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#1e1b4b', 'transparent']} // Indigo glow
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

      {/* Absolute Glassy Header (Solid replacing BlurView) */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerGlass}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Play color="white" size={16} fill="white" style={styles.playIconOffset} />
              </View>
              <Text style={styles.logoText}>
                Play<Text style={styles.logoTextHighlight}>Nest</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="white" 
            progressViewOffset={insets.top + 50} 
          />
        }
      >
        {featuredVideo ? (
          <TouchableOpacity 
            style={styles.featuredContainer}
            onPress={() => router.push(`/video/${featuredVideo.id}`)}
            activeOpacity={0.9}
          >
            <View style={StyleSheet.absoluteFill}>
              {featuredVideo.thumbnailUrl ? (
                <Image 
                  source={{ uri: featuredVideo.thumbnailUrl }} 
                  style={styles.featuredImage}
                  resizeMode="cover" 
                />
              ) : (
                <View style={styles.featuredPlaceholder}>
                  <MonitorPlay color="#52525b" size={60} />
                </View>
              )}
            </View>
            
            <LinearGradient
              colors={['transparent', 'rgba(9,9,11,0.2)', '#09090b']}
              style={styles.featuredGradient}
            />
            
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {featuredVideo.title}
              </Text>
              <View style={styles.featuredBadges}>
                {featuredVideo.isPremium ? (
                  <View style={styles.badgePremium}>
                    <Text style={styles.badgeTextPremium}>Premium</Text>
                  </View>
                ) : (
                  <View style={styles.badgeFree}>
                    <Text style={styles.badgeTextFree}>Free</Text>
                  </View>
                )}
                <Text style={styles.featuredCategory}>{featuredVideo.category || 'General'}</Text>
              </View>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => router.push(`/player/${featuredVideo.id}`)}
                >
                  <Play color="black" size={20} fill="black" />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => router.push(`/video/${featuredVideo.id}`)}
                >
                  <View style={styles.detailsButtonContent}>
                    <Info color="white" size={20} />
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Film color="#52525b" size={40} />
            </View>
            <Text style={styles.emptyTitle}>It's quiet here</Text>
            <Text style={styles.emptySubtext}>There are no videos available yet. Check back soon or upload content via the Admin Dashboard.</Text>
          </View>
        )}

        <View style={styles.categoriesContainer}>
          {Object.entries(groupedVideos).map(([category, catVideos]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {catVideos.map((video) => (
                  <TouchableOpacity 
                    key={video.id} 
                    style={styles.videoCard}
                    onPress={() => router.push(`/video/${video.id}`)}
                  >
                    {video.thumbnailUrl ? (
                      <Image source={{ uri: video.thumbnailUrl }} style={styles.videoImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.videoPlaceholder}>
                        <MonitorPlay color="#52525b" size={30} />
                      </View>
                    )}
                    {video.isPremium && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                    {/* Subtle gradient at bottom for depth */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.videoGradient}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>
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
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerGlass: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  logoText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoTextHighlight: {
    color: '#e50914',
  },
  scrollView: {
    flex: 1,
  },
  featuredContainer: {
    width: '100%',
    height: height * 0.65,
    marginBottom: 40,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  featuredPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181b',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: 'center',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuredBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  badgePremium: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badgeTextPremium: {
    color: '#facc15',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  badgeFree: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeTextFree: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  featuredCategory: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  playButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 160,
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  detailsButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsButtonContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 160,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#71717a',
    fontSize: 16,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingBottom: 128,
  },
  categorySection: {
    marginBottom: 40,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
  },
  videoCard: {
    marginRight: 16,
    width: 128,
    aspectRatio: 2/3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    elevation: 2,
  },
  proBadgeText: {
    color: 'black',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  videoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
});
