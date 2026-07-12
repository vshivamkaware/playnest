import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';
import { useColorScheme } from 'react-native';
import { getOrCreateDeviceId } from '../../utils/device';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const deviceId = await getOrCreateDeviceId();
      
      // Store user metadata in Firestore
      // The first device they register with is automatically approved
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        deviceId: deviceId,
        deviceStatus: 'APPROVED',
        isAdmin: user.email === 'admin@sv.in'
      });

      // AuthProvider will detect the change and route to (tabs)
    } catch (err: any) {
      setError(err.message || 'Failed to register');
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
          Create an account.
        </Text>
        <Text className={`text-lg font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Join PlayNest today
        </Text>
      </View>

      <View className="space-y-4">
        {error ? (
          <View className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
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

        <View className="mb-4">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Password</Text>
          <TextInput
            className={`w-full px-4 py-3.5 rounded-xl text-base font-medium ${
              isDark 
                ? 'bg-zinc-900/80 text-white border-zinc-800 focus:border-indigo-500' 
                : 'bg-zinc-50 text-zinc-900 border-gray-200 focus:border-indigo-600'
            } border`}
            placeholder="Choose a strong password"
            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mb-8">
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Confirm Password</Text>
          <TextInput
            className={`w-full px-4 py-3.5 rounded-xl text-base font-medium ${
              isDark 
                ? 'bg-zinc-900/80 text-white border-zinc-800 focus:border-indigo-500' 
                : 'bg-zinc-50 text-zinc-900 border-gray-200 focus:border-indigo-600'
            } border`}
            placeholder="Confirm your password"
            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleRegister}
          disabled={loading}
          className={`w-full py-3.5 mt-6 rounded-xl items-center flex-row justify-center shadow-sm ${
            isDark ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-indigo-600 active:bg-indigo-700'
          } ${loading ? 'opacity-70' : 'opacity-100'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white text-base font-semibold">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-8">
        <Text className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
          Already have an account?{' '}
        </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-indigo-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
