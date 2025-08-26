type Chunk = { id: string; text: string; page?: number; sourceId: string; vector: number[] };
type VectorStore = {
  upsertChunks(chunks: Chunk[]): Promise<void>;
  search(query: string, k: number): Promise<Chunk[]>;
};
