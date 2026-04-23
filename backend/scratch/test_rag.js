import { getRelevantContext, chunkText } from "../lib/rag.js";

const text = `The quick brown fox jumps over the lazy dog. 
This is a story about an animal.
Wait, what animal? A fox.
The fox was very quick and brown.
The dog was lazy and did not move.
We love animals!
What is the color of the sky? It is blue.
The capital of France is Paris.
The human body has 206 bones.
The mitochondria is the powerhouse of the cell.`;

const query = "color sky";
// Override chunk length manually for test
const chunks = chunkText(text, 50); 
console.log("Chunks generated:", chunks.length);

const natural = await import("natural");
const TfIdf = natural.default.TfIdf;
const tfidf = new TfIdf();

chunks.forEach((chunk) => {
    tfidf.addDocument(chunk);
});

const scores = [];
tfidf.tfidfs(query, function(i, measure) {
    scores.push({
        index: i,
        score: measure,
        content: chunks[i]
    });
});
scores.sort((a, b) => b.score - a.score);
console.log(scores);
