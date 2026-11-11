import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const KAKAO_UID_KEY = 'kkachi_kakao_uid';

// 호스트 승인을 처리할 수 있는 관리자 계정
export const ADMIN_EMAILS = ['iamaeju@daain.com'];
export function isAdmin(user) {
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
}

export const DEFAULT_NOTIFICATION_SETTINGS = {
  all: true,
  chat: true,
  meetup: true,
  social: true,
  keywordsEnabled: false,
  keywords: [],
  sound: true,
  soundType: 'default',
};

// status: 'none' | 'pending' | 'approved' | 'rejected'
export const DEFAULT_HOST = {
  status: 'none',
  displayName: '',
  intro: '',
  category: '',
  region: '',
  isBusiness: false,
  appliedAt: null,
};

function withDefaults(user) {
  if (!user) return user;
  return {
    ...user,
    notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS, ...(user.notificationSettings || {}) },
    host: { ...DEFAULT_HOST, ...(user.host || {}) },
    following: user.following || [],
  };
}

function mapFirebaseError(code) {
  const messages = {
    'auth/email-already-in-use': '이미 가입된 이메일이에요.',
    'auth/invalid-email': '이메일 형식이 올바르지 않아요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 해요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않아요.',
    'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않아요.',
    'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않아요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔어요.',
  };
  return messages[code] || '로그인에 실패했어요. 잠시 후 다시 시도해주세요.';
}

async function readUserDoc(id) {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? withDefaults({ id, ...snap.data() }) : null;
}

async function ensureUserDoc(id, data) {
  const ref = doc(db, 'users', id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return withDefaults({ id, ...snap.data() });
  }
  const fresh = {
    name: data.name || '까치 사용자',
    email: data.email || null,
    avatar: data.avatar || null,
    provider: data.provider,
    following: [],
    host: DEFAULT_HOST,
    notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
    joinedAt: new Date().toISOString(),
  };
  await setDoc(ref, fresh);
  return withDefaults({ id, ...fresh });
}

export function requireFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase가 아직 설정되지 않았어요.');
  }
}

export async function signUp({ name, email, password }) {
  requireFirebase();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const user = await ensureUserDoc(cred.user.uid, { name, email, provider: 'password' });
    return { user };
  } catch (err) {
    return { error: mapFirebaseError(err.code) };
  }
}

export async function logIn({ email, password }) {
  requireFirebase();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = (await readUserDoc(cred.user.uid)) || (await ensureUserDoc(cred.user.uid, { name: cred.user.displayName, email, provider: 'password' }));
    return { user };
  } catch (err) {
    return { error: mapFirebaseError(err.code) };
  }
}

export async function loginWithGoogle() {
  requireFirebase();
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  return ensureUserDoc(cred.user.uid, {
    name: cred.user.displayName,
    email: cred.user.email,
    avatar: cred.user.photoURL,
    provider: 'google',
  });
}

// 카카오는 Firebase Auth가 아니라 Firestore에 직접 사용자 문서를 만들어 기기 간 동기화 (Redirect+코드교환은 lib/kakaoAuth.js 참고)
export async function socialLoginKakao(profile) {
  requireFirebase();
  const id = `kakao_${profile.socialId}`;
  const user = await ensureUserDoc(id, {
    name: profile.name,
    avatar: profile.avatar,
    provider: 'kakao',
  });
  localStorage.setItem(KAKAO_UID_KEY, id);
  return user;
}

export function logOut() {
  localStorage.removeItem(KAKAO_UID_KEY);
  if (isFirebaseConfigured) signOut(auth);
}

// Firebase Auth 로그인 상태 + 카카오(Firestore 전용 계정) 상태를 함께 구독
export function watchSession(callback) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = (await readUserDoc(fbUser.uid)) || (await ensureUserDoc(fbUser.uid, { name: fbUser.displayName, email: fbUser.email, avatar: fbUser.photoURL, provider: 'password' }));
      callback(user);
      return;
    }
    const kakaoId = localStorage.getItem(KAKAO_UID_KEY);
    if (kakaoId) {
      const user = await readUserDoc(kakaoId);
      if (user) {
        callback(user);
        return;
      }
    }
    callback(null);
  });
}

// 내 프로필 문서를 실시간 구독 — 다른 세션(관리자)이 호스트 승인 등으로 내 문서를 바꾸면 즉시 반영됨
export function subscribeToUserDoc(id, callback) {
  if (!isFirebaseConfigured || !id) return () => {};
  return onSnapshot(doc(db, 'users', id), (snap) => {
    if (snap.exists()) callback(withDefaults({ id, ...snap.data() }));
  });
}

export async function updateUser(id, updater) {
  const current = (await readUserDoc(id)) || withDefaults({ id });
  const next = updater(current);
  await setDoc(doc(db, 'users', id), next, { merge: true });
  return next;
}

// 관리자용 — 승인 대기 중인 호스트 신청 목록
export async function listPendingHostApplications() {
  const q = query(collection(db, 'users'), where('host.status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setHostStatus(userId, status) {
  return updateUser(userId, (u) => ({ ...u, host: { ...u.host, status } }));
}

export async function toggleFollow(currentUserId, targetName) {
  return updateUser(currentUserId, (u) => {
    const following = u.following.includes(targetName)
      ? u.following.filter((f) => f !== targetName)
      : [...u.following, targetName];
    return { ...u, following };
  });
}
