import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatSession {
  id: string;
  messages: Array<{ role: string, message: string, timestamp: Date }>;
}

interface ChatDB extends DBSchema {
  sessions: {
    key: string;
    value: ChatSession;
  };
}

export class IDBChatMemoryStore {
  private dbPromise: Promise<IDBPDatabase<ChatDB>>;

  constructor() {
    this.dbPromise = openDB<ChatDB>('chat-db', 1, {
      upgrade(db) {
        db.createObjectStore('sessions');
      },
    });
  }

  async getSessions(): Promise<string[]> {
    const db = await this.dbPromise;
    const sessionKeys = await db.getAllKeys('sessions');
    return sessionKeys;
  }

  async addSession(session: ChatSession): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readwrite');
    tx.store.add(session);
    await tx.done;
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    const db = await this.dbPromise;
    return db.get('sessions', id);
  }

  async updateSession(session: ChatSession): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readwrite');
    tx.store.put(session);
    await tx.done;
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readwrite');
    tx.store.delete(id);
    await tx.done;
  }
}
