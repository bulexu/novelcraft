// API Types
export interface Project {
  id: string;
  name: string;
  description: string;
  genre: string;
  target_style: string;
  target_words: number;
  status: 'draft' | 'ongoing' | 'completed';
  created_at: string | null;
  updated_at: string | null;
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  gender: string | null;
  age: number | null;
  status: string;
  arc_type: string | null;
  appearance: string;
  background: string;
  personality_palette: PersonalityPalette;
  behavior_boundary: BehaviorBoundary;
  relationships: CharacterRelation[];
  created_at: string | null;
  updated_at: string | null;
}

export interface PersonalityPalette {
  main_tone: string;
  base_color: string;
  accent: string;
  derivatives: { description: string }[];
  language_fingerprint: string[];
}

export interface BehaviorBoundary {
  forbidden_actions: string[];
  exceptions: { condition: string; action: string }[];
  reason: string;
}

export interface CharacterRelation {
  target_name: string;
  relation_type: string;
  temperature: string;
  evolution: string[];
}

export interface Chapter {
  chapter: number;
  title: string;
  word_count: number;
  characters: string[];
  location: string | null;
  foreshadowing: ForeshadowingItem[];
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ForeshadowingItem {
  id: string;
  content: string;
  status: 'pending' | 'reminded' | 'resolved';
}

export interface ProjectState {
  current_chapter: number;
  current_arc: string;
  timeline_position: string;
  character_states: CharacterState[];
  emotional_debts: EmotionalDebt[];
  foreshadowing_tracks: ForeshadowingTrack[];
  last_sync: string | null;
}

export interface CharacterState {
  name: string;
  current_goal: string;
  current_fear: string;
  hiding: string;
  relationship_temperature: Record<string, string>;
  body_state: string;
  mental_state: string;
}

export interface EmotionalDebt {
  debtor: string;
  creditor: string;
  debt_type: string;
  how_incurred: string;
  why_unpaid: string;
  suitable_scenes: string[];
  urgency: '低' | '中' | '高';
}

export interface ForeshadowingTrack {
  id: string;
  content: string;
  first_appear: string;
  promise: string;
  reminder_nodes: string[];
  expected_resolution: string;
  status: 'pending' | 'reminded' | 'resolved';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  context_used: {
    project_id: string;
    focus: string | null;
  };
  timestamp: string;
}

export interface ProjectStats {
  project_id: string;
  project_name: string;
  total_chapters: number;
  total_words: number;
  total_characters: number;
  status: string;
  genre: string;
}

// Simulation Types (Oasis Social Simulation)
export interface SimulationCreateRequest {
  scenario: string;
  character_names?: string[];
  num_rounds: number;
  platform: 'twitter' | 'reddit' | 'narrative';
}

export interface Simulation {
  simulation_id: string;
  status: 'created' | 'preparing' | 'running' | 'paused' | 'completed' | 'failed';
  project_id: string;
  platform: string;
  num_rounds: number;
  agent_count: number;
  seed_scenario: string;
  created_at: string;
}

export interface SimulationResult {
  simulation_id: string;
  status: string;
  rounds_completed: number;
  interactions: SimulationInteraction[];
  story_predictions: string[];
  relationship_changes: RelationshipChange[];
  error?: string;
}

export interface SimulationInteraction {
  type: 'post' | 'comment' | 'like' | 'follow';
  user_id?: string;
  content?: string;
  target_id?: string;
}

export interface RelationshipChange {
  source: string;
  target: string;
  change_type: string;
  description: string;
}

export interface StoryPredictionRequest {
  chapter: number;
  prediction_type: string;
}

export interface StoryPrediction {
  chapter: number;
  characters_involved: string[];
  predictions: string[];
  interactions_count: number;
}

// Style & Import Types
export interface StyleFingerprintResponse {
  project_id: string;
  analyzed_at: string;
  confidence: number;
  sentence_patterns: {
    average_length: number;
    short_ratio: number;
    long_ratio: number;
    punctuation: Record<string, number>;
  };
  vocabulary_profile: {
    frequent_words: string[];
    avoided_words: string[];
    colloquial_level: number;
    dialect_words: string[];
  };
  description_style: {
    scene_density: number;
    psychology_method: string;
    dialogue_style: string;
  };
  narrative_rhythm: {
    chapter_average_length: number;
    pacing_speed: string;
    climax_cycle: number;
  };
}

export interface ImportStatus {
  task_id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  chapters_imported: number;
  total_words: number;
}

export interface ImportResult {
  task_id: string;
  project_id: string;
  file_name: string;
  total_chapters: number;
  total_words: number;
  characters_detected: string[];
  status: string;
}