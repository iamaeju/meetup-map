import { collection, doc, setDoc, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from './firebase';

function threadId(a, b) {
  return [a, b].sort().join('::');
}

export function subscribeThreads(userName, callback) {
  const q = query(collection(db, 'dmThreads'), where('participants', 'array-contains', userName));
  return onSnapshot(q, (snap) => {
    const threads = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .map((t) => ({ ...t, otherUser: t.participants.find((p) => p !== userName) }))
      .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
    callback(threads);
  });
}

export function subscribeMessages(userA, userB, callback) {
  const id = threadId(userA, userB);
  const q = query(collection(db, 'dmThreads', id, 'messages'), orderBy('at'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data())));
}

export async function sendMessage(userA, userB, sender, text) {
  const id = threadId(userA, userB);
  const ref = doc(db, 'dmThreads', id);
  const at = Date.now();
  await setDoc(ref, { participants: [userA, userB], lastMessage: text, lastAt: at }, { merge: true });
  await addDoc(collection(ref, 'messages'), { sender, text, at });
}
