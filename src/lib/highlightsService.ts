import { supabase } from './supabase';
import { HighlightItem } from '../types';

const LOCAL_STORAGE_PREFIX = 'youtuber_pro_highlights_';

/**
 * Fetch highlights for a specific lesson for the logged in user, with local fallback
 */
export async function fetchUserHighlights(lessonId: string): Promise<HighlightItem[]> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${lessonId}`;
  let localHighlights: HighlightItem[] = [];
  
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localHighlights = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local highlights:', e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return localHighlights;
    }

    const { data, error } = await supabase
      .from('user_highlights')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching highlights from Supabase:', error);
      return localHighlights;
    }

    if (data && data.length >= 0) {
      const remoteHighlights: HighlightItem[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        lesson_id: item.lesson_id,
        section_title: item.section_title || '',
        text_content: item.text_content,
        prefix: item.prefix || '',
        suffix: item.suffix || '',
        color: (item.color || 'yellow') as HighlightItem['color'],
        note: item.note || '',
        created_at: item.created_at
      }));

      // Cache locally
      try {
        localStorage.setItem(localKey, JSON.stringify(remoteHighlights));
      } catch (e) {
        // ignore storage errors
      }

      return remoteHighlights;
    }
  } catch (e) {
    console.warn('Exception fetching highlights:', e);
  }

  return localHighlights;
}

/**
 * Create a new highlight in Supabase and LocalStorage
 */
export async function saveUserHighlight(
  item: Omit<HighlightItem, 'id'> & { id?: string }
): Promise<HighlightItem | null> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${item.lesson_id}`;
  const generatedId = item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  
  const newItem: HighlightItem = {
    id: generatedId,
    lesson_id: item.lesson_id,
    section_title: item.section_title || '',
    text_content: item.text_content,
    prefix: item.prefix || '',
    suffix: item.suffix || '',
    color: item.color || 'yellow',
    note: item.note || '',
    created_at: item.created_at || new Date().toISOString()
  };

  // Update LocalStorage first for instant UI response
  try {
    const existingRaw = localStorage.getItem(localKey);
    const existing: HighlightItem[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...existing.filter(h => h.id !== generatedId), newItem];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error updating local highlights:', e);
  }

  // Persist to Supabase DB if user is authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      newItem.user_id = session.user.id;
      const { data, error } = await supabase
        .from('user_highlights')
        .upsert({
          id: generatedId.startsWith('hl_') ? undefined : generatedId,
          user_id: session.user.id,
          lesson_id: item.lesson_id,
          section_title: item.section_title || '',
          text_content: item.text_content,
          prefix: item.prefix || '',
          suffix: item.suffix || '',
          color: item.color || 'yellow',
          note: item.note || '',
        })
        .select()
        .single();

      if (!error && data) {
        newItem.id = data.id;
      }
    }
  } catch (e) {
    console.warn('Exception saving highlight to Supabase:', e);
  }

  return newItem;
}

/**
 * Delete a highlight by ID from Supabase and LocalStorage
 */
export async function deleteUserHighlight(highlightId: string, lessonId: string): Promise<boolean> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${lessonId}`;

  // Update LocalStorage immediately
  try {
    const existingRaw = localStorage.getItem(localKey);
    if (existingRaw) {
      const existing: HighlightItem[] = JSON.parse(existingRaw);
      const filtered = existing.filter(h => h.id !== highlightId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Error updating local highlights on delete:', e);
  }

  // Delete from Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id && !highlightId.startsWith('hl_')) {
      const { error } = await supabase
        .from('user_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', session.user.id);

      if (error) {
        console.warn('Error deleting highlight from Supabase:', error);
      }
    }
  } catch (e) {
    console.warn('Exception deleting highlight from Supabase:', e);
  }

  return true;
}

/**
 * Update note or color of an existing highlight
 */
export async function updateUserHighlight(
  highlightId: string, 
  lessonId: string, 
  updates: { note?: string; color?: HighlightItem['color'] }
): Promise<boolean> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${lessonId}`;

  try {
    const existingRaw = localStorage.getItem(localKey);
    if (existingRaw) {
      const existing: HighlightItem[] = JSON.parse(existingRaw);
      const updated = existing.map(h => {
        if (h.id === highlightId) {
          return { ...h, ...updates };
        }
        return h;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error updating local highlight note:', e);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id && !highlightId.startsWith('hl_')) {
      const { error } = await supabase
        .from('user_highlights')
        .update({
          ...(updates.note !== undefined && { note: updates.note }),
          ...(updates.color !== undefined && { color: updates.color })
        })
        .eq('id', highlightId)
        .eq('user_id', session.user.id);

      if (error) {
        console.warn('Error updating highlight in Supabase:', error);
      }
    }
  } catch (e) {
    console.warn('Exception updating highlight in Supabase:', e);
  }

  return true;
}
