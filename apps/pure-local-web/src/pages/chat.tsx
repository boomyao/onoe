
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from 'langchain/prompts';
import ChatUI, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { vectorStore } from '../gas/vector-store';
import { shouldFindDB } from '../gacha/should-find-db';

const model = new ChatOpenAI({
    temperature: 0.3,
});


const promptTemplate = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
        `You are a helpful assistant, talkative and provides lots of specific details from its context, response's language same as input's language.
        
        Relevant pieces of Context:
        {context}
        `
      ),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate(`{input}`),
])

const memory = new BufferMemory({
    inputKey: 'input',
    returnMessages: true,
});
const chain = new ConversationChain({ llm: model, memory, prompt: promptTemplate });

export function Chat() {
    const { messages, appendMsg, setTyping } = useMessages([]);

    async function handleSend(type, val) {
        if (type === 'text' && val.trim()) {
            appendMsg({
                type: 'text',
                content: { text: val },
                position: 'right',
            });

            let context = ''
            const needContext = await shouldFindDB(val);
            if (needContext) {
                const retriever = vectorStore.asRetriever(3);
                const relevant = await retriever.getRelevantDocuments(val);
                context = relevant.map((r) => r.pageContent).join("\n");
            }
            setTyping(true);
            const aiRes = await chain.call({ context, input: val })
            setTyping(false);
            appendMsg({
                type: 'text',
                content: { text: aiRes.response },
                position: 'left',
            });
        }
    }

    function renderMessageContent(msg) {
        const { content } = msg;
        return <Bubble content={content.text} />;
    }

    return (
        <div>
            <ChatUI
                navbar={{ title: 'Assistant' }}
                messages={messages}
                renderMessageContent={renderMessageContent}
                onSend={handleSend}
                />
        </div>
    )
}