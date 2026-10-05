export type ModuleId = 'mod0' | 'mod1' | 'mod2' | 'mod3' | 'mod4' | 'mod5' | 'mod6' | 'mod7' | 'mod8';

export interface LessonSubtab {
  id: string;
  label: string;
  concept: string;
  steps?: string[];
  tips?: string[];
  videoUrl?: string;
}

export interface Subtopic {
  id: string;
  title: string;
  concept: string;
  steps: string[];
  tips?: string[];
  isFree?: boolean;
  videoUrl?: string;
  subtabs?: LessonSubtab[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  fields: {
    label: string;
    fieldId?: string;
    key?: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: string;
}

export interface CourseModule {
  id: ModuleId;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  subtopics: Subtopic[];
  challenges: Challenge[];
  checklistItems: ChecklistItem[];
  isFree?: boolean;
}

export interface HighlightItem {
  id: string;
  user_id?: string;
  lesson_id: string;
  section_title?: string;
  text_content: string;
  prefix?: string;
  suffix?: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
  note?: string;
  created_at?: string;
}

export interface UserProgress {
  completedModules: string[];
  completedLessons: string[];
  checklistStates: Record<string, boolean>;
  challengeDrafts: Record<string, Record<string, string>>;
  notes: Record<string, string>;
  scriptEditorAudio: string;
  scriptEditorVideo: string;
  activeTab: Record<string, 'teoria' | 'pratica' | 'desafio' | 'checklist'>;
}
