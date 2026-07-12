import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'playnest_device_id';

export async function getOrCreateDeviceId(): Promise<string> {
  let uniqueId = '';
  
  if (Platform.OS === 'android') {
    uniqueId = Application.getAndroidId() || '';
  } else if (Platform.OS === 'ios') {
    uniqueId = await Application.getIosIdForVendorAsync() || '';
  }

  const modelName = Device.modelName ? Device.modelName.replace(/\s+/g, '_') : 'UnknownDevice';
  
  // If we have a reliable hardware ID, use it directly (survives app uninstall)
  if (uniqueId) {
    return `${modelName}_${uniqueId}`;
  }

  // Fallback if hardware ID is unavailable (e.g. web, or some simulators)
  let fallbackId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!fallbackId) {
    fallbackId = `${modelName}_fallback_${Crypto.randomUUID()}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, fallbackId);
  }
  
  return fallbackId;
}
