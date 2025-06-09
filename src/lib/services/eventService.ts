
'use server';
import type { Event, UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

// Type for event data going to Firestore, ensuring dateTime and createdAt are compatible
interface EventDataForFirestore extends Omit<Event, 'id' | 'dateTime' | 'createdAt' | 'author'> {
  dateTime: string; // Keep as ISO string for now
  createdAt: Timestamp;
  author: UserProfile; // Store the full UserProfile object
}


export async function addEvent(
  eventData: Omit<Event, 'id' | 'rsvpCount' | 'dateTime' | 'createdAt' | 'author'>,
  author: UserProfile,
  dateTime: Date // Expecting Date object from form
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      author,
      dateTime: dateTime.toISOString(), // Store as ISO string
      createdAt: serverTimestamp(), // Use Firestore server timestamp
      rsvpCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event: ', error);
    throw new Error('Failed to add event.');
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Ensure createdAt and dateTime are strings if they come from Firestore as Timestamps
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as Event;
    });
  } catch (error) {
    console.error('Error fetching events: ', error);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as Event;
    }
    return null;
  } catch (error) {
    console.error('Error fetching event by ID: ', error);
    return null;
  }
}

export async function getEventsByCommunity(communityId: string): Promise<Event[]> {
  try {
    const q = query(collection(db, 'events'), where('communityId', '==', communityId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as Event;
    });
  } catch (error) {
    console.error('Error fetching events by community: ', error);
    return [];
  }
}
