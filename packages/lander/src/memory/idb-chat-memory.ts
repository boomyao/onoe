import { IDBChatMemoryStore } from './idb-chat-memory-store'

export class IDBChatMemory {
    private store: IDBChatMemoryStore;
  
    constructor() {
      this.store = new IDBChatMemoryStore();
    }
  
    private async addMessage(sessionId: string, role: string, message: string): Promise<void> {
      let session = await this.store.getSession(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          messages: []
        };
      }
      session.messages.push({ role, message, timestamp: new Date() });
      await this.store.updateSession(session);
    }
  
    async addUserMessage(sessionId: string, message: string): Promise<void> {
      await this.addMessage(sessionId, 'user', message);
    }
  
    async addAIMessage(sessionId: string, message: string): Promise<void> {
      await this.addMessage(sessionId, 'AI', message);
    }
  
    async getMessages(sessionId: string): Promise<Array<{ role: string, message: string, timestamp: Date }>> {
      const session = await this.store.getSession(sessionId);
      return session ? session.messages : [];
    }
  
    async getSessions(): Promise<string[]> {
        return this.store.getSessions();
    }

    async createSession(): Promise<void> {
        const sessionId = Math.random().toString(36).substring(2, 15);
        await this.store.addSession({
            id: sessionId,
            messages: []
        })
    }
  }
  