import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// 사용자 신고 — 신고 내용은 관리자만 확인 (앱에서는 다시 조회하지 않음)
export async function reportContent({ reporterName, targetName, context, reason, detail }) {
  await addDoc(collection(db, 'reports'), {
    reporterName,
    targetName,
    context: context || '',
    reason,
    detail: detail || '',
    createdAt: Date.now(),
  });
}
