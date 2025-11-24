export interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface PlanItem {
  id: number;
  text: string;
}

export interface DailyData {
  date: string; // ISO format YYYY-MM-DD
  topTodo: string;
  plans: PlanItem[];
  checklist: CheckItem[];
  memo: string;
  summary: string;
}

export const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const INITIAL_PLAN_ROWS = 10;