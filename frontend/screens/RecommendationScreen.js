import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { getPlantRecommendations } from '../services/geminiService';

export default function RecommendationScreen() {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  async function handleRecommend() {
    if (zipCode.length !== 5 || isNaN(zipCode)) {
      Alert.alert('Invalid', 'Please enter a valid 5-digit zip code.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const data = await getPlantRecommendations(zipCode);
      setResults(data.result);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch recommendations. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plant Recommendations</Text>
      <Text style={styles.subtitle}>Enter your zip code to get native plant recommendations for your area</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter zip code"
        placeholderTextColor="#555"
        keyboardType="numeric"
        maxLength={5}
        value={zipCode}
        onChangeText={setZipCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleRecommend}>
        <Text style={styles.buttonText}>Get Recommendations</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Finding plants for your area...</Text>
        </View>
      )}

      {results && results.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.problemRow}>
            <Text style={styles.problemLabel}>Problem</Text>
            <Text style={styles.problemText}>{item.problem}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.actionText}>{item.action}</Text>
          <Text style={styles.impactText}>{item.impact}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#e0e0e0', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 18 },
  input: {
    backgroundColor: '#16213e',
    color: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  button: {
    backgroundColor: '#ff6b35',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: { color: '#e0e0e0', fontWeight: '600', fontSize: 16 },
  loadingContainer: { alignItems: 'center', gap: 12, marginBottom: 24 },
  loadingText: { color: '#888', fontSize: 14 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  problemRow: { gap: 4 },
  problemLabel: { color: '#ff6b35', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  problemText: { color: '#e0e0e0', fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#2a2a4e' },
  actionText: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  impactText: { color: '#888', fontSize: 13, lineHeight: 18 },
});