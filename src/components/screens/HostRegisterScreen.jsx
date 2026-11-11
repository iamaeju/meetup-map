import { useState } from 'react';
import { CATEGORIES, PROVINCES } from '../../data/meetups';

const REAL_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

const STATUS_BANNER = {
  pending: { className: 'host-status-banner pending', text: '⏳ 승인 검토 중이에요. 관리자가 확인 후 알려드려요.' },
  approved: { className: 'host-status-banner', text: '✅ 승인된 팝미팅 호스트예요. 프로필에 뱃지가 표시돼요.' },
  rejected: { className: 'host-status-banner rejected', text: '❌ 이번 신청은 반려됐어요. 내용을 수정해서 다시 신청해보세요.' },
};

export default function HostRegisterScreen({ host, currentUserName, onSave, onCancelHost, onBack }) {
  const [displayName, setDisplayName] = useState(host?.displayName || currentUserName);
  const [intro, setIntro] = useState(host?.intro || '');
  const [category, setCategory] = useState(host?.category || REAL_CATEGORIES[0].id);
  const [region, setRegion] = useState(host?.region || PROVINCES[1]);
  const [isBusiness, setIsBusiness] = useState(host?.isBusiness || false);
  const [error, setError] = useState('');

  const status = host?.status || 'none';
  const isApplied = status === 'pending' || status === 'approved';

  const submitLabel = {
    none: '호스트 등록 신청하기',
    pending: '신청 내용 수정하기',
    approved: '호스트 정보 수정하기',
    rejected: '다시 신청하기',
  }[status];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim() || !intro.trim()) {
      setError('호스트 이름과 소개글을 입력해주세요.');
      return;
    }
    onSave({
      // 이미 승인된 호스트가 정보만 수정하는 경우는 승인 상태 유지, 그 외(신규/반려 후 재신청)는 다시 검토 대기로
      status: status === 'approved' ? 'approved' : 'pending',
      displayName: displayName.trim(),
      intro: intro.trim(),
      category,
      region,
      isBusiness,
      appliedAt: new Date().toISOString(),
    });
    onBack();
  };

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>팝미팅 호스트 등록</strong>
      </div>

      <div className="settings-detail-body">
        {STATUS_BANNER[status] && (
          <div className={STATUS_BANNER[status].className}>{STATUS_BANNER[status].text}</div>
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
            {submitLabel}
          </button>

          {isApplied && (
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
