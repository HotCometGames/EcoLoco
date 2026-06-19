import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, useWindowDimensions, Animated, Easing, Pressable,
} from 'react-native';
import { useFonts } from 'expo-font';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { getScore, getPlantRecommendations } from '../services/geminiService';

const CREAM      = '#f5f0e8';
const DARK_GREEN = '#1e3a1e';
const SOFT_GREEN = '#4a7a3a';
const LIGHT_BG   = '#eaeee6';
const TEXT_BODY  = '#4a4a3a';
const TEXT_MUTED = '#7a7a6a';
const BORDER     = '#d4cfc4';
const AMBER      = '#c49a3a';
const TERRACOTTA = '#C97D5D';
const CARD_BG    = '#fefcf8';
const EASE_OUT   = Easing.bezier(0.22, 1, 0.36, 1);

const LOGO = require('../../assets/EcoLoco_logo.png');

function scoreColor(s) {
  if (s >= 66) return SOFT_GREEN;
  if (s >= 41) return AMBER;
  return TERRACOTTA;
}

function scoreLabel(s) {
  if (s >= 80) return 'Outstanding';
  if (s >= 65) return 'Good';
  if (s >= 45) return 'Moderate';
  if (s >= 25) return 'Low';
  return 'Critical';
}

// ─── Animated score ring ──────────────────────────────────────────────────────
function ScoreRing({ targetScore, label, size = 190 }) {
  const anim   = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    anim.stopAnimation();
    anim.removeAllListeners();
    anim.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(anim, {
      toValue: targetScore,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => { anim.stopAnimation(); anim.removeAllListeners(); };
  }, [targetScore]);

  const color = scoreColor(shown || targetScore);

  return (
    <View style={[
      ring.wrap,
      { width: size, height: size, borderRadius: size / 2, borderColor: color },
    ]}>
      <Text style={[ring.num, { color, fontSize: size * 0.3 }]}>{shown}</Text>
      {label
        ? <Text style={[ring.sub, { color, fontFamily: 'DMSans_700Bold' }]}>{label}</Text>
        : <Text style={ring.sub}>out of 100</Text>
      }
    </View>
  );
}

const ring = StyleSheet.create({
  wrap: { borderWidth: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM },
  num:  { fontFamily: 'Fraunces_700Bold' },
  sub:  { fontSize: 11, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED, marginTop: 2 },
});

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ delay = 0, children }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 480, delay, easing: EASE_OUT, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 480, delay, easing: EASE_OUT, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

// ─── Before→After pill ───────────────────────────────────────────────────────
function BeforeAfterPill({ fromScore, toScore, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 220, easing: EASE_OUT, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: visible ? 1 : 0.85, useNativeDriver: true, tension: 140, friction: 8 }),
    ]).start();
  }, [visible]);

  const delta = toScore - fromScore;

  return (
    <Animated.View style={[ba.wrap, { opacity, transform: [{ scale }] }]}>
      <Text style={[ba.score, { color: scoreColor(fromScore) }]}>{fromScore}</Text>
      <Text style={ba.arrow}>  →  </Text>
      <Text style={[ba.score, { color: scoreColor(toScore) }]}>{toScore}</Text>
      {delta > 0 && <Text style={ba.delta}>  +{delta} pts</Text>}
    </Animated.View>
  );
}

const ba = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf2e8', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 11, marginTop: 16 },
  score: { fontSize: 22, fontFamily: 'Fraunces_700Bold' },
  arrow: { fontSize: 16, color: TEXT_MUTED },
  delta: { fontSize: 14, fontFamily: 'DMSans_700Bold', color: SOFT_GREEN },
});

// ─── Pressable action card ────────────────────────────────────────────────────
function ActionCard({ rec, index, onHoverIn, onHoverOut }) {
  const num   = String(index + 1).padStart(2, '0');
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    onHoverIn();
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, tension: 160, friction: 7 }).start();
  }

  function pressOut() {
    onHoverOut();
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 160, friction: 7 }).start();
  }

  return (
    <FadeIn delay={index * 110}>
      <Pressable onPressIn={pressIn} onPressOut={pressOut}>
        <Animated.View style={[ac.card, { transform: [{ scale }] }]}>
          <View style={ac.topRow}>
            <Text style={ac.num}>{num}</Text>
            <View style={ac.badge}>
              <Text style={ac.badgeText}>↑ Boosts Biodiversity</Text>
            </View>
          </View>
          <Text style={ac.problem}>{rec.problem}</Text>
          <View style={ac.divider} />
          <Text style={ac.label}>ACTION</Text>
          <Text style={ac.body}>{rec.action}</Text>
          <View style={ac.divider} />
          <Text style={ac.label}>ECOLOGICAL BENEFIT</Text>
          <Text style={ac.body}>{rec.impact}</Text>
          <View style={ac.hintRow}>
            <Text style={ac.hint}>Hold to preview score impact</Text>
          </View>
        </Animated.View>
      </Pressable>
    </FadeIn>
  );
}

const ac = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    padding: 18, marginBottom: 14,
  },
  topRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  num:      { fontSize: 12, fontFamily: 'DMSans_700Bold', color: TEXT_MUTED, letterSpacing: 1 },
  badge:    { backgroundColor: '#eaf2e8', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:{ fontSize: 11, fontFamily: 'DMSans_700Bold', color: SOFT_GREEN },
  problem:  { fontSize: 17, fontFamily: 'Fraunces_700Bold', color: DARK_GREEN, lineHeight: 24, marginBottom: 14 },
  divider:  { height: 1, backgroundColor: BORDER, marginVertical: 12 },
  label:    { fontSize: 10, fontFamily: 'DMSans_700Bold', color: TEXT_MUTED, letterSpacing: 1.2, marginBottom: 5 },
  body:     { fontSize: 13, fontFamily: 'DMSans_400Regular', color: TEXT_BODY, lineHeight: 21 },
  hintRow:  { marginTop: 12, alignItems: 'center' },
  hint:     { fontSize: 10, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED, letterSpacing: 0.4 },
});

// ─── AuditResultsScreen ───────────────────────────────────────────────────────
export default function AuditResultsScreen({ route, navigation }) {
  const { plants = [], zipCode } = route.params ?? {};

  const [scoreData,    setScoreData]     = useState(null);
  const [recs,         setRecs]          = useState([]);
  const [loading,      setLoading]       = useState(true);
  const [recsLoading,  setRecsLoading]   = useState(true);
  const [showProjected,setShowProjected] = useState(false);
  const [hovering,     setHovering]      = useState(false);

  const { width } = useWindowDimensions();
  const maxWidth   = Math.min(width, 960);

  const [fontsLoaded] = useFonts({ Fraunces_700Bold, DMSans_400Regular, DMSans_700Bold });

  useEffect(() => {
    async function fetchAll() {
      try {
        const plantsPayload = plants.map(p => ({
          name:             p.plant_name,
          invasive_status:  p.invasive_status  ?? 'non-native',
          wildlife_support: p.wildlife_support ?? 'low',
        }));
        const data = await getScore(plantsPayload);
        setScoreData(data.result);
      } catch (err) {
        console.error('Score fetch error:', err);
      } finally {
        setLoading(false);
      }

      if (zipCode) {
        try {
          const recData = await getPlantRecommendations(zipCode);
          setRecs((recData.result ?? []).slice(0, 3));
        } catch (err) {
          console.error('Recs fetch error:', err);
        } finally {
          setRecsLoading(false);
        }
      } else {
        setRecsLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Ring target:
  //   Current tab   → current score always
  //   After Actions → current score normally, projected when holding a card
  const ringTarget = scoreData
    ? (showProjected
        ? (hovering ? scoreData.projected_score : scoreData.score)
        : scoreData.score)
    : 0;

  const ringLabel = showProjected
    ? (hovering ? 'after actions' : 'current')
    : null;

  const delta = scoreData ? scoreData.projected_score - scoreData.score : 0;

  const onHoverIn  = useCallback(() => setHovering(true),  []);
  const onHoverOut = useCallback(() => setHovering(false), []);

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.inner, { width: maxWidth }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={LOGO} style={styles.logoImg} />
            <Text style={styles.logoText}>EcoLoco</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back to EcoScan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Loading ── */}
        {loading && (
          <View style={styles.centerSection}>
            <ActivityIndicator color={SOFT_GREEN} size="large" />
            <Text style={styles.loadingText}>Calculating your biodiversity score…</Text>
          </View>
        )}

        {/* ── Results ── */}
        {!loading && scoreData && (
          <>
            {/* Score ring + toggle */}
            <View style={styles.scoreSection}>
              <Text style={styles.pageTitle}>Biodiversity Score</Text>
              <Text style={styles.plantCountLabel}>
                {scoreData.plant_count} plant{scoreData.plant_count !== 1 ? 's' : ''} scanned
              </Text>

              <View style={styles.ringWrap}>
                <ScoreRing targetScore={ringTarget} label={ringLabel} size={190} />
                <Text style={[styles.scoreLabel, { color: scoreColor(ringTarget) }]}>
                  {scoreLabel(ringTarget)}
                </Text>
              </View>

              {/* Before→After pill — only visible when hovering in After Actions */}
              {showProjected && (
                <BeforeAfterPill
                  fromScore={scoreData.score}
                  toScore={scoreData.projected_score}
                  visible={hovering}
                />
              )}

              {/* Current / After Actions toggle */}
              <View style={[styles.toggle, showProjected && { marginTop: 20 }]}>
                <TouchableOpacity
                  style={[styles.toggleBtn, !showProjected && styles.toggleActive]}
                  onPress={() => { setShowProjected(false); setHovering(false); }}
                >
                  <Text style={[styles.toggleText, !showProjected && styles.toggleTextActive]}>
                    Current
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, showProjected && styles.toggleActive]}
                  onPress={() => setShowProjected(true)}
                >
                  <Text style={[styles.toggleText, showProjected && styles.toggleTextActive]}>
                    After Actions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── CURRENT view ── */}
            {!showProjected && (
              <FadeIn>
                <View style={styles.section}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightText}>{scoreData.insight}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>What's on campus</Text>

                  {scoreData.breakdown.helping.length > 0 && (
                    <View style={styles.bCard}>
                      <View style={styles.bHeader}>
                        <View style={[styles.dot, { backgroundColor: SOFT_GREEN }]} />
                        <Text style={styles.bLabel}>Helping your ecosystem</Text>
                        <View style={styles.bBadge}><Text style={styles.bBadgeText}>{scoreData.breakdown.helping.length}</Text></View>
                      </View>
                      {scoreData.breakdown.helping.map((name, i) => (
                        <Text key={i} style={styles.bItem}>· {name}</Text>
                      ))}
                    </View>
                  )}

                  {scoreData.breakdown.hurting.length > 0 && (
                    <View style={styles.bCard}>
                      <View style={styles.bHeader}>
                        <View style={[styles.dot, { backgroundColor: TERRACOTTA }]} />
                        <Text style={styles.bLabel}>Hurting your ecosystem</Text>
                        <View style={styles.bBadge}><Text style={styles.bBadgeText}>{scoreData.breakdown.hurting.length}</Text></View>
                      </View>
                      {scoreData.breakdown.hurting.map((name, i) => (
                        <Text key={i} style={styles.bItem}>· {name}</Text>
                      ))}
                    </View>
                  )}

                  {scoreData.breakdown.helping.length === 0 && scoreData.breakdown.hurting.length === 0 && (
                    <View style={styles.bCard}>
                      <View style={styles.bHeader}>
                        <View style={[styles.dot, { backgroundColor: AMBER }]} />
                        <Text style={styles.bLabel}>Neutral plants — not actively helping or hurting</Text>
                      </View>
                      {plants.map((p, i) => (
                        <Text key={i} style={styles.bItem}>· {p.plant_name}</Text>
                      ))}
                    </View>
                  )}

                  {delta > 0 && (
                    <TouchableOpacity
                      style={styles.afterHint}
                      onPress={() => setShowProjected(true)}
                    >
                      <Text style={styles.afterHintText}>
                        See how you could reach {scoreData.projected_score} →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </FadeIn>
            )}

            {/* ── AFTER ACTIONS view ── */}
            {showProjected && (
              <FadeIn>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your 3-Action Plan</Text>
                  <Text style={styles.sectionSubtitle}>
                    Adding these 3 native plants to your campus could raise your score from{' '}
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: scoreColor(scoreData.score) }}>{scoreData.score}</Text>
                    {' → '}
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: scoreColor(scoreData.projected_score) }}>{scoreData.projected_score}</Text>.
                    {' '}Hold any card to preview.
                  </Text>

                  {recsLoading && (
                    <View style={[styles.centerSection, { paddingVertical: 32 }]}>
                      <ActivityIndicator color={SOFT_GREEN} />
                      <Text style={styles.loadingText}>Finding native plants for your area…</Text>
                    </View>
                  )}

                  {!recsLoading && recs.length === 0 && (
                    <View style={styles.insightCard}>
                      <Text style={styles.insightText}>
                        No recommendations found for this ZIP. Use the Recommendations tab for full results.
                      </Text>
                    </View>
                  )}

                  {!recsLoading && recs.map((rec, i) => (
                    <ActionCard
                      key={i}
                      rec={rec}
                      index={i}
                      onHoverIn={onHoverIn}
                      onHoverOut={onHoverOut}
                    />
                  ))}
                </View>
              </FadeIn>
            )}

            <View style={styles.divider} />

            {/* ── CTAs ── */}
            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => navigation.navigate('Main', { screen: 'Recommend' })}
              >
                <Text style={styles.ctaBtnText}>Full Recommendations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaSecondary} onPress={() => navigation.goBack()}>
                <Text style={styles.ctaSecondaryText}>Scan More Plants</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Error ── */}
        {!loading && !scoreData && (
          <View style={styles.centerSection}>
            <Text style={styles.loadingText}>Could not calculate score. Please try again.</Text>
            <TouchableOpacity style={[styles.ctaBtn, { marginTop: 16 }]} onPress={() => navigation.goBack()}>
              <Text style={styles.ctaBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: CREAM },
  scrollContent:{ alignItems: 'center' },
  inner:        { alignSelf: 'center', width: '100%' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16,
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoImg:  { width: 40, height: 40, resizeMode: 'contain' },
  logoText: { fontSize: 20, fontFamily: 'Fraunces_700Bold', color: DARK_GREEN, letterSpacing: 0.3 },
  backBtn:  { fontSize: 12, fontFamily: 'DMSans_400Regular', color: TEXT_BODY },

  divider: { height: 1, backgroundColor: BORDER },

  centerSection: { alignItems: 'center', paddingVertical: 60, gap: 14, paddingHorizontal: 24 },
  loadingText:   { fontSize: 14, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED, textAlign: 'center' },

  scoreSection:    { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24, paddingBottom: 28 },
  pageTitle:       { fontSize: 34, fontFamily: 'Fraunces_700Bold', color: DARK_GREEN, marginBottom: 4 },
  plantCountLabel: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED, marginBottom: 28 },
  ringWrap:        { alignItems: 'center', gap: 14, marginBottom: 8 },
  scoreLabel:      { fontSize: 22, fontFamily: 'Fraunces_700Bold' },

  toggle: {
    flexDirection: 'row', backgroundColor: LIGHT_BG,
    borderRadius: 12, padding: 4, gap: 4, marginTop: 24,
  },
  toggleBtn:        { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
  toggleActive:     { backgroundColor: CREAM, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:       { fontSize: 13, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED },
  toggleTextActive: { fontFamily: 'DMSans_700Bold', color: DARK_GREEN },

  section:         { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  sectionTitle:    { fontSize: 22, fontFamily: 'Fraunces_700Bold', color: DARK_GREEN, marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED, lineHeight: 19, marginBottom: 20 },

  insightCard: {
    backgroundColor: CARD_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    padding: 18, marginBottom: 20,
  },
  insightText: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: TEXT_BODY, lineHeight: 22, textAlign: 'center' },

  bCard: {
    backgroundColor: CARD_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    padding: 16, marginBottom: 12,
  },
  bHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  bLabel:     { flex: 1, fontSize: 13, fontFamily: 'DMSans_700Bold', color: DARK_GREEN },
  bBadge:     { backgroundColor: LIGHT_BG, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  bBadgeText: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED },
  bItem:      { fontSize: 13, fontFamily: 'DMSans_400Regular', color: TEXT_BODY, lineHeight: 22, paddingLeft: 4 },

  afterHint: { alignItems: 'center', marginTop: 8, paddingVertical: 12 },
  afterHintText: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: SOFT_GREEN },

  ctaSection: { padding: 24, paddingBottom: 52, alignItems: 'center', gap: 10 },
  ctaBtn: {
    backgroundColor: DARK_GREEN, borderRadius: 10,
    paddingVertical: 15, alignItems: 'center', width: '100%',
  },
  ctaBtnText:       { fontSize: 15, fontFamily: 'DMSans_700Bold', color: CREAM },
  ctaSecondary:     { paddingVertical: 10 },
  ctaSecondaryText: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: TEXT_MUTED },
});
