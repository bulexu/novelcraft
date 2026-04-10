'use client';

import type { Character } from '@/types';
import InferenceForm from './InferenceForm';

interface InferenceTabProps {
  projectId: string;
  characters: Character[];
}

export default function InferenceTab({ projectId, characters }: InferenceTabProps) {
  return (
    <InferenceForm projectId={projectId} characters={characters} />
  );
}