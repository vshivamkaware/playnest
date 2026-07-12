import * as FileSystem from 'expo-file-system';
import { Video } from '../types';

// We store downloads in document directory so they are persistent but not easily accessible to other apps
const DOWNLOAD_DIR = (FileSystem as any).documentDirectory + 'playnest_downloads/';

export const downloadService = {
  async init() {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }
  },

  async downloadVideo(video: Video, onProgress?: (progress: number) => void) {
    await this.init();
    
    // In a real app we'd convert drive link to a direct download link.
    // Assuming driveLink is a direct URL or handled elsewhere
    const fileUri = DOWNLOAD_DIR + video.id + '.mp4';
    
    const downloadResumable = FileSystem.createDownloadResumable(
      video.driveLink,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) onProgress(progress);
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      return result?.uri;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async isDownloaded(videoId: string): Promise<boolean> {
    const fileUri = DOWNLOAD_DIR + videoId + '.mp4';
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  },

  async getLocalVideoUri(videoId: string): Promise<string | null> {
    const fileUri = DOWNLOAD_DIR + videoId + '.mp4';
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists ? fileUri : null;
  },

  async deleteVideo(videoId: string) {
    const fileUri = DOWNLOAD_DIR + videoId + '.mp4';
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  }
};
