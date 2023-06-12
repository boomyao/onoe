import { OpenAI } from 'langchain/llms/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { useEffect } from 'react';
import { AzureApiKey } from './llm/constants';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from 'langchain/document'
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from 'langchain/prompts';
import { AIChatMessage, HumanChatMessage } from 'langchain/schema';

const openaiEmbeddings = new OpenAIEmbeddings({
    azureOpenAIApiKey: AzureApiKey,
    modelName: "text-embedding-ada-002",
    azureOpenAIApiInstanceName: "cev-openai",
    azureOpenAIApiVersion: "2023-05-15",
    azureOpenAIApiDeploymentName: "embedding",
});
const model = new ChatOpenAI({
    azureOpenAIApiKey: AzureApiKey,
    modelName: "gpt-3.5-turbo-0301",
    azureOpenAIApiInstanceName: "cev-openai",
    azureOpenAIApiVersion: "2023-03-15-preview",
    azureOpenAIApiDeploymentName: "dev",
    temperature: 0.3,
});
const vectorStore = new MemoryVectorStore(openaiEmbeddings);
const documents = [new Document({ pageContent: `
commits:
- author: changfeng
  date: '2023-03-27T09:43:35Z'
  id: a6ec8b3ab502ce886406ad247e897aeca59ce62f
  message: "feat: \u5B8C\u6210\u53D1\u5305\u811A\u672C"
content: "module.exports = {\n    extends: '@commitlint/config-conventional',\n  \
  \  rules: {\n        'type-enum': [\n            2,\n            'always',\n   \
  \         [\n                'build',\n                'chore',\n              \
  \  'ci',\n                'docs',\n                'feat',\n                'fix',\n\
  \                'perf',\n                'refactor',\n                'revert',\n\
  \                'style',\n                'test',\n                'release',\n\
  \                'wip',\n            ],\n        ],\n    },\n};\n"
file_path: .commitlintrc.js
name: editor-next
version: 1.0.0
`  })]

const promptTemplate = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
        `You are a helpful assistant, talkative and provides lots of specific details from its context.
        
        Relevant pieces of Context:
        {context}
        `
      ),
    // new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate(`Human: {input}`),
])

const memory = new BufferMemory({
    inputKey: 'input'
});
const chain = new ConversationChain({ llm: model, memory, prompt: promptTemplate });
window["chain"] = chain;
window["memory"] = memory;
window["vectorStore"] = vectorStore;

export function Chat() {
    async function onClick() {
        const input = '谁制定了editor-next的commit规范？'
        await vectorStore.addDocuments(documents)
        const retriever = vectorStore.asRetriever(1);
        const relevant = await retriever.getRelevantDocuments(input);
        const context = relevant.map((r) => r.pageContent).join("\n");
        const aiRes = await chain.call({ context, input })
        console.log(aiRes)
    }
    return (
        <div>
            <button onClick={onClick}>todo</button>
        </div>
    )
}