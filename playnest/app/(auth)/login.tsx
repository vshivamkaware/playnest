import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';
import { useColorScheme } from 'react-native';
import { getOrCreateDeviceId } from '../../utils/device';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Bootstrap document if it doesn't exist
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const deviceId = await getOrCreateDeviceId();
        await setDoc(userDocRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          deviceId: deviceId,
          deviceStatus: 'APPROVED',
          isAdmin: user.email === 'admin@sv.in'
        });
      }
      
      // The onAuthStateChanged listener in AuthProvider will handle routing
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 justify-center px-8 ${isDark ? 'bg-[#09090b]' : 'bg-white'}`}
    >
      <View className="mb-12">
        <Text className={`text-3xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Welcome back.
        </Text>
        <Text className={`text-lg font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Sign in to continue to PlayNest
        </Text>
      </View>

      <View className="space-y-4">
        {error ? (
          <View className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        ) : null}

        <View>
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Email</Text>
          <TextInput
            className={`w-full px-4 py-3.5 rounded-xl text-base font-medium ${
              isDark 
                ? 'bg-zinc-900/80 text-white border-zinc-800 focus:border-indigo-500' 
                : 'bg-zinc-50 text-zinc-900 border-gray-200 focus:border-indigo-600'
            } border`}
            placeholder="Enter your email"
            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Password</Text>
          <TextInput
            className={`w-full px-4 py-3.5 rounded-xl text-base font-medium ${
              isDark 
                ? 'bg-zinc-900/80 text-white border-zinc-800 focus:border-indigo-500' 
                : 'bg-zinc-50 text-zinc-900 border-gray-200 focus:border-indigo-600'
            } border`}
            placeholder="Enter your password"
            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className={`w-full py-3.5 mt-6 rounded-xl items-center flex-row justify-center shadow-sm ${
            isDark ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-indigo-600 active:bg-indigo-700'
          } ${loading ? 'opacity-70' : 'opacity-100'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white text-base font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-8">
        <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
          Don't have an account?{' '}
        </Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text className="text-indigo-500 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
