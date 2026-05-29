export type MinigameId = 'survival' | 'speed' | 'streak';

export interface MinigameData {
  id: MinigameId;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  shadow: string;
  cost: number;
}
