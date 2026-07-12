import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { CheckCircle2, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function SettingsManager() {
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adminUpiId) setUpiId(data.adminUpiId);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!upiId) {
      Alert.alert('Error', 'UPI ID cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        adminUpiId: upiId,
        updatedAt: new Date()
      }, { merge: true });
      Alert.alert('Success', 'Settings saved securely.');
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#f59e0b" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Settings color="#f59e0b" size={24} />
          <Text style={styles.cardTitle}>Payment Configuration</Text>
        </View>

        <Text style={styles.description}>
          Set your Master UPI ID below. When users attempt to purchase premium videos, they will be redirected to their UPI app to pay this address. 
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Admin UPI ID</Text>
          <TextInput
            value={upiId}
            onChangeText={setUpiId}
            placeholder="e.g. admin@upi or 9999999999@paytm"
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.inputField}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={saving ? ['#d97706', '#b45309'] : ['#f59e0b', '#d97706']}
            style={styles.saveButtonGradient}
          >
            <View style={styles.saveButtonContent}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <CheckCircle2 color="white" size={20} />
                  <Text style={styles.saveButtonText}>Save Configuration</Text>
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 35, 0.8)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  description: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#d4d4d8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: 'white',
    padding: 16,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  }
});
