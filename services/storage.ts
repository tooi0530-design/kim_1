import { DailyData, INITIAL_PLAN_ROWS } from '../types';

const STORAGE_KEY_PREFIX = 'daily_planner_';

export const getDailyData = (date: string): DailyData => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${date}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure structure integrity for older saves
      return {
        date,
        topTodo: parsed.topTodo || '',
        plans: parsed.plans || Array.from({ length: INITIAL_PLAN_ROWS }, (_, i) => ({ id: i + 1, text: '' })),
        checklist: parsed.checklist || [],
        memo: parsed.memo || '',
        summary: parsed.summary || '',
      };
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }

  // Default empty state
  return {
    date,
    topTodo: '',
    plans: Array.from({ length: INITIAL_PLAN_ROWS }, (_, i) => ({ id: i + 1, text: '' })),
    checklist: [],
    memo: '',
    summary: '',
  };
};

export const saveDailyData = (data: DailyData): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${data.date}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};