import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StatusBar, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { ArrowLeft, Download } from 'lucide-react-native';
import { DownloadManager } from '../../services/downloads/DownloadManager';

export default function PlayerScreen() {
  const { id, offline } = useLocalSearchParams();
  const router = useRouter();
  const [videoData, setVideoData] = useState<any>(null);

  // Helper to get raw download link from a drive url
  const getDirectDriveLink = (link: string) => {
    if (!link) return '';
    const match = link.match(/\/d\/(.*?)\//) || link.match(/id=(.*?)&/) || link.match(/id=(.*)$/);
    const id = match ? match[1] : null;
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : link;
  };
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Use the google drive export link as a stream source, or a local decrypted file if offline
  const [videoSource, setVideoSource] = useState<string | null>(null);

  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    // Lock to landscape when player opens
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      // Revert to portrait when leaving
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      if (offline === 'true' && typeof id === 'string') {
        // Cleanup decrypted file to ensure it's not exposed
        DownloadManager.cleanupPlaybackFile(id);
      }
    };
  }, []);

  useEffect(() => {
    if (id) {
      if (offline === 'true') {
        prepareOfflinePlayback();
      } else {
        fetchVideoData();
      }
    }
  }, [id, offline]);

  const prepareOfflinePlayback = async () => {
    try {
      const localPath = await DownloadManager.decryptForPlayback(id as string);
      if (localPath) {
        setVideoSource(localPath);
        setLoading(false); // Do not block UI for offline playback
        // Fetch metadata in the background
        fetchVideoData();
      } else {
        Alert.alert('Error', 'Offline video not found or corrupted.');
        router.back();
      }
    } catch (error) {
      console.error(error);
      router.back();
    }
  };

  const fetchVideoData = async () => {
    try {
      const docRef = doc(db, 'videos', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoData(data);
        if (offline !== 'true' && data.driveLink) {
          setVideoSource(getDirectDriveLink(data.driveLink));
        }
      }
    } catch (error) {
      console.error("Error fetching video:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoData) return;
    
    // Switch to portrait so they can see the alert/progress better if they want, 
    // or keep landscape. Let's keep it landscape but show an alert.
    setDownloading(true);
    setProgress(0);
    try {
      await DownloadManager.downloadAndEncryptVideo(
        id as string, 
        videoData.title, 
        videoData.thumbnailUrl, 
        getDirectDriveLink(videoData.driveLink),
        (p) => setProgress(p)
      );
      Alert.alert('Success', 'Video downloaded securely for offline viewing.');
    } catch (error) {
      Alert.alert('Download Failed', 'Could not download the video.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading || (!videoSource && offline === 'true')) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!videoData && !videoSource) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Video not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft color="white" size={24} />
      </TouchableOpacity>

      {offline !== 'true' && (
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          ) : (
            <Download color="white" size={24} />
          )}
        </TouchableOpacity>
      )}

      {videoSource && (
        <VideoView
          style={{ flex: 1 }}
          player={player}
          nativeControls={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  goBackButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  goBackText: {
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 32,
    zIndex: 50,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
  },
  downloadButton: {
    position: 'absolute',
    top: 32,
    right: 32,
    zIndex: 50,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  }
});
