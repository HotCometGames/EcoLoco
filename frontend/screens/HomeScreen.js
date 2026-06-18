import React, { useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native'
import { useFonts } from 'expo-font'
import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces'
import {
  DMSans_400Regular,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'

const CREAM      = '#f5f0e8'
const DARK_GREEN = '#1e3a1e'
const SOFT_GREEN = '#4a7a3a'
const TEXT_BODY  = '#4a4a3a'
const TEXT_MUTED = '#7a7a6a'
const BORDER     = '#d4cfc4'
const LIGHT_BG   = '#eaeee6'

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1)  // fast-out, ease-in-out feel

const LOGO            = require('../../assets/EcoLoco_logo.png')
const IMG_SCANNING    = require('../../assets/EcoLoco_Scanning_Plant.png')
const IMG_POLLINATORS = require('../../assets/EcoLoco_support_polinators.png')
const IMG_GROW        = require('../../assets/GrowWithConfidence_Ecoloco.png')
const IMG_ECOSYSTEM   = require('../../assets/EcoLoco_ecosystem.png')

// ─── Single scroll-triggered reveal anim ─────────────────────────────────────
function useReveal() {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(36)).current
  const scale      = useRef(new Animated.Value(0.97)).current

  const trigger = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 700, easing: EASE_OUT, useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0, duration: 700, easing: EASE_OUT, useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1, duration: 700, easing: EASE_OUT, useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return { animStyle: { opacity, transform: [{ translateY }, { scale }] }, trigger }
}

// ─── Animated press button ────────────────────────────────────────────────────
function AnimButton({ style, textStyle, label, onPress }) {
  const scale = useRef(new Animated.Value(1)).current
  const pressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start()
  return (
    <TouchableOpacity onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// ─── Ornament that draws itself in ────────────────────────────────────────────
function Ornament({ delay = 0 }) {
  const scaleX  = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleX, {
        toValue: 1, duration: 800, delay, easing: EASE_OUT, useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1, duration: 400, delay, useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles.ornamentRow, { opacity, transform: [{ scaleX }] }]}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </Animated.View>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────
function Divider() {
  return <View style={styles.dividerLine} />
}

// ─── Feature row ─────────────────────────────────────────────────────────────
function FeatureRow({ image, heading, body, linkText, onLinkPress, imgHeight, reverse, animStyle }) {
  const imgBlock = (
    <View style={[styles.featureImgWrap, { height: imgHeight }]}>
      {image
        ? <Image source={image} style={styles.featureImg} resizeMode="cover" />
        : <View style={styles.imgFallback} />
      }
    </View>
  )
  const textBlock = (
    <View style={[styles.featureText, reverse && { paddingLeft: 4 }]}>
      <Text style={styles.featureHeading}>{heading}</Text>
      <Text style={styles.featureBody}>{body}</Text>
      {linkText && (
        <TouchableOpacity onPress={onLinkPress} style={styles.linkBtn}>
          <Text style={styles.featureLink}>{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
  return (
    <Animated.View style={[styles.featureRow, animStyle]}>
      {reverse ? <>{textBlock}{imgBlock}</> : <>{imgBlock}{textBlock}</>}
    </Animated.View>
  )
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions()
  const isWide   = width > 600
  const imgHeight = isWide ? 280 : 190
  const maxWidth  = Math.min(width, 960)

  // Hero words animate on mount
  const word1 = useRef(new Animated.Value(0)).current   // "Welcome to "
  const word2 = useRef(new Animated.Value(0)).current   // "EcoLoco"
  const w1Y   = useRef(new Animated.Value(14)).current
  const w2Y   = useRef(new Animated.Value(14)).current

  useEffect(() => {
    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(word1, { toValue: 1, duration: 600, easing: EASE_OUT, useNativeDriver: true }),
        Animated.timing(w1Y,   { toValue: 0, duration: 600, easing: EASE_OUT, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(word2, { toValue: 1, duration: 600, easing: EASE_OUT, useNativeDriver: true }),
        Animated.timing(w2Y,   { toValue: 0, duration: 600, easing: EASE_OUT, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  // Scroll-triggered section reveals
  const sections = {
    s1: useReveal(),
    s2: useReveal(),
    s3: useReveal(),
    s4: useReveal(),
  }
  const sectionLayouts  = useRef({})
  const triggered       = useRef(new Set())

  const onSectionLayout = (key) => (e) => {
    sectionLayouts.current[key] = e.nativeEvent.layout.y
  }

  const handleScroll = (e) => {
    const scrollTop = e.nativeEvent.contentOffset.y
    const threshold = scrollTop + height * 0.82

    Object.entries(sectionLayouts.current).forEach(([key, y]) => {
      if (!triggered.current.has(key) && threshold > y) {
        triggered.current.add(key)
        sections[key]?.trigger()
      }
    })
  }

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
    DMSans_400Regular,
    DMSans_700Bold,
  })

  if (!fontsLoaded) return <View style={styles.container} />

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={[styles.inner, { width: maxWidth }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={LOGO} style={styles.logoImg} />
            <Text style={styles.logoText}>EcoLoco</Text>
          </View>
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => navigation?.navigate('Camera')}>
              <Text style={styles.navLink}>Identification</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation?.navigate('Recommend')}>
              <Text style={styles.navLink}>Recommendations</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider />

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroHeadingRow}>
            <Animated.Text style={[styles.heroHeading, { opacity: word1, transform: [{ translateY: w1Y }] }]}>
              {'Welcome to '}
            </Animated.Text>
            <Animated.Text style={[styles.heroHeadingItalic, { opacity: word2, transform: [{ translateY: w2Y }] }]}>
              EcoLoco
            </Animated.Text>
          </View>
          <Ornament delay={500} />
        </View>

        <Divider />

        {/* ── Section 1 ── */}
        <View onLayout={onSectionLayout('s1')}>
          <FeatureRow
            animStyle={sections.s1.animStyle}
            image={IMG_SCANNING}
            imgHeight={imgHeight}
            heading="Identify Plants"
            body="Uncover information about plant type, native region, growing conditions, the pollinators it attracts, and whether it helps or hurts your local ecosystem, all from a single photo taken on your campus."
            linkText="Go to Identification →"
            onLinkPress={() => navigation?.navigate('Camera')}
          />
        </View>

        <Divider />

        {/* ── Section 2 ── */}
        <View onLayout={onSectionLayout('s2')}>
          <FeatureRow
            reverse
            animStyle={sections.s2.animStyle}
            image={IMG_POLLINATORS}
            imgHeight={imgHeight}
            heading="Support Pollinators"
            body="In recent years, pollinators and wildlife of all kinds have become threatened by habitat loss, climate change, and the spread of non-native species. By identifying what's growing on your school grounds and planting natives where it counts, your eco-club can make a real, measurable difference right where you are."
          />
        </View>

        <Divider />

        {/* ── Section 3 ── */}
        <View onLayout={onSectionLayout('s3')}>
          <FeatureRow
            animStyle={sections.s3.animStyle}
            image={IMG_GROW}
            imgHeight={imgHeight}
            heading="Grow with Confidence"
            body="EcoLoco gives recommendations tailored to your school's location and conditions. Every suggestion is ranked by real ecological impact, so your club can choose the plants that do the most good while prioritizing species that are realistic to grow and care for."
            linkText="Go to Recommendation →"
            onLinkPress={() => navigation?.navigate('Recommend')}
          />
        </View>

        <Divider />

        {/* ── Section 4 ── */}
        <View onLayout={onSectionLayout('s4')}>
          <FeatureRow
            reverse
            animStyle={sections.s4.animStyle}
            image={IMG_ECOSYSTEM}
            imgHeight={imgHeight}
            heading="Help Your Ecosystem"
            body="While the climate crisis can feel global and overwhelming, EcoLoco brings it down to your own campus. Focusing on local impact lets students see the direct effects of their work, where one native oak can support over 500 butterfly and moth species and bring an entire food web back to life."
          />
        </View>

        <View style={styles.footerDivider} />

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Image source={LOGO} style={styles.footerLogo} />
          <Text style={styles.footerText}>EcoLoco · Growing communities, one plant at a time</Text>
        </View>

      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    alignItems: 'center',
  },
  inner: {
    alignSelf: 'center',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Fraunces_700Bold',
    color: DARK_GREEN,
    letterSpacing: 0.3,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  navLink: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: TEXT_BODY,
    letterSpacing: 0.2,
  },

  // ── Divider ──
  dividerLine: {
    height: 1,
    backgroundColor: BORDER,
  },

  // ── Hero ──
  hero: {
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroHeadingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroHeading: {
    fontSize: 36,
    fontFamily: 'Fraunces_400Regular',
    color: DARK_GREEN,
    lineHeight: 46,
  },
  heroHeadingItalic: {
    fontSize: 36,
    fontFamily: 'Fraunces_700Bold_Italic',
    color: DARK_GREEN,
    lineHeight: 46,
  },

  // ── Ornament ──
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '50%',
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  ornamentDiamond: {
    width: 7,
    height: 7,
    backgroundColor: SOFT_GREEN,
    opacity: 0.45,
    transform: [{ rotate: '45deg' }],
  },

  // ── Feature rows ──
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 20,
  },
  featureImgWrap: {
    width: '42%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: LIGHT_BG,
    shadowColor: '#1e3a1e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureImg: {
    width: '100%',
    height: '100%',
  },
  imgFallback: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  featureText: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  featureHeading: {
    fontSize: 18,
    fontFamily: 'Fraunces_700Bold',
    color: DARK_GREEN,
    lineHeight: 26,
  },
  featureBody: {
    fontSize: 12.5,
    fontFamily: 'DMSans_400Regular',
    color: TEXT_BODY,
    lineHeight: 20,
  },
  linkBtn: {
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: DARK_GREEN,
    paddingBottom: 1,
  },
  featureLink: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    color: DARK_GREEN,
  },

  // ── Footer ──
  footerDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  footerLogo: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    opacity: 0.45,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: TEXT_MUTED,
    letterSpacing: 0.4,
  },
})
