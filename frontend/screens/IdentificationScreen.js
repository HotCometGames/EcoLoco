import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { identifyPlant } from '../services/geminiService';

export default function IdentificationScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to your photo library to identify plants.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],  // ← changed from MediaTypeOptions.Images
      base64: true,
      quality: 0.7,
    });

    console.log('picker result:', picked); // ← add this to see what comes back

    if (!picked.canceled) {
      console.log('base64 length:', picked.assets[0]?.base64?.length); // ← check base64 exists
      submitImage(picked.assets[0].base64);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow camera access to identify plants.');
      return;
    }

    const photo = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (!photo.canceled) {
      submitImage(photo.assets[0].base64);
    }
  }

  async function submitImage(base64Image) {
    setLoading(true);
    setResult(null);
    try {
      const data = await identifyPlant(base64Image);
      setResult(data);
    } catch (err) {
      Alert.alert('Error', 'Could not identify plant. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Identify a Plant</Text>
      <Text style={styles.subtitle}>Take or upload a photo to get started</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>📷  Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handlePickImage}>
          <Text style={styles.buttonText}>🖼  Upload</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Identifying plant...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>

          {/* Plant name */}
          <Text style={styles.plantName}>{result.plant_name}</Text>

          {/* Native badge */}
          <View style={[styles.badge, result.is_native ? styles.badgeNative : styles.badgeNonNative]}>
            <Text style={styles.badgeText}>
              {result.is_native ? '✅ Native Species' : '⚠️ Non-Native Species'}
            </Text>
          </View>

          {/* Confidence */}
          <View style={styles.confidenceRow}>
            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.confidence}>{Math.round(result.confidence * 100)}%</Text>
          </View>

          {/* Actions */}
          {result.is_native && result.actions?.length > 0 && (
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Recommended Actions</Text>
              {result.actions.map((item, index) => (
                <View key={index} style={styles.actionCard}>
                  <Text style={styles.actionText}>{item.action}</Text>
                  <Text style={styles.impactText}>{item.impact}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    backgroundColor: '#ff6b35',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  buttonText: {
    color: '#e0e0e0',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 20,
    gap: 16,
  },
  plantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeNative: {
    backgroundColor: '#1a3a2e',
  },
  badgeNonNative: {
    backgroundColor: '#3a1a1a',
  },
  badgeText: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    paddingTop: 16,
  },
  label: {
    color: '#888',
    fontSize: 14,
  },
  confidence: {
    color: '#ff6b35',
    fontSize: 20,
    fontWeight: '700',
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    paddingTop: 16,
    gap: 10,
  },
  actionsTitle: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  actionText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
  },
  impactText: {
    color: '#888',
    fontSize: 13,
  },
});