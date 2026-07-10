export type PathNodeTheme =
  | 'blue'
  | 'gold'
  | 'green'
  | 'purple'
  | 'trip-green';

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
};

export const GREY = {
  4: '#b7b7b7',
  6: '#e5e5e5',
};

export const GOLD_STAR = '#aa572a';
