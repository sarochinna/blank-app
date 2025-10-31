// Design tokens extracted from Figma Spark Web Design System

export const colors = {
  // Dark theme colors
  bg: {
    dark: '#181818',
    light: '#F1F4FD',
  },
  neutral: {
    1: '#0D0D0D',  // Neutral bg
    2: '#1A1A1A',  // Sec. bg, Item bg hover
    3: '#202020',  // Disabled bg, Item bg pressed
    4: '#262626',  // Borders, Dividers, Item bg Selected
    5: '#2E2E2E',  // Input field outline
    6: '#666666',  // Disabled Text
    7: '#747474',  // Placeholder Text
    8: '#A8A8A8',  // Caption, Secondary, helper Text
    9: '#BFBFBF',  // Body, Inactive Text
    10: '#F0F0F0', // Heading, Title
  },
  primary: {
    main: '#667FFF',      // Primary/Dark/Main
    surface: '#1C2533',   // Primary/Dark/Surface
    bg: '#16182525',      // Primary/Dark/BG
    border: '#3E5588',    // Primary/Dark/Border
    hover: '#6A89E8',     // Primary/Dark/Hover
    pressed: '#4E60C9',   // Primary/Dark/Pressed
    focus: '#324A85',     // Primary/Dark/Focus
  },
  success: {
    main: '#3FAF9F',      // Success/Dark/Main
    surface: '#132A23',   // Success/Dark/Surface
    bg: '#132A23',        // Success/Dark/BG
    border: '#2B5750',    // Success/Dark/Border
    hover: '#5AACA1',     // Success/Dark/Hover
    pressed: '#AFD0C9',   // Success/Dark/Pressed
  },
  error: {
    main: '#F96363',      // Error/Dark/Main
    surface: '#1E0F0F',   // Error/Dark/Surface
    bg: '#180D0D',        // Error/Dark/BG
    border: '#5A2A2A',    // Error/Dark/Border
    hover: '#E88683',     // Error/Dark/Hover
    pressed: '#F8DDDA',   // Error/Dark/Pressed
  },
  warning: {
    main: '#FFD26C',      // Warning/Dark/Main
    surface: '#312411',   // Warning/Dark/Surface
    bg: '#1B1711',        // Warning/Dark/BG
    border: '#6A4D1E',    // Warning/Dark/Border
  },
} as const;

export const typography = {
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  label: {
    xxsmall: {
      regular: { fontSize: 10, lineHeight: 'auto', fontWeight: 400 },
      medium: { fontSize: 10, lineHeight: 'auto', fontWeight: 500 },
      semibold: { fontSize: 10, lineHeight: 'auto', fontWeight: 600 },
    },
    xsmall: {
      regular: { fontSize: 11, lineHeight: '16px', fontWeight: 400 },
      medium: { fontSize: 11, lineHeight: '16px', fontWeight: 500 },
      semibold: { fontSize: 11, lineHeight: '16px', fontWeight: 600 },
    },
    small: {
      regular: { fontSize: 12, lineHeight: '16px', fontWeight: 400 },
      medium: { fontSize: 12, lineHeight: '16px', fontWeight: 500 },
      semibold: { fontSize: 12, lineHeight: '16px', fontWeight: 600 },
    },
    default: {
      regular: { fontSize: 13, lineHeight: '20px', fontWeight: 400 },
      medium: { fontSize: 13, lineHeight: '20px', fontWeight: 500 },
      semibold: { fontSize: 13, lineHeight: '20px', fontWeight: 600 },
    },
    large: {
      regular: { fontSize: 15, lineHeight: '24px', fontWeight: 400 },
      medium: { fontSize: 15, lineHeight: '24px', fontWeight: 500 },
      semibold: { fontSize: 15, lineHeight: '24px', fontWeight: 600 },
    },
    xl: {
      regular: { fontSize: 17, lineHeight: '24px', fontWeight: 400 },
      medium: { fontSize: 17, lineHeight: '24px', fontWeight: 500 },
      semibold: { fontSize: 17, lineHeight: '24px', fontWeight: 600 },
    },
    xxl: {
      regular: { fontSize: 19, lineHeight: '24px', fontWeight: 400 },
      medium: { fontSize: 19, lineHeight: '24px', fontWeight: 500 },
      semibold: { fontSize: 19, lineHeight: '24px', fontWeight: 600 },
    },
    xxxl: {
      regular: { fontSize: 23, lineHeight: '32px', fontWeight: 400 },
      medium: { fontSize: 23, lineHeight: '32px', fontWeight: 500 },
      semibold: { fontSize: 23, lineHeight: '32px', fontWeight: 600 },
    },
  },
  button: {
    xxs: { fontSize: 10, lineHeight: '16px', fontWeight: 500 },
    xs: { fontSize: 11, lineHeight: '16px', fontWeight: 500 },
    s: { fontSize: 12, lineHeight: '16px', fontWeight: 500 },
    default: { fontSize: 13, lineHeight: '20px', fontWeight: 500 },
    l: { fontSize: 15, lineHeight: '20px', fontWeight: 500 },
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const;

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  md: '0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)',
  lg: '0 4px 6px rgba(0, 0, 0, 0.3), 0 10px 15px rgba(0, 0, 0, 0.2)',
  xl: '0 10px 10px rgba(0, 0, 0, 0.3), 0 20px 25px rgba(0, 0, 0, 0.2)',
  xxl: '0 25px 50px rgba(0, 0, 0, 0.3)',
} as const;

export const animations = {
  toastFadeIn: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  toastFadeOut: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  positionsPanelSlide: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  slTargetLineDraw: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  exitFade: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
} as const;
