// Simple fallback JS vector DB instead of a complex native setup if sqlite-vss is not fully set up.
// Or we can use sqlite-vss but for simplicity in v1 we stub or use a basic similarity score map.

export class VectorIndex {
   private vectors: Map<string, number[]> = new Map();

   upsert(id: string, vector: number[]) {
      this.vectors.set(id, vector);
   }

   search(queryVector: number[], limit: number = 10): Array<{id: string, score: number}> {
      const results: Array<{id: string, score: number}> = [];
      for (const [id, vec] of this.vectors.entries()) {
         results.push({ id, score: this.cosineSimilarity(queryVector, vec) });
      }
      return results.sort((a, b) => b.score - a.score).slice(0, limit);
   }

   private cosineSimilarity(vecA: number[], vecB: number[]): number {
      if (vecA.length !== vecB.length || vecA.length === 0) return 0;
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < vecA.length; i++) {
         const a = vecA[i];
         const b = vecB[i];
         if (a === undefined || b === undefined) return 0;
         dotProduct += a * b;
         normA += a * a;
         normB += b * b;
      }
      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
   }
}
