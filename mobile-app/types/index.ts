// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  level: number;
  total_climbs: number;
  created_at: string;
  updated_at: string;
}

// Climbing record types
export type ClimbingType = 'boulder' | 'lead' | 'top-rope';
export type ClimbingGrade = 'VB' | 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8' | 'V9' | 'V10' | '5.10a' | '5.10b' | '5.10c' | '5.10d' | '5.11a' | '5.11b' | '5.11c' | '5.11d' | '5.12a' | '5.12b' | '5.12c' | '5.12d' | '5.13a' | '5.13b' | '5.13c' | '5.13d' | '5.14a' | '5.14b' | '5.14c' | '5.14d' | '5.15a' | '5.15b' | '5.15c' | '5.15d';

export interface ClimbingRecord {
  id: string;
  user_id: string;
  route_name: string;
  gym: string;
  type: ClimbingType;
  grade: ClimbingGrade;
  attempts?: number;
  first_try: boolean;
  notes?: string;
  created_at: string;
}

// Progress types
export interface ProgressStats {
  total_climbs: number;
  by_type: Record<string, number>;
  by_grade: Record<string, number>;
  first_try_rate: number;
  avg_attempts: number;
}

export interface HistoryItem {
  date: string;
  count: number;
}

// Payment types
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentType = 'gym_ticket' | 'membership' | 'coaching';

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  currency: string;
  type: PaymentType;
  description?: string;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  paid_at?: string;
}

// Auth types
export interface LoginResponse {
  access_token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
