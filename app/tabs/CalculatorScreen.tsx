import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateRatio } from "../data/formulas";
import { CalculateRatiosPropsArray } from "../data/ratios";
import { Colors, Radius, Space } from '../Theme';
import { useTheme } from '../ThemeContext';
import { CustomProperty, DataField, useProperties } from './properties';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CalculatorScreen() {
  const { colorScheme, C } = useTheme();
  const styles = makeStyles(C);
  const insets = useSafeAreaInsets();
  const { ratioId } = useLocalSearchParams<{ ratioId: string }>();
  const ratioIdNum = ratioId ? parseInt(ratioId, 10) : 0;
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<number | null>(null);
  const { properties, setProperties, loadProperties } = useProperties();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<CustomProperty | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const resultViewRef = useRef<View>(null);
  const modalScrollViewRef = useRef<ScrollView>(null);
  const currentScrollYRef = useRef(0);
  const smoothScrollRafRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const ratioData = CalculateRatiosPropsArray.find((item) => item.id === ratioIdNum);

  useEffect(() => {
    if (ratioData) {
      const initialValues: { [key: string]: string } = {};
      Object.keys(ratioData.inputValues).forEach(key => {
        initialValues[key] = '';
      });
      setInputValues(initialValues);
      setResult(null);
    }
  }, [ratioData]);

  useEffect(() => {
    return () => {
      if (smoothScrollRafRef.current !== null) {
        cancelAnimationFrame(smoothScrollRafRef.current);
      }
    };
  }, []);

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const smoothScrollTo = (targetY: number, duration = 850) => {
    const startY = currentScrollYRef.current;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) return;

    const startTime = Date.now();

    if (smoothScrollRafRef.current !== null) {
      cancelAnimationFrame(smoothScrollRafRef.current);
    }

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const nextY = startY + distance * easedProgress;

      scrollViewRef.current?.scrollToPosition(0, nextY, false);

      if (progress < 1) {
        smoothScrollRafRef.current = requestAnimationFrame(step);
      } else {
        smoothScrollRafRef.current = null;
      }
    };

    smoothScrollRafRef.current = requestAnimationFrame(step);
  };

  const scrollToResult = () => {
    if (!scrollViewRef.current) return;

    // Smooth animation towards the lower content where the result card appears.
    smoothScrollTo(9000, 2000);
  };


  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = () => {
    if (!ratioData) return;
    Keyboard.dismiss();
    setIsCalculating(true);

    const updatedRatioData = {
      ...ratioData,
      inputValues: { ...ratioData.inputValues }
    };

    Object.keys(inputValues).forEach(key => {
      const value = inputValues[key];
      updatedRatioData.inputValues[key] = value !== '' ? parseFloat(value) : 0;
    });

    try {
      const calculatedResult = calculateRatio(ratioIdNum, updatedRatioData);
      setResult(calculatedResult);

      setTimeout(() => {
        scrollToResult();
        setIsCalculating(false);
      }, 300);
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
      setIsCalculating(false);
    }
  };

  const handleSaveResult = () => {
    setSaveModalVisible(true);
    setSaveSuccess(false);
  };

  const handleSelectProperty = async (property: CustomProperty) => {
    if (!result || !ratioData) return;

    const newField: DataField = {
      id: `${property.id}-${Date.now()}`,
      label: `${ratioData.title} Result`,
      value: result.toString(),
      type: 'number',
    };

    const updatedProperties = properties.map(prop => {
      if (prop.id === property.id) {
        return { ...prop, dataFields: [...prop.dataFields, newField] };
      }
      return prop;
    });

    setProperties(updatedProperties);
    setSelectedProperty(property);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveModalVisible(false);
      setSelectedProperty(null);
      setSaveSuccess(false);
    }, 1500);
  };

  const formatResult = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";
    if ([1, 2, 7, 8, 9, 10, 12, 13, 15, 16, 17, 18, 19, 20, 21].includes(ratioIdNum)) {
      return `${value.toFixed(2)}%`;
    } else if ([3, 4, 5, 6].includes(ratioIdNum)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'EUR',
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(value);
    } else {
      return value.toFixed(2);
    }
  };

  const formatInputLabel = (label: string): string => {
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getResultColor = (result: number): string => {
    if (isNaN(result)) return C.text3;
    if (!ratioData) return C.text3;
    switch (ratioIdNum) {
      case 1: return result >= 6 ? "#30D158" : result >= 4 ? "#FF9F0A" : "#FF3B30";
      case 2: return result >= 4 ? "#30D158" : result >= 2 ? "#FF9F0A" : "#FF3B30";
      case 7: return result <= 35 ? "#30D158" : result <= 50 ? "#FF9F0A" : "#FF3B30";
      case 8: return result >= 6 ? "#30D158" : result >= 4 ? "#FF9F0A" : "#FF3B30";
      case 9: return result >= 8 ? "#30D158" : result >= 5 ? "#FF9F0A" : "#FF3B30";
      case 10: return result <= 75 ? "#30D158" : result <= 85 ? "#FF9F0A" : "#FF3B30";
      case 11: return result >= 1.25 ? "#30D158" : result >= 1.0 ? "#FF9F0A" : "#FF3B30";
      default: return C.accent;
    }
  };

  const getResultDescription = (result: number): string => {
    const color = getResultColor(result);
    if (color === "#30D158") return "Good";
    if (color === "#FF9F0A") return "Average";
    if (color === "#FF3B30") return "Needs improvement";
    return "Calculated";
  };

  const renderPropertyItem = ({ item, index }: { item: CustomProperty; index: number }) => (
    <Pressable
      style={({ pressed }) => [
        styles.propertyItem,
        pressed && styles.propertyItemPressed,
        selectedProperty?.id === item.id && styles.propertyItemSelected
      ]}
      onPress={() => handleSelectProperty(item)}
    >
      <View style={[styles.propertyDot, { backgroundColor: item.color }]} />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyName}>{item.name}</Text>
        <Text style={styles.propertyFields}>
          {item.dataFields.length} {item.dataFields.length === 1 ? 'field' : 'fields'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.text2} />
    </Pressable>
  );

  if (!ratioData) {
    return (
      <View style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color={C.text0} />
          </Pressable>
          <Text style={styles.headerTitle}>Not found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={C.text3} />
          <Text style={styles.errorText}>Ratio not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />

      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color={C.text0} />
        </Pressable>
        <Text style={styles.headerTitle}>{ratioData.title}</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 140,
          }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled
        alwaysBounceVertical
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={250}
        extraScrollHeight={150}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScroll={(event) => {
          currentScrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${ratioData.color}20` }]}>
              <Ionicons name={ratioData.icon as any} size={24} color={ratioData.color} />
            </View>
            <View style={styles.infoHeaderText}>
              <Text style={styles.infoTitle}>{ratioData.title}</Text>
              <View style={styles.importanceRow}>
                <View style={[styles.importanceDot, {
                  backgroundColor:
                    ratioData.importance === "Critical" ? "#FF3B30" :
                      ratioData.importance === "High" ? "#FF9F0A" : "#30D158"
                }]} />
                <Text style={styles.importanceText}>{ratioData.importance}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{ratioData.description}</Text>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaLabel}>Formula</Text>
            <Text style={styles.formulaText}>{ratioData.formula}</Text>
          </View>
        </View>

        <View style={styles.inputsSection}>
          <Text style={styles.sectionTitle}>Inputs</Text>

          {Object.entries(ratioData.inputValues).map(([key]) => (
            <View key={key} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{formatInputLabel(key)}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={(ref) => { inputRefs.current[key] = ref; }}
                  style={styles.input}
                  value={inputValues[key] || ''}
                  onChangeText={(text) => handleInputChange(key, text)}
                  placeholder="0"
                  placeholderTextColor={C.text3}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={handleCalculate}
                />
              </View>
            </View>
          ))}

          <Pressable
            style={[styles.calculateButton, isCalculating && styles.calculateButtonDisabled]}
            onPress={handleCalculate}
            disabled={isCalculating}
          >
            <Text style={styles.calculateButtonText}>
              {isCalculating ? "Calculating..." : "Calculate"}
            </Text>
          </Pressable>
        </View>

        {result !== null && (
          <Animated.View
            ref={resultViewRef}
            entering={FadeIn.duration(400)}
            style={styles.resultSection}
            onLayout={() => {
              if (result !== null) {
                setTimeout(scrollToResult, 300);
              }
            }}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Result</Text>
              <Pressable style={styles.saveResultButton} onPress={handleSaveResult}>
                <Ionicons name="bookmark-outline" size={16} color={C.accent} />
                <Text style={styles.saveResultText}>Save</Text>
              </Pressable>
            </View>

            <View style={styles.resultValueRow}>
              <Text style={styles.resultValue}>{formatResult(result)}</Text>
              <View style={[styles.resultBadge, { backgroundColor: getResultColor(result) + '20' }]}>
                <Text style={[styles.resultBadgeText, { color: getResultColor(result) }]}>
                  {getResultDescription(result)}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Extra bottom spacer so the last card is always fully reachable */}
        <View style={{ height: insets.bottom + 80 }} />
      </KeyboardAwareScrollView>

      {/* Modal with ScrollView support */}
      <Modal
        animationType="none"
        transparent={true}
        visible={saveModalVisible}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => !saveSuccess && setSaveModalVisible(false)}
          />
          <Animated.View
            entering={SlideInDown.duration(350)}
            exiting={SlideOutDown.duration(250)}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />

            {/* ScrollView για να χωράει όλο το περιεχόμενο */}
            <ScrollView
              ref={modalScrollViewRef}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
              bounces={true}
              overScrollMode="always"
            >
              {saveSuccess ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={48} color="#30D158" />
                  </View>
                  <Text style={styles.successTitle}>Saved!</Text>
                  <Text style={styles.successText}>
                    Result saved to {selectedProperty?.name}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Save Result</Text>
                      <Text style={styles.modalSubtitle}>Select a property</Text>
                    </View>
                    <Pressable
                      onPress={() => setSaveModalVisible(false)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close" size={20} color={C.text0} />
                    </Pressable>
                  </View>

                  {result !== null && (
                    <View style={styles.modalPreview}>
                      <Text style={styles.modalPreviewLabel}>Result:</Text>
                      <Text style={styles.modalPreviewValue}>{formatResult(result)}</Text>
                    </View>
                  )}

                  {properties.length === 0 ? (
                    <View style={styles.emptyProperties}>
                      <View style={styles.emptyIcon}>
                        <Ionicons name="folder-outline" size={32} color={C.text3} />
                      </View>
                      <Text style={styles.emptyPropertiesTitle}>No properties</Text>
                      <Text style={styles.emptyPropertiesText}>
                        Create a property to save results
                      </Text>
                      <Pressable
                        style={styles.createButton}
                        onPress={() => {
                          setSaveModalVisible(false);
                          router.push('./properties');
                        }}
                      >
                        <LinearGradient
                          colors={[C.accent, C.accent]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.createButtonGradient}
                        >
                          <Text style={styles.createButtonText}>Go to Properties</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  ) : (
                    <FlatList
                      key={refreshKey}
                      data={properties}
                      renderItem={renderPropertyItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={styles.propertiesList}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                    />
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (C: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Space.lg,
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
    paddingTop: 54,
    paddingBottom: 14,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text0,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
    marginTop: 94,
  },
  scrollContent: {
    paddingHorizontal: Space.xl,
    paddingBottom: 250,
  },
  infoCard: {
    backgroundColor: C.bg1,
    borderRadius: Radius.xl,
    padding: Space.xl,
    marginBottom: Space.md,
    borderWidth: 1,
    borderColor: C.border0,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginBottom: 14,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border1,
  },
  infoHeaderText: {
    flex: 1,
    gap: 5,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text0,
    letterSpacing: -0.4,
  },
  importanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  importanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  importanceText: {
    fontSize: 10,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: C.text1,
    lineHeight: 19,
    marginBottom: 14,
  },
  formulaBox: {
    backgroundColor: C.bg3,
    borderRadius: Radius.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border0,
  },
  formulaLabel: {
    fontSize: 9,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
    fontWeight: '700',
  },
  formulaText: {
    fontSize: 13,
    color: C.accent,
    fontFamily: 'monospace',
    lineHeight: 19,
  },
  inputsSection: {
    marginBottom: Space.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 12,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: C.text1,
    flex: 1,
    letterSpacing: -0.1,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: C.bg3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.border1,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text0,
    textAlign: 'right',
    letterSpacing: -0.1,
  },
  calculateButton: {
    backgroundColor: C.accent,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: Space.xl,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  calculateButtonDisabled: {
    opacity: 0.7,
  },
  calculateButtonText: {
    fontSize: 14,
    color: C.bg0,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resultSection: {
    backgroundColor: C.bg1,
    borderRadius: Radius.xl,
    padding: Space.xl,
    borderWidth: 1,
    borderColor: C.border0,
    marginTop: Space.md,
    marginBottom: Space.xxl,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 10,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  saveResultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: C.accentMid,
  },
  saveResultText: {
    fontSize: 12,
    color: C.accent,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  resultValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultValue: {
    fontSize: 40,
    fontWeight: '200',
    color: C.text0,
    letterSpacing: -1.5,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Space.xxl,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: C.border1,
    borderBottomWidth: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.border2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Space.lg,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Space.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text0,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: C.text1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border1,
  },
  modalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.accentSoft,
    padding: 14,
    borderRadius: Radius.md,
    marginBottom: Space.lg,
    borderWidth: 1,
    borderColor: C.accentMid,
  },
  modalPreviewLabel: {
    fontSize: 13,
    color: C.text1,
  },
  modalPreviewValue: {
    fontSize: 17,
    fontWeight: '700',
    color: C.accent,
    letterSpacing: -0.4,
  },
  propertiesList: {
    paddingTop: 6,
    gap: 6,
    paddingBottom: 20,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg3,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border1,
  },
  propertyItemPressed: {
    backgroundColor: C.bg3,
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  propertyItemSelected: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  propertyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 14,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    color: C.text0,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  propertyFields: {
    fontSize: 11,
    color: C.text2,
    letterSpacing: 0.1,
  },
  emptyProperties: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.bg3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border1,
  },
  emptyPropertiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text0,
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  emptyPropertiesText: {
    fontSize: 13,
    color: C.text1,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text0,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  successText: {
    fontSize: 13,
    color: C.text1,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: C.text1,
  },
});
