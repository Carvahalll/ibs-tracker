import { LucideIcon } from 'lucide-react';

export interface LogEntryBase {
  id: string;
  timestamp: number; // Unix timestamp (ms)
  type: 'symptom' | 'intake' | 'stress';
}

// Bristol Stool Chart Types
export type BristolStoolType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5' | 'type6' | 'type7';

export interface SymptomLog extends LogEntryBase {
  type: 'symptom';
  bowelMovement?: BristolStoolType;
  crampsSeverity?: number; // 0-5
  bloatingSeverity?: number; // 0-5
  urgency?: boolean;
  notes?: string;
}

export interface IntakeLog extends LogEntryBase {
  type: 'intake';
  item: string;
  quantity?: string;
  notes?: string;
}

export interface StressLog extends LogEntryBase {
  type: 'stress';
  level: number; // 0-5
  notes?: string;
}

export type LogEntry = SymptomLog | IntakeLog | StressLog;

export interface NavItem {
  id: 'log' | 'addSymptom' | 'addIntake' | 'addStress' | 'chart'; // Added 'chart'
  label: string;
  icon: LucideIcon;
}

// Type for processed chart data
export interface ChartDataPoint {
    date: string; // YYYY-MM-DD
    cramps: number | null;
    bloating: number | null;
    stress: number | null;
}
