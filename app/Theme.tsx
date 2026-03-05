// ─────────────────────────────────────────────────────────────────
//  DESIGN SYSTEM — Premium Fintech · Dark & Light Mode
//  v3 — Neutral White accent · Clean · Timeless
//  Philosophy: let the ratio card colors do the work,
//  the UI chrome stays silent and elegant.
// ─────────────────────────────────────────────────────────────────

export const Colors = {
    dark: {
        // ── Backgrounds — 6-level depth ──────────────────────────────
        bg0: '#08080A',   // void — screen base
        bg1: '#0E0E12',   // cards
        bg2: '#131318',   // elevated cards, sheet backgrounds
        bg3: '#1A1A20',   // inputs, tags, chips
        bg4: '#20202A',   // hover / pressed states
        bg5: '#28282F',   // active selection

        // ── Borders ──────────────────────────────────────────────────
        border0: '#14141C',   // hairline — barely visible
        border1: '#1C1C26',   // default card borders
        border2: '#26263A',   // medium — modals, focus rings
        border3: '#32323E',   // strong — selected states

        // ── Text ─────────────────────────────────────────────────────
        text0: '#F4F2EE',   // primary — warm off-white
        text1: '#92909E',   // secondary
        text2: '#52505E',   // tertiary / labels
        text3: '#30303A',   // ghost / disabled / placeholders

        // ── Accent — Warm White (neutral, timeless) ──────────────────
        accent: '#E8E6E0',   // primary — warm white
        accentHover: '#F2F0EA',   // brighter on press
        accentSoft: 'rgba(232,230,224,0.08)',
        accentMid: 'rgba(232,230,224,0.14)',
        accentStrong: 'rgba(232,230,224,0.24)',

        // ── Gold — subtle highlight ───────────────────────────────────
        gold: '#C8A24A',
        goldSoft: 'rgba(200,162,74,0.10)',
        goldMid: 'rgba(200,162,74,0.18)',

        // ── Semantic ─────────────────────────────────────────────────
        positive: '#34D399',
        positiveSoft: 'rgba(52,211,153,0.10)',
        positiveMid: 'rgba(52,211,153,0.18)',

        negative: '#FB7185',
        negativeSoft: 'rgba(251,113,133,0.10)',
        negativeMid: 'rgba(251,113,133,0.18)',

        warning: '#FBBF24',
        warningSoft: 'rgba(251,191,36,0.10)',

        info: '#38BDF8',
        infoSoft: 'rgba(56,189,248,0.10)',

        // ── Surfaces & Overlays ──────────────────────────────────────
        overlay: 'rgba(0,0,0,0.88)',
        overlayMid: 'rgba(0,0,0,0.55)',
        shimmer: 'rgba(255,255,255,0.02)',

        // ── Shadows ──────────────────────────────────────────────────
        shadow: 'rgba(0,0,0,0.65)',
        shadowSm: 'rgba(0,0,0,0.40)',
        glowAccent: 'rgba(232,230,224,0.06)',
        glowGold: 'rgba(200,162,74,0.12)',
    },

    light: {
        // ── Backgrounds ──────────────────────────────────────────────
        bg0: '#F4F3F0',   // warm parchment — screen base
        bg1: '#FFFFFF',   // cards
        bg2: '#EEECEA',   // elevated — modals, sheets
        bg3: '#E6E4DF',   // inputs, chips
        bg4: '#DCDAD4',   // hover
        bg5: '#D2D0C9',   // active selection

        // ── Borders ──────────────────────────────────────────────────
        border0: '#ECEAE4',   // hairline
        border1: '#E2E0D8',   // default
        border2: '#CCCAC2',   // medium
        border3: '#B8B6AE',   // strong

        // ── Text ─────────────────────────────────────────────────────
        text0: '#18161C',   // near-black, slight warm tint
        text1: '#4E4C58',   // secondary
        text2: '#8C8A96',   // tertiary
        text3: '#BCBAC4',   // ghost / disabled

        // ── Accent — deep charcoal (inverse of dark mode white) ──────
        accent: '#1C1A22',
        accentHover: '#2A2832',
        accentSoft: 'rgba(28,26,34,0.06)',
        accentMid: 'rgba(28,26,34,0.12)',
        accentStrong: 'rgba(28,26,34,0.20)',

        // ── Gold ─────────────────────────────────────────────────────
        gold: '#A07830',
        goldSoft: 'rgba(160,120,48,0.08)',
        goldMid: 'rgba(160,120,48,0.16)',

        // ── Semantic ─────────────────────────────────────────────────
        positive: '#059669',
        positiveSoft: 'rgba(5,150,105,0.08)',
        positiveMid: 'rgba(5,150,105,0.15)',

        negative: '#E11D48',
        negativeSoft: 'rgba(225,29,72,0.08)',
        negativeMid: 'rgba(225,29,72,0.15)',

        warning: '#D97706',
        warningSoft: 'rgba(217,119,6,0.08)',

        info: '#0284C7',
        infoSoft: 'rgba(2,132,199,0.08)',

        // ── Surfaces & Overlays ──────────────────────────────────────
        overlay: 'rgba(0,0,0,0.48)',
        overlayMid: 'rgba(0,0,0,0.28)',
        shimmer: 'rgba(0,0,0,0.02)',

        // ── Shadows ──────────────────────────────────────────────────
        shadow: 'rgba(0,0,0,0.10)',
        shadowSm: 'rgba(0,0,0,0.05)',
        glowAccent: 'rgba(28,26,34,0.08)',
        glowGold: 'rgba(160,120,48,0.10)',
    },
};

// ─────────────────────────────────────────────────────────────────
//  TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────
export const Type = {
    d1: { fontSize: 36, fontWeight: '700', letterSpacing: -1.5, lineHeight: 42 },
    d2: { fontSize: 28, fontWeight: '700', letterSpacing: -1.0, lineHeight: 34 },
    d3: { fontSize: 22, fontWeight: '600', letterSpacing: -0.7, lineHeight: 28 },

    h1: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, lineHeight: 26 },
    h2: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4, lineHeight: 22 },
    h3: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2, lineHeight: 20 },

    b1: { fontSize: 15, fontWeight: '400', letterSpacing: -0.1, lineHeight: 22 },
    b2: { fontSize: 13, fontWeight: '400', letterSpacing: 0, lineHeight: 19 },
    b3: { fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 17 },

    label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, lineHeight: 14, textTransform: 'uppercase' as const },
    labelSm: { fontSize: 9, fontWeight: '700', letterSpacing: 0.7, lineHeight: 12, textTransform: 'uppercase' as const },

    mono: { fontSize: 13, fontFamily: 'monospace', letterSpacing: 0.2, lineHeight: 19 },
    monoLg: { fontSize: 16, fontFamily: 'monospace', letterSpacing: 0.1, lineHeight: 22 },

    result: { fontSize: 40, fontWeight: '200', letterSpacing: -1.5, lineHeight: 46 },
    stat: { fontSize: 24, fontWeight: '700', letterSpacing: -0.8, lineHeight: 30 },
};

// ─────────────────────────────────────────────────────────────────
//  RADIUS
// ─────────────────────────────────────────────────────────────────
export const Radius = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    full: 999,
};

// ─────────────────────────────────────────────────────────────────
//  SPACING
// ─────────────────────────────────────────────────────────────────
export const Space = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

// ─────────────────────────────────────────────────────────────────
//  SHADOWS
// ─────────────────────────────────────────────────────────────────
export const Shadows = {
    sm: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
    md: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4 },
    lg: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 28, elevation: 8 },
    // Usage: { ...Shadows.md, shadowColor: C.shadow }
};

// ─────────────────────────────────────────────────────────────────
//  ANIMATION
// ─────────────────────────────────────────────────────────────────
export const Motion = {
    fast: 150,
    normal: 280,
    slow: 420,
    spring: { damping: 18, stiffness: 220 },
    bounce: { damping: 12, stiffness: 180 },
};

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────

/** Append opacity hex to a 6-digit hex color */
export const alpha = (hex: string, opacity: number): string => {
    const pct = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${hex}${pct}`;
};

/** Category → vibrant card color — UI chrome stays neutral */
export const CategoryColors: Record<string, string> = {
    Income: '#E8613C',
    Valuation: '#3B82F6',
    Profitability: '#F0A500',
    'Cash Flow': '#22C55E',
    Return: '#A855F7',
    Performance: '#0EA5E9',
    Risk: '#F43F5E',
    Debt: '#14B8A6',
    Leverage: '#EAB308',
    Efficiency: '#6366F1',
};

// Expo Router no-op export
export default function ThemeTokensRoute() { return null; }
