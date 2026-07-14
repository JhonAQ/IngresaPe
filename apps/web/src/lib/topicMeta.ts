import type { PathNodeTheme } from '@ingresa-pe/ui';

export interface TopicTheme {
  /** Tema de PathNode usado en los nodos del mapa. */
  nodeTheme: PathNodeTheme;
  /** Color base del tema (hex). */
  base: string;
  /** Color medio/oscuro para sombras y bordes. */
  medium: string;
  /** Color claro para fondos tintados. */
  ice: string;
}

const TOPIC_THEMES: TopicTheme[] = [
  { nodeTheme: 'blue', base: '#1cb0f6', medium: '#1899d6', ice: '#ddf4ff' },
  { nodeTheme: 'green', base: '#58cc02', medium: '#58a700', ice: '#ecffde' },
  { nodeTheme: 'purple', base: '#ce82ff', medium: '#a568cc', ice: '#f8eaff' },
  { nodeTheme: 'gold', base: '#ffc800', medium: '#cd7900', ice: '#fffbea' },
  { nodeTheme: 'trip-green', base: '#00b68a', medium: '#007055', ice: '#d0fff4' },
  { nodeTheme: 'coral', base: '#ff4b4b', medium: '#d93838', ice: '#ffe0e0' },
  { nodeTheme: 'orange', base: '#ff9600', medium: '#cd7900', ice: '#fff0d9' },
  { nodeTheme: 'pink', base: '#ff7eb9', medium: '#cc4d9a', ice: '#ffe6f2' },
  { nodeTheme: 'indigo', base: '#5b7cfa', medium: '#4a5fcb', ice: '#e4eaff' },
  { nodeTheme: 'lime', base: '#84cc16', medium: '#6ca300', ice: '#f1ffe0' },
  { nodeTheme: 'cyan', base: '#22d3ee', medium: '#0891b2', ice: '#e0fcff' },
  { nodeTheme: 'rose', base: '#fb7185', medium: '#c7244d', ice: '#ffe4e8' },
];

export function getTopicTheme(topicIndex: number): TopicTheme {
  return TOPIC_THEMES[topicIndex % TOPIC_THEMES.length];
}
