import { useEffect, useState } from 'react';
import { listPendingHostApplications, setHostStatus } from '../../lib/auth';

export default function AdminHostApprovalScreen({ onBack }) {
  const [applications, setApplications] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setApplications(null);
    listPendingHostApplications().then(setApplications);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (userId, status) => {
    setBusyId(userId);
    await setHostStatus(userId, status);
    setBusyId(null);
    load();
  };

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>호스트 승인 관리</strong>
      </div>

      <div className="settings-detail-body">
        {applications === null && <p className="muted" style={{ padding: '16px 18px' }}>불러오는 중...</p>}
        {applications?.length === 0 && (
          <p className="muted" style={{ padding: '16px 18px' }}>승인 대기 중인 신청이 없어요.</p>
        )}
        {applications?.map((u) => (
          <div key={u.id} className="admin-app-card">
            <div className="admin-app-head">
              <strong>{u.host.displayName || u.name}</strong>
              {u.host.isBusiness && <span className="badge badge-biz">스몰비즈니스</span>}
            </div>
            <p className="muted">신청자: {u.name} ({u.email || u.id})</p>
            <p className="admin-app-intro">{u.host.intro}</p>
            <p className="muted">
              카테고리: {u.host.category || '-'} · 지역: {u.host.region || '-'}
            </p>
            <div className="admin-app-actions">
              <button
                className="btn btn-primary btn-small"
                disabled={busyId === u.id}
                onClick={() => handleDecision(u.id, 'approved')}
              >
                승인
              </button>
              <button
                className="btn btn-danger btn-small"
                disabled={busyId === u.id}
                onClick={() => handleDecision(u.id, 'rejected')}
              >
                반려
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
