export type PathNodeTheme =
  | 'blue'
  | 'gold'
  | 'green'
  | 'purple'
  | 'trip-green'
  | 'coral'
  | 'orange'
  | 'pink'
  | 'indigo'
  | 'lime'
  | 'cyan'
  | 'rose';

export interface ThemeColors {
  medium: string;
  base: string;
  light: string;
  ice: string;
  darkShine: string;
}

export const PATH_NODE_THEMES: Record<PathNodeTheme, ThemeColors> = {
  blue: {
    medium: '#1899d6',
    base: '#1cb0f6',
    light: '#63c9f9',
    ice: '#ddf4ff',
    darkShine: '#63c9f9',
  },
  gold: {
    medium: '#cd7900',
    base: '#ffc800',
    light: '#fbe56d',
    ice: '#fbe56d',
    darkShine: '#fbe56d',
  },
  green: {
    medium: '#58a700',
    base: '#58cc02',
    light: '#79d634',
    ice: '#ecffde',
    darkShine: '#79d634',
  },
  purple: {
    medium: '#a568cc',
    base: '#ce82ff',
    light: '#daa0ff',
    ice: '#dbc3eb',
    darkShine: '#b786d6',
  },
  'trip-green': {
    medium: '#007055',
    base: '#00b68a',
    light: '#35dbb4',
    ice: '#d0fff4',
    darkShine: '#35dbb4',
  },
  coral: {
    medium: '#d93838',
    base: '#ff4b4b',
    light: '#ff7a7a',
    ice: '#ffe0e0',
    darkShine: '#ff7a7a',
  },
  orange: {
    medium: '#cd7900',
    base: '#ff9600',
    light: '#ffb64d',
    ice: '#fff0d9',
    darkShine: '#ffb64d',
  },
  pink: {
    medium: '#cc4d9a',
    base: '#ff7eb9',
    light: '#ffaed4',
    ice: '#ffe6f2',
    darkShine: '#ffaed4',
  },
  indigo: {
    medium: '#4a5fcb',
    base: '#5b7cfa',
    light: '#8aa3ff',
    ice: '#e4eaff',
    darkShine: '#8aa3ff',
  },
  lime: {
    medium: '#6ca300',
    base: '#84cc16',
    light: '#a3e635',
    ice: '#f1ffe0',
    darkShine: '#a3e635',
  },
  cyan: {
    medium: '#0891b2',
    base: '#22d3ee',
    light: '#67e8f9',
    ice: '#e0fcff',
    darkShine: '#67e8f9',
  },
  rose: {
    medium: '#c7244d',
    base: '#fb7185',
    light: '#fda4af',
    ice: '#ffe4e8',
    darkShine: '#fda4af',
  },
};

export const GREY = {
  4: '#b7b7b7',
  6: '#e5e5e5',
};

export const GOLD_STAR = '#aa572a';
