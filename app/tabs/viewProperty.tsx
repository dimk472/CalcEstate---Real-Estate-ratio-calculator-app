import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Space } from '../Theme';
import { useTheme } from '../ThemeContext'; // ← πλέον από context
import { useProperties } from "./properties";

export default function ViewPropertyScreen() {
    const { colorScheme, C } = useTheme(); // ← αντικατέστησε το useColorScheme
    const styles = makeStyles(C);
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { properties, setProperties } = useProperties();
    const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

    const property = properties.find(p => p.id === id);

    if (!property) {
        return (
            <View style={styles.container}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <LinearGradient
                    colors={[C.bg0, C.bg1]}
                    style={StyleSheet.absoluteFill}
                />
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={C.text0} />
                </TouchableOpacity>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={C.text3} />
                    <Text style={styles.errorText}>Property not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const formatValue = (field: any) => {
        try {
            switch (field.type) {
                case 'date':
                    return new Date(field.value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                case 'boolean':
                    return field.value === 'true' ? 'Yes' : 'No';
                case 'number':
                    const num = Number(field.value);
                    return isNaN(num) ? field.value : num.toLocaleString();
                default:
                    return field.value;
            }
        } catch {
            return field.value;
        }
    };

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'text': return 'document-text';
            case 'number': return 'calculator';
            case 'date': return 'calendar';
            case 'boolean': return 'checkbox';
            default: return 'document';
        }
    };

    const handleDeleteField = (fieldId: string, fieldLabel: string) => {
        Alert.alert(
            "Delete Field",
            `Are you sure you want to delete "${fieldLabel}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setDeletingFieldId(fieldId);
                        setProperties((prev) =>
                            prev.map((prop) => {
                                if (prop.id === property.id) {
                                    return {
                                        ...prop,
                                        dataFields: prop.dataFields.filter((f) => f.id !== fieldId),
                                    };
                                }
                                return prop;
                            })
                        );
                        setTimeout(() => setDeletingFieldId(null), 300);
                    }
                }
            ]
        );
    };

    const isRatioResult = (field: any) => {
        return field.label.includes('Result') || field.label.includes('result');
    };

    return (
        <View style={styles.container}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <LinearGradient
                colors={[C.bg0, C.bg1]}
                style={StyleSheet.absoluteFill}
            />

            <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-down" size={22} color={C.text0} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={[styles.headerDot, { backgroundColor: property.color }]} />
                    <Text style={styles.headerTitle}>{property.name}</Text>
                </View>
                <View style={styles.headerButton} />
            </BlurView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.contentContainer,
                    { paddingBottom: 90 + (insets.bottom > 0 ? insets.bottom : 0) }
                ]}
            >
                <Animated.View entering={SlideInDown.delay(100)} style={styles.heroSection}>
                    <LinearGradient
                        colors={[`${property.color}20`, C.bg1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={[styles.heroIcon, { backgroundColor: `${property.color}20` }]}>
                            <Ionicons name="home-outline" size={32} color={property.color} />
                        </View>
                        <Text style={styles.heroTitle}>{property.name}</Text>
                        <View style={styles.heroStats}>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{property.dataFields.length}</Text>
                                <Text style={styles.heroStatLabel}>fields</Text>
                            </View>
                            <View style={styles.heroStatDivider} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>
                                    {new Date(property.createdAt).toLocaleDateString('en-US', { day: 'numeric' })}
                                </Text>
                                <Text style={styles.heroStatLabel}>
                                    {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>All Fields</Text>

                    {property.dataFields.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="layers-outline" size={40} color={C.text3} />
                            </View>
                            <Text style={styles.emptyTitle}>No Fields Added</Text>
                            <Text style={styles.emptyText}>
                                Add fields to start tracking your property data
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.fieldsGrid}>
                            {property.dataFields.map((field, index) => (
                                <Animated.View
                                    key={field.id}
                                    entering={FadeIn.delay(200 + index * 50)}
                                    style={[
                                        styles.fieldCard,
                                        deletingFieldId === field.id && styles.fieldCardDeleting
                                    ]}
                                >
                                    <View style={styles.fieldHeader}>
                                        <View style={[styles.fieldIcon, { backgroundColor: `${property.color}15` }]}>
                                            <Ionicons
                                                name={getFieldIcon(field.type) as any}
                                                size={20}
                                                color={property.color}
                                            />
                                        </View>
                                        <View style={styles.fieldHeaderText}>
                                            <Text style={styles.fieldLabel}>{field.label}</Text>
                                            <View style={styles.fieldMeta}>
                                                {isRatioResult(field) && (
                                                    <View style={[styles.ratioBadge, { backgroundColor: `${property.color}20` }]}>
                                                        <Ionicons name="calculator" size={10} color={property.color} />
                                                        <Text style={[styles.ratioBadgeText, { color: property.color }]}>Result</Text>
                                                    </View>
                                                )}
                                                <Text style={styles.fieldType}>{field.type}</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => handleDeleteField(field.id, field.label)}
                                            style={styles.deleteButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="trash-outline" size={18} color={C.negative} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.fieldValueContainer}>
                                        <Text style={styles.fieldValue} numberOfLines={3}>
                                            {formatValue(field)}
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const makeStyles = (C: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg0,
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
        paddingBottom: 16,
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
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.text0,
        letterSpacing: -0.2,
    },
    content: {
        flex: 1,
        marginTop: 94,
    },
    contentContainer: {
        paddingHorizontal: Space.xl,
        paddingBottom: 48,
    },
    heroSection: {
        marginBottom: 24,
        borderRadius: Radius.xl,
        overflow: 'hidden',
        backgroundColor: C.bg1,
        borderWidth: 1,
        borderColor: C.border0,
    },
    heroGradient: {
        padding: Space.xxl,
        alignItems: 'center',
    },
    heroIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: C.border1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: C.text0,
        letterSpacing: -0.9,
        marginBottom: 20,
        textAlign: 'center',
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 28,
    },
    heroStat: {
        alignItems: 'center',
    },
    heroStatValue: {
        fontSize: 21,
        fontWeight: '700',
        color: C.text0,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    heroStatLabel: {
        fontSize: 10,
        color: C.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        fontWeight: '600',
    },
    heroStatDivider: {
        width: 1,
        height: 28,
        backgroundColor: C.border1,
    },
    section: {
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: C.text2,
        marginBottom: 12,
        letterSpacing: 0.9,
        textTransform: 'uppercase',
    },
    fieldsGrid: {
        gap: 8,
    },
    fieldCard: {
        backgroundColor: C.bg1,
        borderRadius: Radius.lg,
        padding: Space.lg,
        borderWidth: 1,
        borderColor: C.border0,
    },
    fieldCardDeleting: {
        opacity: 0.4,
        transform: [{ scale: 0.97 }],
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldIcon: {
        width: 38,
        height: 38,
        borderRadius: Radius.xs,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fieldHeaderText: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: C.text0,
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    fieldMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fieldType: {
        fontSize: 10,
        color: C.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        fontWeight: '600',
    },
    ratioBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratioBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    deleteButton: {
        padding: 8,
        opacity: 0.7,
    },
    fieldValueContainer: {
        backgroundColor: C.bg2,
        borderRadius: Radius.sm,
        padding: 14,
        borderWidth: 1,
        borderColor: C.border0,
    },
    fieldValue: {
        fontSize: 15,
        color: C.text0,
        lineHeight: 22,
        letterSpacing: -0.1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: C.bg1,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: C.border0,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: C.bg2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: C.border1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text0,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    emptyText: {
        fontSize: 13,
        color: C.text2,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 19,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 16,
        color: C.text1,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: C.accent,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: Radius.full,
    },
    errorButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 54, right: 20,
        zIndex: 100,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.bg2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.border1,
    },
});
