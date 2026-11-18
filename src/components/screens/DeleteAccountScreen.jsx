import { useState } from 'react';

export default function DeleteAccountScreen({ currentUser, onConfirm, onBack }) {
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const needsPassword = currentUser.provider === 'password';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreed) {
      setError('탈퇴 안내에 동의해주세요.');
      return;
    }
    if (needsPassword && !password.trim()) {
      setError('본인 확인을 위해 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(password);
    } catch (err) {
      setSubmitting(false);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않아요.');
      } else {
        setError('탈퇴 처리 중 문제가 발생했어요. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>회원 탈퇴</strong>
      </div>

      <form className="settings-detail-body delete-account-form" onSubmit={handleSubmit}>
        <p className="muted">탈퇴하시면 아래 정보가 모두 삭제되며 복구할 수 없어요.</p>
        <ul className="delete-account-list">
          <li>프로필 정보(닉네임, 사진, 팔로잉/찜 목록)</li>
          <li>호스트 등록 정보 및 작성한 후기</li>
          <li>로그인 계정</li>
        </ul>
        <p className="muted">참여했던 모임의 참여 기록이나 채팅 메시지는 다른 참여자를 위해 남아있을 수 있어요.</p>

        {needsPassword && (
          <label>
            비밀번호 확인
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="본인 확인을 위해 입력해주세요"
            />
          </label>
        )}

        <label className="delete-account-agree">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>안내 내용을 확인했으며 탈퇴에 동의합니다.</span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-danger btn-block" disabled={submitting}>
          {submitting ? '처리 중...' : '회원 탈퇴하기'}
        </button>
      </form>
    </div>
  );
}
