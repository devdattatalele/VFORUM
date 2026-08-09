'use server';
import type { Event, UserProfile } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { hasPermission } from '@/lib/utils/userUtils';

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
  // Check if user has permission to create events
  if (!hasPermission(author, 'create_events')) {
    throw new Error('You do not have permission to create events. Only moderators and admins can create events.');
  }

  try {
    const docRef = await adminDb.collection('events').add({
      ...eventData,
      author,
      dateTime: dateTime.toISOString(), // Store as ISO string
      createdAt: FieldValue.serverTimestamp(), // Use Firestore server timestamp
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
    const querySnapshot = await adminDb.collection('events').get();
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        // Ensure createdAt and dateTime are strings if they come from Firestore as Timestamps
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as unknown as Event;
    });
  } catch (error) {
    console.error('Error fetching events: ', error);
    return [];
  }
}

export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const docRef = adminDb.collection('events').doc(eventId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data()!;
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as unknown as Event;
    }
    return null;
  } catch (error) {
    console.error('Error fetching event by ID: ', error);
    return null;
  }
}

export async function getEventsByCommunity(communityId: string): Promise<Event[]> {
  try {
    const querySnapshot = await adminDb.collection('events').where('communityId', '==', communityId).get();
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        dateTime: typeof data.dateTime === 'string' ? data.dateTime : (data.dateTime?.toDate ? data.dateTime.toDate().toISOString() : new Date().toISOString()),
      } as unknown as Event;
    });
  } catch (error) {
    console.error('Error fetching events by community: ', error);
    return [];
  }
}
