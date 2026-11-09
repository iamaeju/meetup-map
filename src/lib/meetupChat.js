import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeMeetupMessages(meetupId, callback) {
  const q = query(collection(db, 'meetups', String(meetupId), 'messages'), orderBy('at'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data())));
}

export async function sendMeetupMessage(meetupId, sender, text) {
  await addDoc(collection(db, 'meetups', String(meetupId), 'messages'), {
    sender,
    text,
    at: Date.now(),
  });
}
