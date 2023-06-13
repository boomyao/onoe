import { IDBVectorStore } from '../idb-vector-store';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const openaiEmbeddings = new OpenAIEmbeddings();
export const vectorStore = new IDBVectorStore(openaiEmbeddings);