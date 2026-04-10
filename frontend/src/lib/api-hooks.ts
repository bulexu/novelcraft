/**
 * NovelCraft API Hooks
 *
 * React hooks for API calls with loading states and error handling.
 * Supports both real API and mock data for development.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  projectsApi,
  charactersApi,
  chaptersApi,
  chatApi,
  contextApi,
  inferenceApi,
  styleApi,
  consistencyApi,
  kgApi,
  simulationApi,
  styleImportApi,
} from './api';
import type {
  Project,
  ProjectStats,
  Character,
  Chapter,
  ChatMessage,
  ChatResponse,
  Simulation,
  SimulationResult,
  StyleFingerprintResponse,
  InferenceResponse,
} from '@/types';

// Generic hook for async operations
function useAsync<T, P extends any[]>(
  asyncFn: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: P) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, execute, setData };
}

// Projects Hooks
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.list();
      setProjects(result.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载项目失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async (data: Parameters<typeof projectsApi.create>[0]) => {
    const project = await projectsApi.create(data);
    setProjects(prev => [...prev, project]);
    return project;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return { projects, loading, error, createProject, deleteProject, refresh: loadProjects };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    Promise.all([
      projectsApi.get(projectId),
      projectsApi.stats(projectId),
    ])
      .then(([projectRes, statsRes]) => {
        setProject(projectRes);
        setStats(statsRes);
      })
      .catch(err => setError(err instanceof Error ? err : new Error('加载失败')))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { project, stats, loading, error };
}

// Characters Hooks
export function useCharacters(projectId: string) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    charactersApi.list(projectId)
      .then(result => setCharacters(result.items))
      .catch(() => setCharacters([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const createCharacter = useCallback(async (data: Parameters<typeof charactersApi.create>[1]) => {
    const character = await charactersApi.create(projectId, data);
    setCharacters(prev => [...prev, character]);
    return character;
  }, [projectId]);

  return { characters, loading, createCharacter };
}

// Chapters Hooks
export function useChapters(projectId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    chaptersApi.list(projectId)
      .then(result => {
        setChapters(result.items);
        setTotalWords(result.total_words);
      })
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const createChapter = useCallback(async (data: Parameters<typeof chaptersApi.create>[1]) => {
    const chapter = await chaptersApi.create(projectId, data);
    setChapters(prev => [...prev, chapter]);
    return chapter;
  }, [projectId]);

  const updateChapter = useCallback(async (chapterNum: number, data: Partial<Chapter>) => {
    const chapter = await chaptersApi.update(projectId, chapterNum, data);
    setChapters(prev => prev.map(c => c.chapter === chapterNum ? chapter : c));
    return chapter;
  }, [projectId]);

  return { chapters, totalWords, loading, createChapter, updateChapter };
}

export function useChapter(projectId: string, chapterNum: number) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId || !chapterNum) return;

    setLoading(true);
    chaptersApi.get(projectId, chapterNum)
      .then(setChapter)
      .catch(() => setChapter(null))
      .finally(() => setLoading(false));
  }, [projectId, chapterNum]);

  const saveChapter = useCallback(async (data: Partial<Chapter>) => {
    setSaving(true);
    try {
      const updated = await chaptersApi.update(projectId, chapterNum, data);
      setChapter(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, [projectId, chapterNum]);

  return { chapter, loading, saving, saveChapter, setChapter };
}

// AI Chat Hook
export function useAIChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    setLoading(true);
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response: ChatResponse = await chatApi.send(projectId, content, sessionId || undefined);
      setSessionId(response.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      return response;
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，出现错误：' + (err instanceof Error ? err.message : '未知错误'),
      }]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, loading, sendMessage, clearMessages };
}

// AI Inference Hook
export function useInference(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InferenceResponse | null>(null);

  const inferBehavior = useCallback(async (
    characterName: string,
    scenario: string,
    currentState?: string,
    externalPressure?: string
  ) => {
    setLoading(true);
    try {
      const response = await inferenceApi.inferBehavior(projectId, {
        character_name: characterName,
        scenario,
        current_state: currentState,
        external_pressure: externalPressure,
      });
      setResult(response);
      return response;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { result, loading, inferBehavior };
}

// Style Continue Hook
export function useStyleContinue(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [continuedContent, setContinuedContent] = useState<string | null>(null);

  const continueWriting = useCallback(async (context: string, targetLength = 500) => {
    setLoading(true);
    try {
      const response = await styleApi.continue(projectId, context, targetLength);
      setContinuedContent(response.continued_content);
      return response.continued_content;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { continuedContent, loading, continueWriting };
}

// Consistency Check Hook
export function useConsistencyCheck(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const check = useCallback(async (content: string, checkType: 'character' | 'world' | 'narrative' | 'all' = 'all') => {
    setLoading(true);
    try {
      const response = await consistencyApi.check(projectId, content, checkType);
      setResult(response.result);
      return response.result;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { result, loading, check };
}

// Knowledge Graph Hook
export function useKnowledgeGraph(projectId: string) {
  const [nodes, setNodes] = useState<{ id: string; label: string; type?: string }[]>([]);
  const [edges, setEdges] = useState<{ source: string; target: string; label?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const response = await kgApi.visualize(projectId);
      setNodes(response.nodes);
      setEdges(response.edges);
    } catch (err) {
      console.error('Failed to load knowledge graph:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const query = useCallback(async (question: string) => {
    const response = await kgApi.query(projectId, question);
    return response.answer;
  }, [projectId]);

  return { nodes, edges, loading, loadGraph, query };
}

// Simulation Hook
export function useSimulation(projectId: string) {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSimulations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await simulationApi.list(projectId);
      setSimulations(result.items);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createAndRun = useCallback(async (data: Parameters<typeof simulationApi.createAndRun>[1]) => {
    setLoading(true);
    try {
      const result = await simulationApi.createAndRun(projectId, data);
      await loadSimulations();
      return result;
    } finally {
      setLoading(false);
    }
  }, [projectId, loadSimulations]);

  return { simulations, loading, loadSimulations, createAndRun };
}

// Style Fingerprint Hook
export function useStyleFingerprint(projectId: string) {
  const [fingerprint, setFingerprint] = useState<StyleFingerprintResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFingerprint = useCallback(async () => {
    setLoading(true);
    try {
      const result = await styleImportApi.getFingerprint(projectId);
      setFingerprint(result);
    } catch (err) {
      console.error('Failed to load style fingerprint:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const analyzeContent = useCallback(async (content: string) => {
    setLoading(true);
    try {
      const result = await styleImportApi.analyzeStyle(projectId, content);
      setFingerprint(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return { fingerprint, loading, loadFingerprint, analyzeContent };
}