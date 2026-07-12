import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { getOrCreateDeviceId } from '../../utils/device';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { useColorScheme } from 'react-native';
import { signOut } from 'firebase/auth';

export default function DeviceVerificationScreen() {
  const { deviceStatus, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRequestAccess = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      await updateDoc(doc(db, 'users', user.uid), {
        newDeviceId: deviceId,
        deviceStatus: 'PENDING',
      });
      // AuthProvider's onSnapshot will update the store and UI will reflect PENDING state
    } catch (error) {
      console.error("Error requesting access:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <View className={`flex-1 justify-center items-center px-8 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
      <View className={`w-full p-8 rounded-3xl ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200'}`}>
        <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Device Verification
        </Text>
        
        {deviceStatus === 'UNBOUND' && (
          <View>
            <Text className={`text-base text-center mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              You are trying to log in from an unauthorized device. Due to our strict security policy, you must request access for this device.
            </Text>
            
            <TouchableOpacity 
              onPress={handleRequestAccess}
              disabled={loading}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${
                isDark ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-indigo-600 active:bg-indigo-700'
              } ${loading ? 'opacity-70' : 'opacity-100'}`}
            >
              {loading ? <ActivityIndicator color="white" className="mr-2" /> : null}
              <Text className="text-white text-base font-semibold">Request Access</Text>
            </TouchableOpacity>
          </View>
        )}

        {deviceStatus === 'PENDING' && (
          <View className="items-center">
            <ActivityIndicator size="large" color="#4f46e5" className="mb-6" />
            <Text className={`text-base text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Your request is pending admin approval. You will be granted access automatically once approved.
            </Text>
          </View>
        )}

        {deviceStatus === 'REJECTED' && (
          <View>
            <View className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mb-6">
              <Text className="text-red-500 text-center font-medium">Your request for this device was rejected by the admin.</Text>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={handleSignOut} className="mt-8 py-3">
          <Text className="text-red-500 font-semibold text-center">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
