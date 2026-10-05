import { supabase } from './supabase';
import { ModuleId } from '../types';

export interface UserReadingState {
  lastModuleId: ModuleId;
  lastLessonId: string;
  lastSubtabId?: string;
  lastTab?: 'teoria' | 'pratica' | 'desafio' | 'checklist';
  scrollTop?: number;
  updatedAt?: string;
}

const STORAGE_KEY = 'flmmkr_last_reading_state';
const LEGACY_STORAGE_KEY = 'youtuber_pro_last_reading_state';

/**
 * Lê o estado armazenado localmente de forma síncrona
 */
export function getLocalReadingState(): UserReadingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler estado de leitura local:', e);
  }
  return null;
}

/**
 * Busca a última posição do aluno (módulo, aula, subtab, tab, scroll)
 * tanto no LocalStorage quanto remotamente no Supabase/API.
 */
export async function fetchReadingState(explicitUserId?: string): Promise<UserReadingState | null> {
  const localState = getLocalReadingState();

  try {
    let userId = explicitUserId;
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }

    if (!userId) {
      return localState;
    }

    // 1. Tentar buscar via endpoint robusto
    try {
      const res = await fetch(`/api/user/reading-state?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const body = await res.json();
        if (body?.state) {
          const remoteState: UserReadingState = {
            lastModuleId: (body.state.last_module_id || 'mod1') as ModuleId,
            lastLessonId: body.state.last_lesson_id || 'mod1-1',
            lastSubtabId: body.state.last_subtab_id || undefined,
            lastTab: (body.state.last_tab || 'teoria') as UserReadingState['lastTab'],
            scrollTop: Number(body.state.scroll_top || 0),
            updatedAt: body.state.updated_at
          };

          // Salvar no storage local
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
          } catch (_) {}

          return remoteState;
        }
      }
    } catch (_) {}

    // 2. Fallback direto ao Supabase Client
    const { data, error } = await supabase
      .from('user_reading_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const remoteState: UserReadingState = {
        lastModuleId: (data.last_module_id || 'mod1') as ModuleId,
        lastLessonId: data.last_lesson_id || 'mod1-1',
        lastSubtabId: data.last_subtab_id || undefined,
        lastTab: (data.last_tab || 'teoria') as UserReadingState['lastTab'],
        scrollTop: Number(data.scroll_top || 0),
        updatedAt: data.updated_at
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      } catch (_) {}

      return remoteState;
    }
  } catch (e) {
    console.warn('Exceção ao buscar reading state:', e);
  }

  return localState;
}

/**
 * Salva a posição atual do aluno imediatamente no LocalStorage e no Supabase/API.
 */
export async function saveReadingState(state: UserReadingState, explicitUserId?: string): Promise<void> {
  const stateToSave: UserReadingState = {
    ...state,
    updatedAt: new Date().toISOString()
  };

  // 1. Salva instantaneamente no LocalStorage (0 latência)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Erro ao salvar local reading state:', e);
    }
  }

  // 2. Persiste remotamente na nuvem se autenticado
  try {
    let userId = explicitUserId;
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }

    if (userId) {
      // API call (usando supabaseAdmin internamente, contornando qualquer problema de token)
      fetch('/api/user/reading-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lastModuleId: stateToSave.lastModuleId,
          lastLessonId: stateToSave.lastLessonId,
          lastSubtabId: stateToSave.lastSubtabId || null,
          lastTab: stateToSave.lastTab || 'teoria',
          scrollTop: stateToSave.scrollTop || 0
        })
      }).catch((err) => console.warn('Erro fetch reading-state:', err));
    }
  } catch (e) {
    console.warn('Exceção ao salvar reading state:', e);
  }
}
