import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { initialMeetups } from '../data/meetups';

const COLLECTION = 'meetups';

let seeded = false;

// 처음 연결 시 Firestore에 모임이 하나도 없으면 목업 데이터로 한 번만 채워넣음
async function seedIfEmpty() {
  if (seeded) return;
  seeded = true;
  const snap = await getDocs(query(collection(db, COLLECTION), limit(1)));
  if (!snap.empty) return;
  // feedPosts.meetupId(1~6)와 그대로 매칭되도록 원래 숫자 id를 문서 id로 사용
  await Promise.all(
    initialMeetups.map(({ id, ...rest }) => setDoc(doc(db, COLLECTION, String(id)), rest))
  );
}

export function subscribeToMeetups(callback) {
  seedIfEmpty();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function createMeetup(data) {
  return addDoc(collection(db, COLLECTION), {
    ...data,
    participants: [],
    waitlist: [],
    status: 'open',
  });
}

export function joinMeetup(id, name) {
  return updateDoc(doc(db, COLLECTION, id), { participants: arrayUnion(name) });
}

export function leaveMeetup(id, name) {
  return updateDoc(doc(db, COLLECTION, id), { participants: arrayRemove(name) });
}

export function joinWaitlist(id, name) {
  return updateDoc(doc(db, COLLECTION, id), { waitlist: arrayUnion(name) });
}

export function leaveWaitlist(id, name) {
  return updateDoc(doc(db, COLLECTION, id), { waitlist: arrayRemove(name) });
}
