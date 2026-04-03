import { isMockEnabled } from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCKS = isMockEnabled();

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  console.log(`[API] ${options?.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Projects API
export const projectsApi = {
  list: () => fetchAPI<{ items: Project[]; total: number }>('/projects'),

  get: (id: string) => fetchAPI<Project>(`/projects/${id}`),

  create: (data: { name: string; description?: string; genre?: string; target_words?: number }) =>
    fetchAPI<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>) =>
    fetchAPI<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  stats: (id: string) => fetchAPI<ProjectStats>(`/projects/${id}/stats`),
};

// Characters API
export const charactersApi = {
  list: (projectId: string) =>
    fetchAPI<{ items: Character[]; total: number }>(`/projects/${projectId}/characters`),

  get: (projectId: string, name: string) =>
    fetchAPI<Character>(`/projects/${projectId}/characters/${encodeURIComponent(name)}`),

  create: (projectId: string, data: Partial<Character>) =>
    fetchAPI<Character>(`/projects/${projectId}/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (projectId: string, name: string, data: Partial<Character>) =>
    fetchAPI<Character>(`/projects/${projectId}/characters/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, name: string) =>
    fetchAPI<void>(`/projects/${projectId}/characters/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),
};

// Chapters API
export const chaptersApi = {
  list: (projectId: string) =>
    fetchAPI<{ items: Chapter[]; total: number; total_words: number }>(`/projects/${projectId}/chapters`),

  get: (projectId: string, chapterNum: number) =>
    fetchAPI<Chapter>(`/projects/${projectId}/chapters/${chapterNum}`),

  create: (projectId: string, data: Partial<Chapter>) =>
    fetchAPI<Chapter>(`/projects/${projectId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (projectId: string, chapterNum: number, data: Partial<Chapter>) =>
    fetchAPI<Chapter>(`/projects/${projectId}/chapters/${chapterNum}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, chapterNum: number) =>
    fetchAPI<void>(`/projects/${projectId}/chapters/${chapterNum}`, {
      method: 'DELETE',
    }),
};

// Chat API
export const chatApi = {
  send: (projectId: string, message: string, sessionId?: string, contextFocus?: string) =>
    fetchAPI<ChatResponse>(`/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        context_focus: contextFocus,
      }),
    }),

  listSessions: (projectId: string) =>
    fetchAPI<{ session_id: string; saved_at: string; message_count: number }[]>(
      `/projects/${projectId}/sessions`
    ),

  getSession: (projectId: string, sessionId: string) =>
    fetchAPI<{ session_id: string; project_id: string; messages: ChatMessage[]; saved_at: string }>(
      `/projects/${projectId}/sessions/${sessionId}`
    ),
};

// Context API
export const contextApi = {
  getProject: (projectId: string) =>
    fetchAPI<{
      project: Project | null;
      characters: Character[];
      chapters: {
        chapter: number;
        title: string;
        word_count: number;
        characters: string[];
        location: string | null;
        summary: string;
      }[];
      state: ProjectState;
      style: unknown;
      total_words: number;
    }>(`/projects/${projectId}/context`),

  getCharacter: (projectId: string, name: string) =>
    fetchAPI<{
      character: Character;
      current_state: CharacterState | null;
      relationships: CharacterRelation[];
    }>(`/projects/${projectId}/characters/${encodeURIComponent(name)}/context`),
};

// Inference API
export const inferenceApi = {
  characterBehavior: (projectId: string, characterName: string, scenario: string) =>
    fetchAPI<{
      character_name: string;
      scenario: string;
      inference_result: string;
      factors_used: {
        personality_weight: number;
        state_weight: number;
        motivation_weight: number;
        pressure_weight: number;
      };
      timestamp: string;
    }>(`/projects/${projectId}/inference/character`, {
      method: 'POST',
      body: JSON.stringify({
        character_name: characterName,
        scenario,
      }),
    }),
};

// Style API
export const styleApi = {
  continue: (projectId: string, contextContent: string, targetLength: number = 500, direction?: string) =>
    fetchAPI<{
      continued_content: string;
      target_length: number;
      style_matched: boolean;
      timestamp: string;
    }>(`/projects/${projectId}/style/continue`, {
      method: 'POST',
      body: JSON.stringify({
        context_content: contextContent,
        target_length: targetLength,
        direction,
      }),
    }),
};

// Consistency API
export const consistencyApi = {
  check: (projectId: string, content: string, checkType: 'character' | 'world' | 'narrative' | 'all' = 'all') =>
    fetchAPI<{
      content_checked: string;
      check_type: string;
      result: string;
      timestamp: string;
    }>(`/projects/${projectId}/consistency/check`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        check_type: checkType,
      }),
    }),
};

// Knowledge Graph API
export const kgApi = {
  query: (projectId: string, question: string, mode: 'hybrid' | 'local' | 'global' | 'naive' = 'hybrid') =>
    fetchAPI<{
      status: string;
      question: string;
      answer: string | null;
      mode: string;
    }>(`/projects/${projectId}/kg/query`, {
      method: 'POST',
      body: JSON.stringify({ question, mode }),
    }),

  visualize: (projectId: string) =>
    fetchAPI<{
      nodes: { id: string; label: string; type?: string }[];
      edges: { source: string; target: string; label?: string }[];
      status: string;
      node_count: number;
      edge_count: number;
    }>(`/projects/${projectId}/kg/visualize`),
};

// Simulation API (Oasis Social Simulation)
export const simulationApi = {
  createAndRun: (projectId: string, data: SimulationCreateRequest) =>
    fetchAPI<SimulationResult>(`/projects/${projectId}/simulation`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  create: (projectId: string, data: SimulationCreateRequest) =>
    fetchAPI<Simulation>(`/projects/${projectId}/simulation/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  run: (projectId: string, simulationId: string) =>
    fetchAPI<SimulationResult>(`/projects/${projectId}/simulation/${simulationId}/run`, {
      method: 'POST',
    }),

  getResult: (projectId: string, simulationId: string) =>
    fetchAPI<SimulationResult>(`/projects/${projectId}/simulation/${simulationId}`),

  list: (projectId: string) =>
    fetchAPI<{ items: Simulation[]; total: number }>(`/projects/${projectId}/simulations`),

  delete: (projectId: string, simulationId: string) =>
    fetchAPI<{ message: string; simulation_id: string }>(
      `/projects/${projectId}/simulation/${simulationId}`,
      { method: 'DELETE' }
    ),

  predict: (projectId: string, data: StoryPredictionRequest) =>
    fetchAPI<StoryPrediction>(`/projects/${projectId}/predict`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPlatforms: () =>
    fetchAPI<string[]>('/platforms'),
};

// Style & Import API
export const styleImportApi = {
  analyzeStyle: (projectId: string, content: string) =>
    fetchAPI<StyleFingerprintResponse>(`/projects/${projectId}/style/analyze`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getFingerprint: (projectId: string) =>
    fetchAPI<StyleFingerprintResponse>(`/projects/${projectId}/style/fingerprint`),

  compareStyles: (content1: string, content2: string) =>
    fetchAPI<{ similarity_score: number; analysis: Record<string, number> }>('/style/compare', {
      method: 'POST',
      body: JSON.stringify({ content1, content2 }),
    }),

  uploadContent: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/projects/${projectId}/import/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json() as Promise<ImportStatus>;
  },

  getImportStatus: (taskId: string) =>
    fetchAPI<ImportStatus>(`/import/status/${taskId}`),

  getImportHistory: (projectId: string) =>
    fetchAPI<ImportResult[]>(`/projects/${projectId}/import/history`),
};

// Import types
import type {
  Project,
  Character,
  Chapter,
  ProjectStats,
  ChatMessage,
  ChatResponse,
  CharacterState,
  CharacterRelation,
  ProjectState,
  SimulationCreateRequest,
  Simulation,
  SimulationResult,
  StoryPredictionRequest,
  StoryPrediction,
  StyleFingerprintResponse,
  ImportStatus,
  ImportResult,
} from '@/types';