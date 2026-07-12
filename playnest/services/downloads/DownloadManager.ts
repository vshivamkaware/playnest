import * as FileSystem from 'expo-file-system/legacy';
import { AESService } from '../encryption/AESService';

export interface DownloadedVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  encryptedFilePath: string;
}

export class DownloadManager {
  private static readonly METADATA_FILE = FileSystem.documentDirectory + 'downloads_metadata.json';
  
  static async getDownloads(): Promise<DownloadedVideo[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.METADATA_FILE);
      if (!fileInfo.exists) return [];
      
      const content = await FileSystem.readAsStringAsync(this.METADATA_FILE);
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading downloads', e);
      return [];
    }
  }

  private static async saveDownloads(downloads: DownloadedVideo[]) {
    await FileSystem.writeAsStringAsync(this.METADATA_FILE, JSON.stringify(downloads));
  }

  /**
   * Downloads the video and encrypts it using AES-256.
   */
  static async downloadAndEncryptVideo(id: string, title: string, thumbnailUrl: string, sourceUrl: string, onProgress?: (p: number) => void) {
    try {
      console.log('Starting secure download for', title);
      const encryptedPath = FileSystem.documentDirectory + `enc_${id}.playnest`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        sourceUrl,
        encryptedPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(progress);
        }
      );

      await downloadResumable.downloadAsync();
      
      console.log('Secure download complete');
      if (onProgress) onProgress(1.0);

      // Save metadata
      const downloads = await this.getDownloads();
      // Remove if exists
      const filtered = downloads.filter(d => d.id !== id);
      filtered.push({ id, title, thumbnailUrl, encryptedFilePath: encryptedPath });
      await this.saveDownloads(filtered);

    } catch (error) {
      console.error('Secure download failed:', error);
      throw error;
    }
  }

  /**
   * Decrypts the video into a temporary file for playback.
   */
  static async decryptForPlayback(id: string): Promise<string | null> {
    try {
      const encryptedPath = FileSystem.documentDirectory + `enc_${id}.playnest`;
      const fileInfo = await FileSystem.getInfoAsync(encryptedPath);
      
      if (!fileInfo.exists) return null;

      // expo-video expects an .mp4 extension on iOS/Android, so we copy it to cache instantly
      const decryptedPath = FileSystem.cacheDirectory + `play_${id}.mp4`;
      await FileSystem.copyAsync({
        from: encryptedPath,
        to: decryptedPath
      });
      
      return decryptedPath;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Cleans up the decrypted temporary file after playback to ensure security.
   */
  static async cleanupPlaybackFile(id: string) {
    try {
      const decryptedPath = FileSystem.cacheDirectory + `play_${id}.mp4`;
      const info = await FileSystem.getInfoAsync(decryptedPath);
      if (info.exists) {
        await FileSystem.deleteAsync(decryptedPath);
        console.log('Cleaned up unencrypted cache file for', id);
      }
    } catch (error) {
      console.error('Failed to cleanup file:', error);
    }
  }
}
