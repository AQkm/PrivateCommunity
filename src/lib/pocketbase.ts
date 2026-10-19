import PocketBase from 'pocketbase';

const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

export const pb = new PocketBase(pocketBaseUrl);

export interface PhotoRecord {
  [key: string]: string;
  id: string;
  collectionId: string;
  collectionName: 'Photos';
  photo: string;
  event: string;
  created: string;
  updated: string;
}

export interface EventRecord {
  [key: string]: string;
  id: string;
  collectionId: string;
  collectionName: 'Events';
  title: string;
  date: string;
  description: string;
  created: string;
  updated: string;
}
