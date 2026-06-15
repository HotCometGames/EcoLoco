import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'

export default function IdentificationScreen()
{
    <Text style={styles.featuredEmoji}>🌿</Text>
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1f0f' },
  header: { padding: 20, paddingTop: 48 },
  appName: { fontSize: 11, color: '#4a7a4e', letterSpacing: 2, fontWeight: '600', marginBottom: 8 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#e8f5e4', lineHeight: 34 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  locDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3a9e52' },
  locText: { fontSize: 12, color: '#4a7a4e' },
  searchBar: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#152418', borderWidth: 1, borderColor: '#1f3a22', borderRadius: 12, padding: 12 },
  searchText: { fontSize: 13, color: '#2d5530' },
  sectionLabel: { fontSize: 11, color: '#4a7a4e', letterSpacing: 1.5, fontWeight: '600', paddingHorizontal: 20, marginBottom: 10 },
  featured: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#152418', borderWidth: 1, borderColor: '#1f3a22', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  featuredIcon: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#1a3d1e', alignItems: 'center', justifyContent: 'center' },
  featuredEmoji: { fontSize: 26 },
  featuredName: { fontSize: 15, fontWeight: '600', color: '#e8f5e4', marginBottom: 2 },
  featuredSci: { fontSize: 11, color: '#4a7a4e', fontStyle: 'italic', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badgeNative: { backgroundColor: '#1a3d1e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeNativeText: { fontSize: 10, color: '#3a9e52', fontWeight: '500' },
  badgeLow: { backgroundColor: '#1a2e3d', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeLowText: { fontSize: 10, color: '#3a7a9e', fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 32 },
  card: { width: '47%', backgroundColor: '#152418', borderWidth: 1, borderColor: '#1f3a22', borderRadius: 14, padding: 12 },
  cardName: { fontSize: 13, fontWeight: '600', color: '#e8f5e4', marginBottom: 2 },
  cardSci: { fontSize: 10, color: '#4a7a4e', fontStyle: 'italic', marginBottom: 8 },
})