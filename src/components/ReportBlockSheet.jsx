import { useState } from 'react';
import { reportContent } from '../lib/moderation';

const REASONS = ['스팸/광고', '욕설·혐오 표현', '사기·사칭', '부적절한 콘텐츠', '기타'];

// 특정 사용자에 대한 신고/차단 액션시트. DM·모임채팅 등 어디서든 재사용.
export default function ReportBlockSheet({
  reporterName,
  targetName,
  context,
  isBlocked,
  onToggleBlock,
  onClose,
}) {
  const [mode, setMode] = useState('menu'); // 'menu' | 'reason' | 'detail' | 'done'
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await reportContent({ reporterName, targetName, context, reason, detail });
    setSubmitting(false);
    setMode('done');
  };

  return (
    <div className="report-sheet-overlay" onClick={onClose}>
      <div className="report-sheet" onClick={(e) => e.stopPropagation()}>
        {mode === 'menu' && (
          <>
            <p className="report-sheet-title">{targetName}님</p>
            <button className="report-sheet-btn" onClick={() => setMode('reason')}>
              🚩 신고하기
            </button>
            <button
              className="report-sheet-btn report-sheet-btn-danger"
              onClick={() => {
                onToggleBlock(targetName);
                onClose();
              }}
            >
              {isBlocked ? '차단 해제하기' : '🚫 차단하기'}
            </button>
            <button className="report-sheet-btn report-sheet-btn-cancel" onClick={onClose}>
              취소
            </button>
          </>
        )}

        {mode === 'reason' && (
          <>
            <p className="report-sheet-title">신고 사유를 선택해주세요</p>
            {REASONS.map((r) => (
              <button
                key={r}
                className="report-sheet-btn"
                onClick={() => {
                  setReason(r);
                  setMode('detail');
                }}
              >
                {r}
              </button>
            ))}
            <button className="report-sheet-btn report-sheet-btn-cancel" onClick={onClose}>
              취소
            </button>
          </>
        )}

        {mode === 'detail' && (
          <form onSubmit={handleSubmitReport} className="report-sheet-detail-form">
            <p className="report-sheet-title">자세한 내용 (선택)</p>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상황을 자세히 알려주시면 검토에 도움이 돼요."
              rows={4}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? '신고 접수 중...' : '신고 제출'}
            </button>
          </form>
        )}

        {mode === 'done' && (
          <>
            <p className="report-sheet-title">신고가 접수됐어요.</p>
            <p className="muted" style={{ padding: '0 16px 12px' }}>
              검토 후 필요한 조치를 취할게요. 바로 차단하시겠어요?
            </p>
            <button
              className="report-sheet-btn report-sheet-btn-danger"
              onClick={() => {
                onToggleBlock(targetName);
                onClose();
              }}
            >
              🚫 이 사용자 차단하기
            </button>
            <button className="report-sheet-btn report-sheet-btn-cancel" onClick={onClose}>
              닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
