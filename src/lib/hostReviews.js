import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'hostReviews';

export function subscribeHostReviews(hostName, callback) {
  const q = query(collection(db, COLLECTION), where('hostName', '==', hostName));
  return onSnapshot(q, (snap) => {
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
    callback(reviews);
  });
}

export function addHostReview({ hostName, meetupId, meetupTitle, authorName, rating, text }) {
  return addDoc(collection(db, COLLECTION), {
    hostName,
    meetupId,
    meetupTitle,
    authorName,
    rating,
    text: text || '',
    createdAt: Date.now(),
  });
}
