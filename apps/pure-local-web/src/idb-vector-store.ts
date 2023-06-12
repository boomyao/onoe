/**
 * reference: vector-storage https://github.com/nitaiaharoni1/vector-storage
 */

import { Embeddings } from 'langchain/embeddings'
import { VectorStore } from 'langchain/vectorstores/base'
import { Document } from 'langchain/document'
import { cosineSimilarity } from './utils/similarity';
import { IDBPDatabase, openDB } from 'idb';
import { getObjectSizeInMB } from './utils/memory-size';

interface IDBVectorSchema {
    content: string;
    embedding: number[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any>;
    hits?: number;
    timestamp: number;
}

export class IDBVectorStore extends VectorStore {
  declare FilterType: (doc: Document) => boolean;

  private idbVectors: IDBVectorSchema[] = [];

  private db!: IDBPDatabase<IDBVectorSchema>;
  private readonly maxSizeInMB = 2048;

  constructor(
    embeddings: Embeddings,
    { ...rest } = {}
  ) {
    super(embeddings, rest);

    this.loadFromIndexDbStorage();
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(({ pageContent }) => pageContent);
    return this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents
    );
  }

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    const idbVectors = vectors.map((embedding, idx) => ({
      content: documents[idx].pageContent,
      embedding,
      metadata: documents[idx].metadata,
      hits: 0,
      timestamp: Date.now(),
    }));

    this.idbVectors.push(...idbVectors);
    this.removeDocsLRU();

    // Save to index db storage
    await this.saveToIndexDbStorage();
  }

  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document, number][]> {
    const filterFunction = (memoryVector: IDBVectorSchema) => {
      if (!filter) {
        return true;
      }

      const doc = new Document({
        metadata: memoryVector.metadata,
        pageContent: memoryVector.content,
      });
      return filter(doc);
    };
    const filteredVectors = this.idbVectors.filter(filterFunction);
    const searches = filteredVectors
      .map((vector, index) => ({
        similarity: cosineSimilarity(query, vector.embedding),
        index,
      }))
      .sort((a, b) => (a.similarity > b.similarity ? -1 : 0))
      .slice(0, k);

    this.updateHitCounters(searches.map((search) => filteredVectors[search.index]));

    const result: [Document, number][] = searches.map((search) => [
      new Document({
        metadata: filteredVectors[search.index].metadata,
        pageContent: filteredVectors[search.index].content,
      }),
      search.similarity,
    ]);

    return result;
  }

  private async loadFromIndexDbStorage() {
    if (!this.db) {
        this.db = await this.initDB();
      }
      this.idbVectors = await this.db.getAll('documents');
      this.removeDocsLRU();
  }

  private async initDB(): Promise<IDBPDatabase<IDBVectorSchema>> {
    return await openDB<IDBVectorSchema>('VectorStorageDatabase', undefined, {
      upgrade(db) {
        const documentStore = db.createObjectStore('documents', {
          autoIncrement: true,
          keyPath: 'id',
        });
        documentStore.createIndex('content', 'content', { unique: true })
        documentStore.createIndex('embedding', 'embedding', { unique: true });
        documentStore.createIndex('metadata', 'metadata');
        documentStore.createIndex('hits', 'hits');
        documentStore.createIndex('timestamp', 'timestamp');
      },
    });
  }

  private async saveToIndexDbStorage(): Promise<void> {
    if (!this.db) {
      this.db = await this.initDB();
    }
    try {
      const tx = this.db.transaction('documents', 'readwrite');
      await tx.objectStore('documents').clear();
      for (const doc of this.idbVectors) {
        // eslint-disable-next-line no-await-in-loop
        await tx.objectStore('documents').put(doc);
      }
      await tx.done;
    } catch (error: any) {
      console.error('Failed to save to IndexedDB:', error.message);
    }
  }

  private removeDocsLRU(): void {
    if (getObjectSizeInMB(this.idbVectors) > this.maxSizeInMB) {
      // Sort documents by hit counter (ascending) and then by timestamp (ascending)
      this.idbVectors.sort((a, b) => (a.hits ?? 0) - (b.hits ?? 0) || a.timestamp - b.timestamp);

      // Remove documents until the size is below the limit
      while (getObjectSizeInMB(this.idbVectors) > this.maxSizeInMB) {
        this.idbVectors.shift();
      }
    }
  }

  private updateHitCounters(results: Array<any>) {
    results.forEach((doc) => {
      doc.hits = (doc.hits ?? 0) + 1; // Update hit counter
    });
  }

  static async fromTexts(
    texts: string[],
    metadatas: object[] | object,
    embeddings: Embeddings,
  ): Promise<IDBVectorStore> {
    const docs: Document[] = [];
    for (let i = 0; i < texts.length; i += 1) {
      const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
      const newDoc = new Document({
        pageContent: texts[i],
        metadata,
      });
      docs.push(newDoc);
    }
    return IDBVectorStore.fromDocuments(docs, embeddings);
  }

  static async fromDocuments(
    docs: Document[],
    embeddings: Embeddings,
  ): Promise<IDBVectorStore> {
    const instance = new this(embeddings);
    await instance.addDocuments(docs);
    return instance;
  }

  static async fromExistingIndex(
    embeddings: Embeddings,
  ): Promise<IDBVectorStore> {
    const instance = new this(embeddings);
    return instance;
  }
}
