import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native'

// Placeholder image URIs — swap these for your real assets or require() calls
const IMG_IDENTIFY =
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80'
const IMG_POLLINATORS =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
const IMG_GARDEN =
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80'
const IMG_MAP =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'

const PLANTS = [
  { id: 1, name: 'Purple Coneflower', sci: 'Echinacea purpurea', status: 'Native' },
  { id: 2, name: 'Big Bluestem', sci: 'Andropogon gerardi', status: 'Native' },
  { id: 3, name: 'Butterfly Weed', sci: 'Asclepias tuberosa', status: 'Native' },
  { id: 4, name: 'Black-eyed Susan', sci: 'Rudbeckia hirta', status: 'Native' },
]

// ─── Leaf SVG-style icon using View shapes ───────────────────────────────────
function LeafLogo({ size = 32 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.85,
          backgroundColor: '#2d5a27',
          borderTopLeftRadius: size * 0.6,
          borderTopRightRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.6,
          transform: [{ rotate: '-15deg' }],
        }}
      />
    </View>
  )
}

// ─── Icon circle ─────────────────────────────────────────────────────────────
function IconCircle({ emoji, size = 44 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#eaeee6',
        borderWidth: 1,
        borderColor: '#c8d4c2',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </View>
  )
}

// ─── Divider ornament ─────────────────────────────────────────────────────────
function Ornament() {
  return (
    <View style={styles.ornamentRow}>
      <View style={styles.ornamentLine} />
      <Text style={styles.ornamentLeaf}>❧</Text>
      <View style={styles.ornamentLine} />
    </View>
  )
}

// ─── Feature row: image left, text right ─────────────────────────────────────
function FeatureRowLeft({ imageUri, icon, title, body, linkText, linkUrl }) {
  return (
    <View style={styles.featureRow}>
      <Image source={{ uri: imageUri }} style={styles.featureImage} resizeMode="cover" />
      <View style={styles.featureText}>
        <IconCircle emoji={icon} />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
        <TouchableOpacity
          onPress={() => linkUrl && Linking.openURL(linkUrl)}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>{linkText}</Text>
          <Text style={styles.linkArrow}> →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Feature row: text left, image right ─────────────────────────────────────
function FeatureRowRight({ imageUri, icon, title, body, linkText, linkUrl }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureText, { paddingRight: 16, paddingLeft: 0 }]}>
        <IconCircle emoji={icon} />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
        <TouchableOpacity
          onPress={() => linkUrl && Linking.openURL(linkUrl)}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>{linkText}</Text>
          <Text style={styles.linkArrow}> →</Text>
        </TouchableOpacity>
      </View>
      <Image source={{ uri: imageUri }} style={styles.featureImage} resizeMode="cover" />
    </View>
  )
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header / Nav ── */}
      <View style={styles.nav}>
        <View style={styles.logoRow}>
          <LeafLogo size={30} />
          <Text style={styles.logoText}>EcoLoco</Text>
        </View>
        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation?.navigate('Camera')}>
            <Text style={styles.navLink}>Identification</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation?.navigate('Recommend')}>
            <Text style={styles.navLink}>Recommendation</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dividerHair} />

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={styles.heroHeadline}>
          Welcome to <Text style={styles.heroItalic}>EcoLoco</Text>
        </Text>
        <Ornament />
        <Text style={styles.heroBody}>
          A tool to help schools around the country plant smarter and grow intentionally. Our
          mission is to connect gardeners to the impacts of native plants on their local
          ecosystem, whether that is made visible through easier gardening, soil quality
          improvement, a thriving pollinator population, or a stagnation in invasive species.
        </Text>
      </View>

      {/* ── Feature 1: Identify Plants ── */}
      <FeatureRowLeft
        imageUri={IMG_IDENTIFY}
        icon="🔍"
        title="Identify Plants"
        body="Uncover information about plant type, native region, growing information, pollinators attracted, and more, all with a single picture."
        linkText="Go to Identification"
        linkUrl={null}
      />

      {/* ── Feature 2: Support Pollinators ── */}
      <FeatureRowRight
        imageUri={IMG_POLLINATORS}
        icon="🐝"
        title="Support Pollinators"
        body="In recent years, creatures of all kinds have become threatened all over the globe due to habitat loss, climate change, and agricultural practices. By planting native plant species and eradicating invasive species where possible, gardeners can have a real impact on this issue."
        linkText="More info on Pollinator.org"
        linkUrl="https://pollinator.org"
      />

      {/* ── Feature 3: Grow with Confidence ── */}
      <FeatureRowLeft
        imageUri={IMG_GARDEN}
        icon="🌱"
        title="Grow with Confidence"
        body="EcoLoco gives recommendations for developing gardens and gardeners. This allows them to choose plant species that would have a positive impact on their ecosystem while prioritizing simple-to-grow plants."
        linkText="Go to Recommendation"
        linkUrl={null}
      />

      {/* ── Feature 4: Help Your Ecosystem ── */}
      <View style={styles.featureRow}>
        <View style={[styles.featureText, { paddingRight: 16, paddingLeft: 0 }]}>
          <View style={styles.ecosystemHeader}>
            <IconCircle emoji="🌍" size={38} />
            <Text style={styles.featureTitle}>Help Your Ecosystem</Text>
          </View>
          <Text style={styles.featureBody}>
            While EcoLoco's goal is to help small gardening programs tackle global environmental
            damage, its goal is also to encourage small gardeners to seek out plants that work to
            help their local community. Focusing on local impacts allows users to see the effects
            of their awareness in their own gardens.
          </Text>
        </View>
        {/* Map placeholder */}
        <View style={[styles.featureImage, styles.mapPlaceholder]}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapLabel}>Native Plant Map</Text>
        </View>
      </View>

      {/* ── Nearby Natives cards ── */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>NEARBY NATIVES</Text>
        <View style={styles.grid}>
          {PLANTS.map(plant => (
            <TouchableOpacity key={plant.id} style={styles.card}>
              <Text style={styles.cardName}>{plant.name}</Text>
              <Text style={styles.cardSci}>{plant.sci}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{plant.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <LeafLogo size={22} />
        <Text style={styles.footerText}>EcoLoco · Growing communities, one plant at a time</Text>
      </View>

    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CREAM = '#f5f0e8'
const DARK_GREEN = '#1e3a1e'
const MID_GREEN = '#2d5a27'
const SOFT_GREEN = '#4a7a3a'
const LIGHT_GREEN_BG = '#eaeee6'
const TEXT_BODY = '#4a4a3a'
const TEXT_MUTED = '#7a7a6a'
const BORDER = '#d4cfc4'

const styles = StyleSheet.create({

  // ── Container ──
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // ── Nav ──
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: CREAM,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_GREEN,
    letterSpacing: 0.3,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  navLink: {
    fontSize: 13,
    color: TEXT_BODY,
    fontWeight: '400',
  },

  dividerHair: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 0,
  },

  // ── Hero ──
  hero: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroHeadline: {
    fontSize: 30,
    fontWeight: '700',
    color: DARK_GREEN,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroItalic: {
    fontStyle: 'italic',
    fontWeight: '700',
    color: MID_GREEN,
  },
  heroBody: {
    fontSize: 14,
    color: TEXT_BODY,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  // ── Ornament ──
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  ornamentLeaf: {
    fontSize: 16,
    color: SOFT_GREEN,
    opacity: 0.6,
  },

  // ── Feature rows ──
  featureRow: {
    flexDirection: 'row',
    marginHorizontal: 0,
    marginBottom: 0,
    minHeight: 220,
  },
  featureImage: {
    width: '48%',
    minHeight: 220,
    backgroundColor: LIGHT_GREEN_BG,
  },
  featureText: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'flex-start',
    gap: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GREEN,
    lineHeight: 24,
    marginTop: 8,
  },
  featureBody: {
    fontSize: 12,
    color: TEXT_BODY,
    lineHeight: 19,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: TEXT_BODY,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: '500',
  },
  linkArrow: {
    fontSize: 12,
    color: TEXT_BODY,
  },

  // ── Ecosystem header (inline icon + title) ──
  ecosystemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },

  // ── Map placeholder ──
  mapPlaceholder: {
    backgroundColor: LIGHT_GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapEmoji: {
    fontSize: 36,
  },
  mapLabel: {
    fontSize: 11,
    color: SOFT_GREEN,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // ── Section / Grid ──
  sectionBlock: {
    paddingTop: 28,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    color: SOFT_GREEN,
    letterSpacing: 2,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 3,
  },
  cardSci: {
    fontSize: 10,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: LIGHT_GREEN_BG,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: MID_GREEN,
    fontWeight: '500',
  },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
})