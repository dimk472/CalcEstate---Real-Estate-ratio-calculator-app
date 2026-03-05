import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideInRight,
  SlideOutDown,
  SlideOutLeft,
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius, Space } from '../Theme';
import { useTheme } from '../ThemeContext';

const STORAGE_KEY = "@calcestate_properties";

export interface CustomProperty {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  dataFields: DataField[];
}

export interface DataField {
  id: string;
  label: string;
  value: string;
  type: "text" | "number" | "date" | "boolean";
}

// ─── useProperties hook with event emitter ─────────────────────────

// Simple event emitter for cross-component communication
const propertyEvents = {
  listeners: new Set<() => void>(),
  emit: () => {
    propertyEvents.listeners.forEach(listener => listener());
  },
  subscribe: (listener: () => void) => {
    propertyEvents.listeners.add(listener);
    return () => {
      propertyEvents.listeners.delete(listener);
    };
  }
};

export const useProperties = () => {
  const [properties, setProperties] = useState<CustomProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    // Subscribe to external updates (from CalculatorScreen)
    const unsubscribe = propertyEvents.subscribe(() => {
      loadProperties();
      setUpdateTrigger(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      setProperties(jsonValue !== null ? JSON.parse(jsonValue) : []);
    } catch (error) {
      console.error("Error loading properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProperties = async (newProperties: CustomProperty[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProperties));
      setProperties(newProperties);
      setUpdateTrigger(prev => prev + 1);

      // Notify other components (like CalculatorScreen) that properties changed
      propertyEvents.emit();
    } catch (error) {
      console.error("Error saving properties:", error);
    }
  };

  const setAndSaveProperties = (
    newProperties: CustomProperty[] | ((prev: CustomProperty[]) => CustomProperty[])
  ) => {
    setProperties((prev) => {
      const updated = typeof newProperties === "function" ? newProperties(prev) : newProperties;
      saveProperties(updated);
      return updated;
    });
  };

  // Function to manually refresh (useful for pull-to-refresh)
  const refresh = useCallback(() => {
    loadProperties();
    setUpdateTrigger(prev => prev + 1);
  }, []);

  return {
    properties,
    setProperties: setAndSaveProperties,
    isLoading,
    loadProperties,
    saveProperties,
    refresh,
    updateTrigger
  };
};

// Export function for other screens to trigger refresh
export const refreshAllProperties = () => {
  propertyEvents.emit();
};

// ─── Color Palette ────────────────────────────────────────────────

export const COLOR_PALETTE = [
  "#E8613C", // Vermillion
  "#3B82F6", // Azure
  "#F0A500", // Amber
  "#22C55E", // Emerald
  "#A855F7", // Violet
  "#0EA5E9", // Sky
  "#F43F5E", // Rose
  "#14B8A6", // Teal
  "#EAB308", // Gold
  "#6366F1", // Indigo
  "#EC4899", // Fuchsia
  "#10B981", // Jade
];

// ─── Screen ───────────────────────────────────────────────────────

export default function PropertiesScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, C, isDark } = useTheme();
  const styles = makeStyles(C, isDark);

  const { properties, setProperties, isLoading, refresh, updateTrigger } = useProperties();
  const [modalVisible, setModalVisible] = useState(false);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<CustomProperty | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Also refresh when updateTrigger changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [updateTrigger]);

  const [newPropertyName, setNewPropertyName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [fieldType, setFieldType] = useState<DataField["type"]>("text");

  const resetPropertyForm = () => {
    setNewPropertyName("");
    setSelectedColor(COLOR_PALETTE[0]);
    setSelectedProperty(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetPropertyForm();
    setModalVisible(true);
  };

  const openEditModal = (property: CustomProperty) => {
    setSelectedProperty(property);
    setNewPropertyName(property.name);
    setSelectedColor(property.color);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const openViewModal = (property: CustomProperty) => {
    router.push({
      pathname: "./viewProperty",
      params: { id: property.id }
    });
  };

  const saveProperty = () => {
    if (!newPropertyName.trim()) return;

    if (isEditMode && selectedProperty) {
      setProperties(prev =>
        prev.map(p => p.id === selectedProperty.id
          ? { ...p, name: newPropertyName, color: selectedColor }
          : p
        )
      );
    } else {
      const newProperty: CustomProperty = {
        id: Date.now().toString(),
        name: newPropertyName,
        color: selectedColor,
        createdAt: Date.now(),
        dataFields: [],
      };
      setProperties(prev => [newProperty, ...prev]);
    }

    resetPropertyForm();
    setModalVisible(false);
  };

  const addDataField = () => {
    if (!selectedProperty || !fieldLabel.trim()) return;

    const newField: DataField = {
      id: `${selectedProperty.id}-${Date.now()}`,
      label: fieldLabel,
      value: fieldValue,
      type: fieldType,
    };

    setProperties(prev =>
      prev.map(p => p.id === selectedProperty.id
        ? { ...p, dataFields: [...p.dataFields, newField] }
        : p
      )
    );

    setFieldLabel("");
    setFieldValue("");
    setFieldType("text");
    setDataModalVisible(false);
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const deleteDataField = (propertyId: string, fieldId: string) => {
    setProperties(prev =>
      prev.map(p => p.id === propertyId
        ? { ...p, dataFields: p.dataFields.filter(f => f.id !== fieldId) }
        : p
      )
    );
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return 'document-text-outline';
      case 'number': return 'calculator-outline';
      case 'date': return 'calendar-outline';
      case 'boolean': return 'checkbox-outline';
      default: return 'document-outline';
    }
  };

  const formatPreviewValue = (field: DataField) => {
    switch (field.type) {
      case 'date':
        try {
          return new Date(field.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return field.value;
        }
      case 'boolean':
        return field.value === 'true' ? 'Yes' : 'No';
      case 'number':
        const num = Number(field.value);
        return isNaN(num) ? field.value : num.toLocaleString();
      default:
        return field.value.length > 20 ? field.value.substring(0, 20) + '...' : field.value;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const renderPropertyCard = ({ item, index }: { item: CustomProperty; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 80).springify()}
      exiting={SlideOutLeft}
      style={styles.card}
    >
      <Pressable onPress={() => openViewModal(item)} style={styles.cardPressable}>
        <View style={styles.cardHeader}>
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />
          <View style={styles.cardHeaderContent}>
            <View style={styles.titleSection}>
              <Text style={styles.propertyName}>{item.name}</Text>
              <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
            </View>
            <View style={styles.actionChips}>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={styles.actionChip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={16} color={C.text2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteProperty(item.id)}
                style={styles.actionChip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={16} color={C.negative} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {item.dataFields.length > 0 ? (
          <View style={styles.chipsContainer}>
            {item.dataFields.slice(0, 3).map(field => (
              <View key={field.id} style={[styles.chip, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={getFieldIcon(field.type) as any} size={12} color={item.color} />
                <Text style={[styles.chipLabel, { color: item.color }]}>{field.label}</Text>
                <Text style={styles.chipValue}>· {formatPreviewValue(field)}</Text>
              </View>
            ))}
            {item.dataFields.length > 3 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{item.dataFields.length - 3}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyFieldsPreview}>
            <Text style={styles.emptyFieldsPreviewText}>No fields yet</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.stat}>
            <Ionicons name="layers-outline" size={14} color={C.text2} />
            <Text style={styles.statText}>
              {item.dataFields.length} {item.dataFields.length === 1 ? 'field' : 'fields'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedProperty(item);
              setDataModalVisible(true);
            }}
            style={styles.addChip}
          >
            <Ionicons name="add" size={14} color={isDark ? C.bg0 : C.bg1} />
            <Text style={styles.addChipText}>Add Field</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );

  // ─── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />
        <Animated.View entering={FadeIn} style={styles.loaderContainer}>
          <View style={styles.loaderPulse}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={28} color={C.text2} />
          </View>
          <Text style={styles.loadingText}>Loading properties...</Text>
        </Animated.View>
      </View>
    );
  }

  // ─── Main ────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient colors={[C.bg0, C.bg1]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Properties</Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.createButton}>
            <Ionicons name="add" size={22} color={isDark ? C.bg0 : C.bg1} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{properties.length}</Text>
            <Text style={styles.headerStatLabel}>Total</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>
              {properties.reduce((acc, p) => acc + p.dataFields.length, 0)}
            </Text>
            <Text style={styles.headerStatLabel}>Fields</Text>
          </View>
        </View>
      </View>

      {/* Empty state */}
      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="home-outline" size={48} color={C.text3} />
          </View>
          <Text style={styles.emptyTitle}>No Properties Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first property to start organizing your real estate data
          </Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.emptyButton}>
            <View style={styles.emptyButtonInner}>
              <Ionicons name="add" size={18} color={isDark ? C.bg0 : C.bg1} />
              <Text style={styles.emptyButtonText}>Create Property</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={refreshKey}
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
          ]}
          showsVerticalScrollIndicator={false}
          extraData={properties}
          refreshing={isLoading}
          onRefresh={refresh}
        />
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────── */}
      <Modal
        animationType="none"
        transparent
        visible={modalVisible}
        onRequestClose={() => { resetPropertyForm(); setModalVisible(false); }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => { resetPropertyForm(); setModalVisible(false); }}
          />
          <Animated.View
            entering={SlideInDown.duration(350)}
            exiting={SlideOutDown.duration(250)}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? "Edit Property" : "New Property"}
              </Text>
              <TouchableOpacity
                onPress={() => { resetPropertyForm(); setModalVisible(false); }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={C.text2} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Beach House"
                  placeholderTextColor={C.text3}
                  value={newPropertyName}
                  onChangeText={setNewPropertyName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Color</Text>
                <View style={styles.colorGrid}>
                  {COLOR_PALETTE.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { resetPropertyForm(); setModalVisible(false); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveProperty}
              >
                <Text style={styles.saveText}>{isEditMode ? "Save" : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── Add Field Modal ─────────────────────────────────── */}
      <Modal
        animationType="none"
        transparent
        visible={dataModalVisible}
        onRequestClose={() => {
          setDataModalVisible(false);
          setFieldLabel("");
          setFieldValue("");
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setDataModalVisible(false);
              setFieldLabel("");
              setFieldValue("");
            }}
          />
          <Animated.View
            entering={SlideInDown.duration(350)}
            exiting={SlideOutDown.duration(250)}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Field to {selectedProperty?.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  setDataModalVisible(false);
                  setFieldLabel("");
                  setFieldValue("");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={C.text2} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Purchase Price"
                  placeholderTextColor={C.text3}
                  value={fieldLabel}
                  onChangeText={setFieldLabel}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Value</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter value"
                  placeholderTextColor={C.text3}
                  value={fieldValue}
                  onChangeText={setFieldValue}
                  multiline={fieldType === 'text'}
                  numberOfLines={fieldType === 'text' ? 3 : 1}
                  keyboardType={fieldType === 'number' ? 'numeric' : 'default'}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeGrid}>
                  {(["text", "number", "date", "boolean"] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeChip, fieldType === type && styles.typeChipSelected]}
                      onPress={() => setFieldType(type)}
                    >
                      <Ionicons
                        name={
                          type === 'text' ? 'document-text-outline' :
                            type === 'number' ? 'calculator-outline' :
                              type === 'date' ? 'calendar-outline' : 'checkbox-outline'
                        }
                        size={14}
                        color={fieldType === type ? (isDark ? C.bg0 : C.bg1) : C.text2}
                      />
                      <Text style={[
                        styles.typeChipText,
                        fieldType === type && styles.typeChipTextSelected,
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDataModalVisible(false);
                  setFieldLabel("");
                  setFieldValue("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addDataField}
              >
                <Text style={styles.saveText}>Add Field</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const makeStyles = (C: any, isDark: boolean) => {
  // CTA text color — bg0 on dark (near-black text on white button),
  // bg1 on light (white text on near-black button)
  const ctaText = isDark ? C.bg0 : C.bg1;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg0 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Loader
    loaderContainer: { alignItems: 'center', gap: Space.lg },
    loaderPulse: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: C.bg2, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: C.border1,
    },
    loadingText: { color: C.text3, fontSize: 13, letterSpacing: 0.2 },

    // Header
    header: { paddingTop: 64, paddingHorizontal: Space.xl, paddingBottom: Space.xxl },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Space.xxl
    },
    headerTitle: {
      fontSize: 30,
      fontWeight: '700',
      color: C.text0,
      letterSpacing: -1.0
    },
    createButton: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: C.accent,
      justifyContent: 'center', alignItems: 'center',
    },

    // Stats bar
    headerStats: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.bg1, borderRadius: Radius.lg,
      padding: Space.lg, borderWidth: 1, borderColor: C.border1,
    },
    headerStat: { flex: 1, alignItems: 'center' },
    headerStatValue: {
      fontSize: 22,
      fontWeight: '700',
      color: C.text0,
      marginBottom: 3,
      letterSpacing: -0.6
    },
    headerStatLabel: {
      fontSize: 10,
      color: C.text2,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      fontWeight: '600'
    },
    headerStatDivider: {
      width: 1,
      height: 28,
      backgroundColor: C.border1
    },

    // List
    list: { paddingHorizontal: Space.xl, paddingTop: 4 },

    // Card
    card: {
      marginBottom: 8, borderRadius: Radius.xl,
      backgroundColor: C.bg1, borderWidth: 1, borderColor: C.border1, overflow: 'hidden',
    },
    cardPressable: { padding: Space.lg },
    cardHeader: { flexDirection: 'row', marginBottom: Space.md },
    colorBar: { width: 3, height: 44, borderRadius: 2, marginRight: Space.md },
    cardHeaderContent: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    titleSection: { flex: 1 },
    propertyName: {
      fontSize: 17,
      fontWeight: '600',
      color: C.text0,
      marginBottom: 4,
      letterSpacing: -0.4
    },
    timeAgo: { fontSize: 12, color: C.text2 },
    actionChips: { flexDirection: 'row', gap: 6 },
    actionChip: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: C.bg3, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: C.border1,
    },

    // Field chips
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: Space.md
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.xs,
      gap: 4
    },
    chipLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
    chipValue: { fontSize: 11, color: C.text1 },
    moreChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: Radius.xs,
      backgroundColor: C.bg3,
      borderWidth: 1,
      borderColor: C.border1
    },
    moreChipText: { fontSize: 11, color: C.text2 },
    emptyFieldsPreview: { marginBottom: Space.md, paddingVertical: 6 },
    emptyFieldsPreviewText: { fontSize: 13, color: C.text3, fontStyle: 'italic' },

    // Card footer
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: C.border0
    },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 12, color: C.text2 },
    addChip: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.accent,
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: Radius.full, gap: 5,
    },
    addChipText: {
      fontSize: 11,
      color: ctaText,
      fontWeight: '700',
      letterSpacing: 0.1
    },

    // Empty state
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40
    },
    emptyIllustration: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: C.bg2,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 22,
      borderWidth: 1, borderColor: C.border1,
    },
    emptyTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: C.text0,
      marginBottom: 6,
      letterSpacing: -0.4
    },
    emptySubtitle: {
      fontSize: 14,
      color: C.text1,
      textAlign: 'center',
      marginBottom: 28,
      lineHeight: 20
    },
    emptyButton: { borderRadius: Radius.full, overflow: 'hidden' },
    emptyButtonInner: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 14, gap: 8,
      backgroundColor: C.accent, borderRadius: Radius.full,
    },
    emptyButtonText: {
      fontSize: 14,
      color: ctaText,
      fontWeight: '700',
      letterSpacing: -0.1
    },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay },
    modalContent: {
      backgroundColor: C.bg2,
      borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
      padding: Space.xxl, paddingBottom: 36,
      borderWidth: 1, borderColor: C.border1, borderBottomWidth: 0,
    },
    modalHandle: {
      width: 36,
      height: 3,
      backgroundColor: C.border2,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 22
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Space.xxl
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: C.text0,
      letterSpacing: -0.5
    },
    modalCloseButton: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: C.bg3, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: C.border1,
    },
    modalBody: { marginBottom: Space.xxl },
    inputGroup: { marginBottom: Space.xxl },
    inputLabel: {
      fontSize: 10,
      color: C.text2,
      marginBottom: 9,
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      fontWeight: '700'
    },
    input: {
      backgroundColor: C.bg3, borderRadius: Radius.md, padding: 15,
      fontSize: 15, color: C.text0, borderWidth: 1, borderColor: C.border1,
      letterSpacing: -0.1,
    },

    // Color picker
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorSwatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2.5,
      borderColor: 'transparent'
    },
    colorSwatchSelected: {
      borderColor: C.text0,
      transform: [{ scale: 1.1 }]
    },

    // Type chips
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeChip: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 12, borderRadius: Radius.sm,
      backgroundColor: C.bg3, borderWidth: 1, borderColor: C.border1,
    },
    typeChipSelected: {
      backgroundColor: C.accent,
      borderColor: C.accent
    },
    typeChipText: {
      fontSize: 13,
      color: C.text1,
      textTransform: 'capitalize',
      letterSpacing: 0.1
    },
    typeChipTextSelected: {
      color: ctaText,
      fontWeight: '700'
    },

    // Modal footer
    modalFooter: { flexDirection: 'row', gap: 10 },
    modalButton: { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
    cancelButton: {
      backgroundColor: C.bg3, justifyContent: 'center', alignItems: 'center',
      paddingVertical: 15, borderRadius: Radius.md,
      borderWidth: 1, borderColor: C.border1,
    },
    cancelText: { fontSize: 14, color: C.text1, fontWeight: '600' },
    saveButton: {
      backgroundColor: C.accent,
      justifyContent: 'center', alignItems: 'center',
      paddingVertical: 15, borderRadius: Radius.md,
    },
    saveText: {
      fontSize: 14,
      color: ctaText,
      fontWeight: '700',
      letterSpacing: -0.1
    },
  });
};
