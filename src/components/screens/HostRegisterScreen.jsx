import { useState } from 'react';
import { CATEGORIES, PROVINCES } from '../../data/meetups';

const REAL_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

export default function HostRegisterScreen({ host, currentUserName, onSave, onCancelHost, onBack }) {
  const [displayName, setDisplayName] = useState(host?.displayName || currentUserName);
  const [intro, setIntro] = useState(host?.intro || '');
  const [category, setCategory] = useState(host?.category || REAL_CATEGORIES[0].id);
  const [region, setRegion] = useState(host?.region || PROVINCES[1]);
  const [isBusiness, setIsBusiness] = useState(host?.isBusiness || false);
  const [error, setError] = useState('');

  const isRegistered = !!host?.registered;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim() || !intro.trim()) {
      setError('호스트 이름과 소개글을 입력해주세요.');
      return;
    }
    onSave({
      registered: true,
      displayName: displayName.trim(),
      intro: intro.trim(),
      category,
      region,
      isBusiness,
    });
    onBack();
  };

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>호스트 등록</strong>
      </div>

      <div className="settings-detail-body">
        {isRegistered && (
          <div className="host-status-banner">
            ✅ 호스트로 등록되어 있어요. 아래 내용을 수정할 수 있어요.
          </div>
        )}

        <form className="host-form" onSubmit={handleSubmit}>
          <label>
            호스트 이름
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="가게 이름 또는 활동명" />
          </label>

          <label className="checkbox-label">
            <input type="checkbox" checked={isBusiness} onChange={(e) => setIsBusiness(e.target.checked)} />
            스몰비즈니스(가게/공방 등)를 운영하고 있어요
          </label>

          <label>
            자기소개
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={5}
              placeholder="어떤 모임을 열고 싶은지, 본인을 소개해주세요."
            />
          </label>

          <div className="form-row">
            <label>
              주요 카테고리
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {REAL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              활동 지역
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                {PROVINCES.filter((p) => p !== '전체').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block">
            {isRegistered ? '수정 완료' : '호스트 등록하기'}
          </button>

          {isRegistered && (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => {
                onCancelHost();
                onBack();
              }}
            >
              호스트 등록 취소
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
