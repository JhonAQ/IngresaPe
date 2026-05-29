import type { LucideIcon } from 'lucide-react';

export interface Course {
  id: string;
  title: string;
  progress: number;
}

export type CourseStatus = 'completed' | 'available' | 'locked';

export interface CourseData {
  id: string;
  name: string;
  area: string;
  progress: number;
  colorHex: string;
  bgTint: string;
  icon: LucideIcon;
  message: string;
  status: CourseStatus;
}
