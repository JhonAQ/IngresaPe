export interface RankMeta {
  id: string;
  name: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  border: string;
  gradient: string;
}

const RANKS: RankMeta[] = [
  {
    id: 'huevito',
    name: 'Huevito',
    min: 0,
    max: 19.99,
    color: '#94a3b8',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    gradient: 'from-slate-100 to-slate-50',
  },
  {
    id: 'pollito',
    name: 'Pollito',
    min: 20,
    max: 39.99,
    color: '#58cc02',
    bg: '#d7ffb8',
    border: '#b5e589',
    gradient: 'from-[#e5ffc9] to-[#d7ffb8]',
  },
  {
    id: 'dinosaurio',
    name: 'Dinosaurio',
    min: 40,
    max: 59.99,
    color: '#1cb0f6',
    bg: '#ddf4ff',
    border: '#84d8ff',
    gradient: 'from-[#ebf8ff] to-[#ddf4ff]',
  },
  {
    id: 'fosil',
    name: 'Fósil',
    min: 60,
    max: 79.99,
    color: '#ff9600',
    bg: '#fff2e0',
    border: '#ffc800',
    gradient: 'from-[#fff8f0] to-[#fff2e0]',
  },
  {
    id: 'cachimbo',
    name: 'Cachimbo',
    min: 80,
    max: 100,
    color: '#ff4b4b',
    bg: '#ffdfe0',
    border: '#ffc2c4',
    gradient: 'from-[#fff0f1] to-[#ffdfe0]',
  },
];

export function getRankInfo(score: number): RankMeta {
  return RANKS.find((r) => score >= r.min && score <= r.max) || RANKS[0];
}

export function getRankInfoByDivision(division?: string | null): RankMeta {
  if (!division) return RANKS[0];
  return (
    RANKS.find(
      (r) =>
        r.id === division.toLowerCase() ||
        r.name.toLowerCase() === division.toLowerCase()
    ) || RANKS[0]
  );
}

export { RANKS };
