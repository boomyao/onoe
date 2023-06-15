import { ChangeEvent, useRef } from "react"
import { vectorStore } from "../gas/vector-store";
import { Document } from "langchain/document";

export function Embeddings() {
    const fileInput = useRef(null)

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const fr=new FileReader(); 
        fr.onload=async function(){
            const documents = fr.result.split("\n").map((line) => {
                return new Document({ pageContent: line });
            }).filter((doc) => doc.pageContent?.length > 0);
            for(let i = 0; i < documents.length; i++) {
                await vectorStore.addDocuments([documents[i]])
            }
            console.log("done")
        }
        fr.readAsText(event.target.files[0]);
    }

    return (
        <input type="file" ref={fileInput} onChange={handleChange}></input>
    )
}