import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { identifyPlant } from '../services/geminiService';

// swap this for any image in your assets folder
const TEST_IMAGE = require('../../assets/icon.png');

export default function IdentificationScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // load the local asset and convert to base64
      const asset = await Asset.fromModule(TEST_IMAGE).downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: 'base64',  // ← use the string directly instead of FileSystem.EncodingType.Base64
      });

      console.log('base64 length:', base64.length); // confirm it loaded

      const data = await identifyPlant(base64, 'Chicago, IL');
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

      <Image source={TEST_IMAGE} style={styles.testImage} />

      <TouchableOpacity style={styles.button} onPress={handleTest}>
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
  button: { backgroundColor: '#ff6b35', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#e0e0e0', fontWeight: '600', fontSize: 16 },
  error: { color: '#ff4444', marginTop: 16, fontSize: 14 },
  resultCard: { backgroundColor: '#16213e', borderRadius: 14, padding: 20, marginTop: 24, gap: 10 },
  plantName: { fontSize: 22, fontWeight: '700', color: '#e0e0e0' },
  detail: { color: '#888', fontSize: 14 },
  actionCard: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, gap: 4 },
  actionText: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  impactText: { color: '#888', fontSize: 13 },
});