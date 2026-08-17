export type KnowledgeSourceType =
  | "policy"
  | "documentation"
  | "decision"
  | "guideline";

export interface KnowledgeCreator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface KnowledgeDocument {
  id: string;
  projectId: string;
  title: string;
  content: string;
  sourceType: KnowledgeSourceType;
  createdBy: string | null;
  creator?: KnowledgeCreator;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeInput {
  title: string;
  content: string;
  sourceType?: KnowledgeSourceType;
}

export interface UpdateKnowledgeInput {
  title?: string;
  content?: string;
  sourceType?: KnowledgeSourceType;
}

export interface KnowledgeSearchInput {
  query: string;
  limit?: number;
  minSimilarity?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  projectId: string;
  title: string;
  content: string;
  sourceType: KnowledgeSourceType;
  similarity: number;
}

export interface ProjectKnowledgeQuery {
  sourceType?: KnowledgeSourceType;
}
