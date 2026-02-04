
import { db, storage } from './firebase';
import {
  doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SiteContent, Inquiry } from './types';
import { INITIAL_CONTENT } from './constants';

const CONTENT_DOC = 'siteContent';
const CONTENT_COLLECTION = 'config';
const INQUIRIES_COLLECTION = 'inquiries';

// --- Site Content ---

export async function loadContent(): Promise<SiteContent> {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, CONTENT_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteContent;
    }
    // First time: seed Firestore with initial content
    await setDoc(docRef, INITIAL_CONTENT);
    return INITIAL_CONTENT;
  } catch (error) {
    console.error('Error loading content from Firestore:', error);
    return INITIAL_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, CONTENT_DOC);
    await setDoc(docRef, content);
  } catch (error) {
    console.error('Error saving content to Firestore:', error);
    throw error;
  }
}

// --- Inquiries ---

export async function loadInquiries(): Promise<Inquiry[]> {
  try {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry));
  } catch (error) {
    console.error('Error loading inquiries from Firestore:', error);
    return [];
  }
}

export async function addInquiry(inquiry: Omit<Inquiry, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, INQUIRIES_COLLECTION), inquiry);
    return docRef.id;
  } catch (error) {
    console.error('Error adding inquiry to Firestore:', error);
    throw error;
  }
}

export async function updateInquiry(id: string, updates: Partial<Inquiry>): Promise<void> {
  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
}

// --- Image Upload ---

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
