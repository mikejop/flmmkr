import { supabase } from './supabase';
import { ModuleId } from '../types';

export interface UserReadingState {
  lastModuleId: ModuleId;
  lastLessonId: string;
  lastTab: 'teoria' | 'pratica' | 'desafio' | 'checklist';
  scrollTop: number;
  updatedAt?: string;
}

const STORAGE_KEY = 'youtuber_pro_last_reading_state';

/**
 * Fetch last reading location (module, lesson, tab, scroll position)
 */
export async function fetchReadingState(): Promise<UserReadingState | null> {
  let localState: UserReadingState | null = null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      localState = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local reading state:', e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return localState;
    }

    const { data, error } = await supabase
      .from('user_reading_state')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching reading state from Supabase:', error);
      return localState;
    }

    if (data) {
      const remoteState: UserReadingState = {
        lastModuleId: (data.last_module_id || 'mod0') as ModuleId,
        lastLessonId: data.last_lesson_id || '',
        lastTab: (data.last_tab || 'teoria') as UserReadingState['lastTab'],
        scrollTop: Number(data.scroll_top || 0),
        updatedAt: data.updated_at
      };

      // Save locally
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      } catch (e) {
        // ignore
      }

      return remoteState;
    }
  } catch (e) {
    console.warn('Exception fetching reading state from Supabase:', e);
  }

  return localState;
}

/**
 * Save current reading state to LocalStorage and Supabase DB
 */
export async function saveReadingState(state: UserReadingState): Promise<void> {
  const stateToSave: UserReadingState = {
    ...state,
    updatedAt: new Date().toISOString()
  };

  // Instant LocalStorage save
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.warn('Error saving local reading state:', e);
  }

  // Persist to Supabase if logged in
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { error } = await supabase
        .from('user_reading_state')
        .upsert({
          user_id: session.user.id,
          last_module_id: stateToSave.lastModuleId,
          last_lesson_id: stateToSave.lastLessonId,
          last_tab: stateToSave.lastTab,
          scroll_top: Math.round(stateToSave.scrollTop),
          updated_at: stateToSave.updatedAt
        });

      if (error) {
        console.warn('Error saving reading state to Supabase:', error);
      }
    }
  } catch (e) {
    console.warn('Exception saving reading state to Supabase:', e);
  }
}
