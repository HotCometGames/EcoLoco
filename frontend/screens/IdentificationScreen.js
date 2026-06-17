import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { identifyPlant } from '../services/geminiService';

export default function IdentificationScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [zipCode, setZipCode] = useState('');

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  }

  async function handleTest() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const base64 = photo.base64;

      console.log('base64 length:', base64.length); // confirm it loaded

      const data = await identifyPlant(base64, zipCode);
      console.log('result:', data);
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Test Identification</Text>

      {photo && <Image source={{ uri: photo.uri }} style={styles.testImage} />}

      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={zipCode}
        onChangeText={(text) => setZipCode(text.replace(/[^0-9]/g, '').slice(0, 5))}
        placeholder="Enter ZIP code"
        placeholderTextColor="#888"
        keyboardType="numeric"
        maxLength={5}
      />

      <TouchableOpacity
        style={[styles.button, (!photo || zipCode.length === 0) && styles.buttonDisabled]}
        onPress={handleTest}
        disabled={!photo || zipCode.length === 0}
      >
        <Text style={styles.buttonText}>Run Identify</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 24 }} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.plantName}>{result.plant_name}</Text>
          <Text style={styles.detail}>Native: {result.is_native ? 'Yes' : 'No'}</Text>
          <Text style={styles.detail}>Confidence: {Math.round(result.confidence * 100)}%</Text>
          {result.actions?.map((item, i) => (
            <View key={i} style={styles.actionCard}>
              <Text style={styles.actionText}>{item.action}</Text>
              <Text style={styles.impactText}>{item.impact}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '700', color: '#e0e0e0', marginBottom: 20 },
  testImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 20, resizeMode: 'cover' },
  button: { backgroundColor: '#ff6b35', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#7a4029' },
  buttonText: { color: '#e0e0e0', fontWeight: '600', fontSize: 16 },
  input: {
    backgroundColor: '#16213e',
    color: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  error: { color: '#ff4444', marginTop: 16, fontSize: 14 },
  resultCard: { backgroundColor: '#16213e', borderRadius: 14, padding: 20, marginTop: 24, gap: 10 },
  plantName: { fontSize: 22, fontWeight: '700', color: '#e0e0e0' },
  detail: { color: '#888', fontSize: 14 },
  actionCard: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, gap: 4 },
  actionText: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  impactText: { color: '#888', fontSize: 13 },
});