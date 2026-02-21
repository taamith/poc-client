import { createTheme, alpha } from '@mui/material/styles';

/**
 * AutoSprint AI — Design System 2.0
 *
 * Primary  : Facebook Blue            (#1877F2 → #166FE5 → #0D65D9)
 * Neutrals : Slate scale              (#0F172A … #F8FAFC)
 * Semantic : Emerald / Amber / Rose   (success / warning / error)
 *
 * ROLLBACK — Violet theme:
 *   V700 = '#5B21B6', V600 = '#6D28D9', V500 = '#7C3AED'
 *   V100 = '#EDE9FE', V50  = '#F5F3FF'
 */

// ── Brand — Facebook Blue ─────────────────────────────────────────────────────
const V900 = '#0A3D8F';   // deepest blue
const V800 = '#0D52BF';   // dark blue
const V700 = '#0D65D9';   // primary dark
const V600 = '#1877F2';   // primary (Facebook blue)
const V500 = '#3D90F5';   // primary light
const V100 = '#E7F0FD';   // tint background
const V50  = '#F0F6FF';   // subtlest tint

const GRADIENT       = `linear-gradient(135deg, ${V700} 0%, ${V600} 55%, ${V500} 100%)`;
const GRADIENT_HOVER = `linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)`;

// ── Slate neutrals ────────────────────────────────────────────────────────────
const S950 = '#020617';
const S900 = '#0F172A';   // primary text
const S800 = '#1E293B';
const S700 = '#334155';
const S600 = '#475569';   // secondary text
const S500 = '#64748B';
const S400 = '#94A3B8';   // muted / disabled
const S300 = '#CBD5E1';   // borders
const S200 = '#E2E8F0';   // subtle borders
const S100 = '#F1F5F9';   // hover backgrounds
const S50  = '#F8FAFC';   // page background

// ── Semantic ──────────────────────────────────────────────────────────────────
const SUCCESS = '#059669';  // emerald-600
const WARNING = '#D97706';  // amber-600
const ERROR   = '#DC2626';  // red-600
const INFO    = '#0284C7';  // sky-600

export const theme = createTheme({

  /* ─── Palette ───────────────────────────────────────────────────────────── */
  palette: {
    primary: {
      main:         V600,
      dark:         V700,
      light:        V500,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:         V500,
      dark:         V600,
      light:        V100,
      contrastText: '#FFFFFF',
    },
    error:   { main: ERROR,   light: '#FEE2E2', dark: '#B91C1C', contrastText: '#fff' },
    warning: { main: WARNING, light: '#FEF3C7', dark: '#B45309', contrastText: '#fff' },
    success: { main: SUCCESS, light: '#D1FAE5', dark: '#047857', contrastText: '#fff' },
    info:    { main: INFO,    light: '#E0F2FE', dark: '#0369A1', contrastText: '#fff' },
    text: {
      primary:   S900,
      secondary: S600,
      disabled:  S400,
    },
    divider: S200,
    background: {
      default: S50,
      paper:   '#FFFFFF',
    },
    grey: {
      50:  S50,
      100: S100,
      200: S200,
      300: S300,
      400: S400,
      500: S500,
      600: S600,
      700: S700,
      800: S800,
      900: S900,
    },
    action: {
      hover:           alpha(V600, 0.06),
      selected:        alpha(V600, 0.10),
      disabledBackground: S100,
      disabled:        S400,
    },
  },

  /* ─── Typography ────────────────────────────────────────────────────────── */
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    700,

    h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15, color: S900 },
    h2: { fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.2,  color: S900 },
    h3: { fontSize: '1.5rem',  fontWeight: 700, letterSpacing: '-0.03em',  lineHeight: 1.25, color: S900 },
    h4: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.3,  color: S900 },
    h5: { fontSize: '1.1rem',  fontWeight: 700, letterSpacing: '-0.02em',  lineHeight: 1.35, color: S900 },
    h6: { fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.4,  color: S900 },

    body1:   { fontSize: '0.9rem',  lineHeight: 1.65, letterSpacing: '-0.006em', color: S900 },
    body2:   { fontSize: '0.825rem', lineHeight: 1.6, letterSpacing: '-0.005em', color: S600 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5,  letterSpacing: '0.01em',   color: S500 },
    overline:{ fontSize: '0.68rem', lineHeight: 1.5,  letterSpacing: '0.08em',   fontWeight: 700, textTransform: 'uppercase', color: S500 },
    button:  { fontWeight: 600, letterSpacing: '-0.01em' },
  },

  /* ─── Shape ─────────────────────────────────────────────────────────────── */
  shape: { borderRadius: 10 },

  /* ─── Shadows (soft, layered) ───────────────────────────────────────────── */
  shadows: [
    'none',
    `0 1px 2px ${alpha(S950, 0.05)}`,
    `0 1px 4px ${alpha(S950, 0.06)}, 0 1px 2px ${alpha(S950, 0.04)}`,
    `0 2px 8px ${alpha(S950, 0.07)}, 0 1px 3px ${alpha(S950, 0.05)}`,
    `0 4px 12px ${alpha(S950, 0.08)}, 0 2px 4px ${alpha(S950, 0.05)}`,
    `0 6px 16px ${alpha(S950, 0.09)}, 0 2px 6px ${alpha(S950, 0.06)}`,
    `0 8px 20px ${alpha(S950, 0.10)}, 0 3px 6px ${alpha(S950, 0.06)}`,
    `0 10px 24px ${alpha(S950, 0.10)}, 0 4px 8px ${alpha(S950, 0.06)}`,
    `0 12px 28px ${alpha(S950, 0.11)}, 0 4px 8px ${alpha(S950, 0.06)}`,
    `0 14px 32px ${alpha(S950, 0.11)}, 0 5px 10px ${alpha(S950, 0.07)}`,
    `0 16px 36px ${alpha(S950, 0.12)}, 0 5px 10px ${alpha(S950, 0.07)}`,
    `0 18px 40px ${alpha(S950, 0.12)}, 0 6px 12px ${alpha(S950, 0.07)}`,
    `0 20px 44px ${alpha(S950, 0.13)}, 0 6px 12px ${alpha(S950, 0.08)}`,
    `0 22px 48px ${alpha(S950, 0.13)}, 0 7px 14px ${alpha(S950, 0.08)}`,
    `0 24px 52px ${alpha(S950, 0.14)}, 0 8px 16px ${alpha(S950, 0.08)}`,
    `0 26px 56px ${alpha(S950, 0.14)}, 0 8px 16px ${alpha(S950, 0.08)}`,
    `0 28px 60px ${alpha(S950, 0.14)}, 0 9px 18px ${alpha(S950, 0.09)}`,
    `0 30px 64px ${alpha(S950, 0.15)}, 0 10px 20px ${alpha(S950, 0.09)}`,
    `0 32px 68px ${alpha(S950, 0.15)}, 0 10px 20px ${alpha(S950, 0.09)}`,
    `0 34px 72px ${alpha(S950, 0.15)}, 0 11px 22px ${alpha(S950, 0.09)}`,
    `0 36px 76px ${alpha(S950, 0.16)}, 0 12px 24px ${alpha(S950, 0.10)}`,
    `0 38px 80px ${alpha(S950, 0.16)}, 0 12px 24px ${alpha(S950, 0.10)}`,
    `0 40px 84px ${alpha(S950, 0.16)}, 0 13px 26px ${alpha(S950, 0.10)}`,
    `0 42px 88px ${alpha(S950, 0.17)}, 0 14px 28px ${alpha(S950, 0.10)}`,
    `0 44px 92px ${alpha(S950, 0.17)}, 0 14px 28px ${alpha(S950, 0.11)}`,
  ],

  /* ─── Component overrides ───────────────────────────────────────────────── */
  components: {

    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: S50,
          color: S900,
        },
        '::-webkit-scrollbar':       { width: 5, height: 5 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: S300, borderRadius: 6 },
        '::-webkit-scrollbar-thumb:hover': { background: S400 },
        'a': { color: V600, textDecoration: 'none' },
        'a:hover': { textDecoration: 'underline' },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: 9,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          transition: 'all 0.18s ease',
        },
        sizeLarge:  { fontSize: '0.92rem', padding: '10px 22px' },
        sizeMedium: { fontSize: '0.85rem', padding: '7px 16px'  },
        sizeSmall:  { fontSize: '0.78rem', padding: '4px 12px'  },

        containedPrimary: {
          background: GRADIENT,
          boxShadow: `0 2px 8px ${alpha(V600, 0.30)}`,
          '&:hover': {
            background: GRADIENT_HOVER,
            boxShadow: `0 4px 14px ${alpha(V600, 0.40)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)', boxShadow: `0 2px 6px ${alpha(V600, 0.28)}` },
          '&.Mui-disabled': { background: S200, color: S400, boxShadow: 'none' },
        },

        outlinedPrimary: {
          borderColor: S300,
          color: V600,
          '&:hover': { borderColor: V500, backgroundColor: V50, transform: 'translateY(-1px)' },
        },

        textPrimary: {
          color: V600,
          '&:hover': { backgroundColor: V50 },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: 'all 0.15s ease',
          '&:hover': { backgroundColor: S100 },
        },
      },
    },

    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            transition: 'box-shadow 0.15s ease',
            '& fieldset': { borderColor: S200 },
            '&:hover fieldset': { borderColor: S400 },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(V600, 0.12)}`,
            },
            '&.Mui-focused fieldset': { borderColor: V600, borderWidth: 1.5 },
            '&.Mui-error fieldset': { borderColor: ERROR },
            '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(ERROR, 0.12)}` },
          },
          '& .MuiInputLabel-root': { color: S500, fontSize: '0.85rem' },
          '& .MuiInputLabel-root.Mui-focused': { color: V600 },
          '& .MuiInputLabel-root.Mui-error': { color: ERROR },
          '& .MuiFormHelperText-root': { fontSize: '0.72rem', marginLeft: 0 },
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: '#fff' },
        rounded: { borderRadius: 14 },
        elevation1: { boxShadow: `0 1px 3px ${alpha(S950, 0.07)}, 0 1px 2px ${alpha(S950, 0.05)}` },
        elevation2: { boxShadow: `0 4px 12px ${alpha(S950, 0.08)}, 0 2px 4px ${alpha(S950, 0.05)}` },
        elevation3: { boxShadow: `0 8px 24px ${alpha(S950, 0.10)}, 0 3px 8px ${alpha(S950, 0.06)}` },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${S200}`,
          backgroundColor: '#fff',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
          border: 'none',
        },
        sizeSmall: { height: 22, fontSize: '0.7rem', borderRadius: 6 },
        colorPrimary: {
          backgroundColor: V100,
          color: V700,
          '&:hover': { backgroundColor: alpha(V600, 0.18) },
        },
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          backgroundColor: S800,
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 500,
          borderRadius: 7,
          padding: '5px 10px',
          boxShadow: `0 4px 12px ${alpha(S950, 0.2)}`,
        },
        arrow: { color: S800 },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: S200 },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${S200}`,
          boxShadow: `0 8px 28px ${alpha(S950, 0.12)}, 0 2px 8px ${alpha(S950, 0.08)}`,
          backgroundImage: 'none',
        },
        list: { padding: '6px' },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.83rem',
          fontWeight: 500,
          padding: '7px 10px',
          color: S800,
          '&:hover': { backgroundColor: S100 },
          '&.Mui-selected': { backgroundColor: V100, color: V700, fontWeight: 600 },
          '&.Mui-selected:hover': { backgroundColor: alpha(V600, 0.14) },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: 'all 0.15s ease',
          '&:hover': { backgroundColor: S100 },
          '&.Mui-selected': { backgroundColor: V100, color: V700, fontWeight: 600 },
          '&.Mui-selected:hover': { backgroundColor: alpha(V600, 0.14) },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background: GRADIENT,
          fontWeight: 700,
          fontSize: '0.85rem',
        },
        colorDefault: { background: GRADIENT, color: '#fff' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha('#fff', 0.97),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${S200}`,
          color: S900,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: `0 24px 60px ${alpha(S950, 0.18)}, 0 8px 20px ${alpha(S950, 0.10)}`,
          border: `1px solid ${S200}`,
        },
        backdrop: { backgroundColor: alpha(S900, 0.5) },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 800, fontSize: '1.05rem', color: S900, paddingBottom: 4 },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, backgroundColor: V100, height: 6 },
        bar:  { background: GRADIENT, borderRadius: 99 },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: { color: V600 },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: S300,
          borderRadius: 5,
          '&.Mui-checked': { color: V600 },
          '&:hover': { backgroundColor: V50 },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: S300,
          '&.Mui-checked': { color: V600 },
          '&:hover': { backgroundColor: V50 },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: { padding: 6 },
        track: {
          borderRadius: 99,
          backgroundColor: S300,
          opacity: 1,
          '.Mui-checked.Mui-checked + &': { backgroundColor: V600, opacity: 1 },
        },
        thumb: { boxShadow: `0 1px 3px ${alpha(S950, 0.2)}` },
        switchBase: {
          '&.Mui-checked': { color: '#fff' },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '-0.01em',
          color: S500,
          '&.Mui-selected': { color: V600 },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: V600, height: 2, borderRadius: 99 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontSize: '0.83rem', fontWeight: 500 },
        standardSuccess: { backgroundColor: '#D1FAE5', color: '#065F46' },
        standardError:   { backgroundColor: '#FEE2E2', color: '#991B1B' },
        standardWarning: { backgroundColor: '#FEF3C7', color: '#92400E' },
        standardInfo:    { backgroundColor: '#E0F2FE', color: '#075985' },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { color: S400 },
        li: { fontSize: '0.78rem' },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: S100, borderRadius: 8 },
      },
    },
  },
});
