// lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";
let _pc: Pinecone | null = null;
export function pinecone() { return (_pc ??= new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })); }
export function pineconeIndex() { return pinecone().Index(process.env.PINECONE_INDEX!); }
