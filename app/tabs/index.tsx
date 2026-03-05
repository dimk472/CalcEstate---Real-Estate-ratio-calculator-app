import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { realEstateRatios } from "../data/ratios";
import { Radius, Space } from '../Theme';
import { useTheme } from '../ThemeContext'; // ← global theme
import { ThemeToggle } from '../ThemeToggle';

const LIKED_RATIOS_KEY = 'likedRatios';

export default function Index() {
  const insets = useSafeAreaInsets();

  // ─── Theme from context (shared across all tabs) ──────────────
  const { C, isDark } = useTheme();
  const s = makeStyles(C);

  // ─── Local state ──────────────────────────────────────────────
  const [allRatios, setAllRatios] = useState(realEstateRatios);
  const [displayedRatios, setDisplayedRatios] = useState(realEstateRatios);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLikedRatios();
  }, []);

  const loadLikedRatios = async () => {
    try {
      setIsLoading(true);
      const savedLikedRatios = await AsyncStorage.getItem(LIKED_RATIOS_KEY);
      if (savedLikedRatios !== null) {
        const likedIds = JSON.parse(savedLikedRatios);
        const updatedRatios = realEstateRatios.map(ratio => ({
          ...ratio,
          isLiked: likedIds.includes(ratio.id)
        }));
        setAllRatios(updatedRatios);
        setDisplayedRatios(updatedRatios);
      } else {
        setDisplayedRatios(realEstateRatios);
      }
    } catch (error) {
      console.error('Error loading liked ratios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLikedRatios = async (updatedRatios: typeof realEstateRatios) => {
    try {
      const likedIds = updatedRatios
        .filter(ratio => ratio.isLiked)
        .map(ratio => ratio.id);
      await AsyncStorage.setItem(LIKED_RATIOS_KEY, JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error saving liked ratios:', error);
    }
  };

  const handleLikePress = async (id: number) => {
    const updatedAllRatios = allRatios.map(item =>
      item.id === id ? { ...item, isLiked: !item.isLiked } : item
    );
    setAllRatios(updatedAllRatios);
    if (showOnlyLiked) {
      setDisplayedRatios(updatedAllRatios.filter(item => item.isLiked));
    } else {
      setDisplayedRatios(updatedAllRatios);
    }
    await saveLikedRatios(updatedAllRatios);
  };

  const toggleShowOnlyLiked = () => {
    setShowOnlyLiked(!showOnlyLiked);
    if (!showOnlyLiked) {
      setDisplayedRatios(allRatios.filter(item => item.isLiked));
    } else {
      setDisplayedRatios(allRatios);
    }
  };

  const filteredRatios = displayedRatios.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[s.container, s.centerContent]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />
        <Animated.View entering={FadeIn} style={s.loaderContainer}>
          <View style={s.loaderPulse}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={32} color={C.text2} />
          </View>
          <Text style={s.loadingText}>Loading...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={s.header}
      >
        <View style={s.searchRow}>
          <View style={s.searchContainer}>
            <Ionicons name="search" size={16} color={C.text3} style={s.searchIcon} />
            <TextInput
              style={s.searchInput}
              placeholder="Search ratios..."
              placeholderTextColor={C.text3}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={C.accent}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearButton}>
                <Ionicons name="close-circle" size={14} color={C.text3} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={toggleShowOnlyLiked} style={s.faviconButton}>
            <Ionicons
              name={showOnlyLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={showOnlyLiked ? C.negative : C.text3}
            />
          </TouchableOpacity>

          <ThemeToggle />
        </View>
      </BlurView>

      <Animated.ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
        ]}
        showsVerticalScrollIndicator={false}
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(180)}
      >
        {filteredRatios.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <Ionicons
                name={showOnlyLiked ? "heart-outline" : "search"}
                size={32}
                color={C.text3}
              />
            </View>
            <Text style={s.emptyTitle}>
              {showOnlyLiked ? "No liked ratios" : "No results found"}
            </Text>
            <Text style={s.emptySubtitle}>
              {showOnlyLiked
                ? "Tap the heart icon on any ratio to save it"
                : "Try searching with different keywords"}
            </Text>
          </View>
        ) : (
          filteredRatios.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeIn.delay(index * 50)}
              style={s.ratioCard}
            >
              <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={s.cardBlur}>
                <View style={s.cardHeader}>
                  <View style={s.cardHeaderLeft}>
                    <View style={[s.iconContainer, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={s.titleContainer}>
                      <Text style={s.ratioTitle}>{item.title}</Text>
                      <View style={s.categoryRow}>
                        <Text style={s.categoryText}>{item.category}</Text>
                        <View style={[s.importanceDot, {
                          backgroundColor:
                            item.importance === "Critical" ? C.negative :
                              item.importance === "High" ? "#FF9F0A" : "#30D158"
                        }]} />
                        <Text style={s.importanceText}>{item.importance}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleLikePress(item.id)}
                    style={[s.cardLikeButton, item.isLiked && s.cardLikeButtonActive]}
                  >
                    <Ionicons
                      name={item.isLiked ? "heart" : "heart-outline"}
                      size={16}
                      color={item.isLiked ? C.negative : C.text3}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={s.ratioDescription}>{item.description}</Text>

                <View style={s.formulaContainer}>
                  <Text style={s.formulaLabel}>Formula</Text>
                  <Text style={s.formulaText}>{item.formula}</Text>
                </View>

                <View style={s.detailsContainer}>
                  <Text style={s.detailsText}>{item.details}</Text>
                </View>

                <TouchableOpacity
                  style={s.calculateButton}
                  onPress={() => router.navigate({
                    pathname: "/tabs/CalculatorScreen",
                    params: { ratioId: item.id.toString() },
                  })}
                >
                  <Text style={[s.calculateText, { color: item.color }]}>Calculate →</Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          ))
        )}

        <View style={[s.footer, { marginBottom: insets.bottom > 0 ? 0 : 10 }]}>
          <TouchableOpacity onPress={() => router.navigate("/tabs/donateModal")}>
            <Text style={s.footerLink}>Buy me a coffee</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate("/tabs/disclaimerScreen")}>
            <Text style={s.footerLink}>Disclaimer</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const makeStyles = (C: ReturnType<typeof import('../Theme').Colors['dark'] extends infer T ? () => T : never> | any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg0,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderContainer: {
      alignItems: 'center',
      gap: Space.lg,
    },
    loaderPulse: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: C.bg2,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border0,
    },
    loadingText: {
      color: C.text3,
      fontSize: 13,
      letterSpacing: 0.2,
    },
    header: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      paddingTop: 54,
      paddingHorizontal: Space.xl,
      paddingBottom: Space.md,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.sm,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.bg1,
      borderRadius: Radius.md,
      paddingHorizontal: Space.md,
      height: 48,
      borderWidth: 1,
      borderColor: C.border1,
    },
    searchIcon: {
      marginRight: 10,
      opacity: 0.4,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: C.text0,
      height: '100%',
      paddingVertical: 0,
      letterSpacing: -0.1,
    },
    clearButton: {
      padding: 4,
      opacity: 0.45,
    },
    faviconButton: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: C.bg1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border1,
    },
    scrollView: {
      flex: 1,
      marginTop: 118,
    },
    scrollContent: {
      paddingHorizontal: Space.xl,
      paddingBottom: 48,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 100,
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: C.bg2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.border0,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: C.text0,
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    emptySubtitle: {
      fontSize: 13,
      color: C.text2,
      textAlign: 'center',
      paddingHorizontal: 40,
      lineHeight: 19,
    },
    ratioCard: {
      borderRadius: Radius.xl,
      marginBottom: 10,
      overflow: 'hidden',
      backgroundColor: C.bg1,
      borderWidth: 1,
      borderColor: C.border0,
    },
    cardBlur: {
      padding: Space.xl,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
      gap: Space.md,
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: Radius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      flex: 1,
      gap: 5,
    },
    ratioTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: C.text0,
      letterSpacing: -0.4,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    categoryText: {
      fontSize: 10,
      color: C.text2,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      fontWeight: '600',
    },
    importanceDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
    },
    importanceText: {
      fontSize: 10,
      color: C.text2,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      fontWeight: '600',
    },
    cardLikeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: C.bg3,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.border0,
    },
    cardLikeButtonActive: {
      backgroundColor: C.negativeSoft,
      borderColor: C.negative,
    },
    ratioDescription: {
      fontSize: 13,
      color: C.text1,
      lineHeight: 19,
      marginBottom: 14,
    },
    formulaContainer: {
      backgroundColor: C.bg3,
      borderRadius: Radius.sm,
      paddingVertical: 12,
      paddingHorizontal: Space.md,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: C.border0,
    },
    formulaLabel: {
      fontSize: 9,
      color: C.text2,
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      marginBottom: 5,
      fontWeight: '700',
    },
    formulaText: {
      fontSize: 13,
      color: C.accent,
      fontFamily: 'monospace',
      letterSpacing: 0.1,
    },
    detailsContainer: {
      backgroundColor: C.bg3,
      borderRadius: Radius.sm,
      paddingVertical: 10,
      paddingHorizontal: Space.md,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.border0,
    },
    detailsText: {
      fontSize: 12,
      color: C.text2,
      fontStyle: 'italic',
      lineHeight: 17,
    },
    calculateButton: {
      paddingTop: 14,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: C.border0,
    },
    calculateText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.9,
      textTransform: 'uppercase',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Space.xl,
      paddingVertical: 28,
    },
    footerLink: {
      fontSize: 12,
      color: C.text3,
      fontWeight: '500',
    },
  });
