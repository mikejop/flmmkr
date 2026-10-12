import { supabase } from './supabase';
import { ModuleId } from '../types';
import { readCache, writeCache } from './clientCache';

export interface UserReadingState {
  lastModuleId: ModuleId;
  lastLessonId: string;
  lastSubtabId?: string;
  lastTab?: 'teoria' | 'pratica' | 'desafio' | 'checklist';
  scrollTop?: number;
  updatedAt?: string;
}

const STORAGE_KEY = 'color_master_last_reading_state';
const COURSE_ID = 'color-master-produto';
// Consulta a nuvem no máximo 1x por hora por aparelho (login novo sempre limpa isso).
const REMOTE_SYNC_FRESH_MS = 60 * 60 * 1000;

/**
 * Lê o estado armazenado localmente de forma síncrona
 */
export function getLocalReadingState(): UserReadingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

    // Já buscou há pouco? Confia no estado local (quem navega grava nele a cada passo).
    const lastSync = readCache<number>(`reading-state-sync:${userId}`);
    if (localState && lastSync && lastSync.ageMs < REMOTE_SYNC_FRESH_MS) {
      return localState;
    }

    // 1. Tentar buscar via endpoint robusto
    try {
      const res = await fetch('/api/user/reading-state');
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
          writeCache(`reading-state-sync:${userId}`, Date.now());

          return remoteState;
        }
      }
    } catch (_) {}

    // 2. Fallback direto ao Supabase Client
    const { data, error } = await supabase
      .from('user_reading_state')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', COURSE_ID)
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

  // 2. Persiste remotamente na nuvem (agrupado): navegar rápido gera 1 gravação, não várias.
  try {
    let userId = explicitUserId;
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }
    if (userId) scheduleRemoteSave(stateToSave);
  } catch (e) {
    console.warn('Exceção ao salvar reading state:', e);
  }
}

const REMOTE_SAVE_DEBOUNCE_MS = 5000;
let pendingRemoteState: UserReadingState | null = null;
let lastSentSignature = '';
let remoteSaveTimer: ReturnType<typeof setTimeout> | null = null;

function signatureOf(state: UserReadingState): string {
  return [state.lastModuleId, state.lastLessonId, state.lastSubtabId || '', state.lastTab || 'teoria'].join('|');
}

function scheduleRemoteSave(state: UserReadingState): void {
  pendingRemoteState = state;
  if (remoteSaveTimer) clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(flushRemoteSave, REMOTE_SAVE_DEBOUNCE_MS);
  if (typeof window !== 'undefined' && !flushHooksInstalled) {
    flushHooksInstalled = true;
    window.addEventListener('pagehide', flushRemoteSave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushRemoteSave();
    });
  }
}

let flushHooksInstalled = false;

function flushRemoteSave(): void {
  if (remoteSaveTimer) {
    clearTimeout(remoteSaveTimer);
    remoteSaveTimer = null;
  }
  const state = pendingRemoteState;
  pendingRemoteState = null;
  if (!state) return;
  const signature = signatureOf(state);
  if (signature === lastSentSignature) return; // nada mudou desde o último envio

  lastSentSignature = signature;
  fetch('/api/user/reading-state', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId: COURSE_ID,
      lastModuleId: state.lastModuleId,
      lastLessonId: state.lastLessonId,
      lastSubtabId: state.lastSubtabId || null,
      lastTab: state.lastTab || 'teoria',
      scrollTop: state.scrollTop || 0
    })
  }).then((res) => {
    if (!res.ok) lastSentSignature = '';
  }).catch((err) => {
    lastSentSignature = '';
    console.warn('Erro fetch reading-state:', err);
  });
}
