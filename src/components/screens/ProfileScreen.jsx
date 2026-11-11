import { useRef, useState } from 'react';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import HostRegisterScreen from './HostRegisterScreen';
import AdminHostApprovalScreen from './AdminHostApprovalScreen';
import { isAdmin } from '../../lib/auth';

function daysSince(iso) {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

const HOST_MENU_LABEL = {
  none: '팝미팅 호스트 등록 신청',
  pending: '호스트 신청 검토중',
  approved: '호스트 정보 관리',
  rejected: '호스트 재신청',
};

export default function ProfileScreen({
  meetups,
  onOpenMeetup,
  currentUser,
  profileImage,
  onProfileImageChange,
  onPatchUser,
  onLogout,
}) {
  const fileInputRef = useRef(null);
  const [panel, setPanel] = useState('main'); // 'main' | 'notifications' | 'host' | 'admin'
  const CURRENT_USER = currentUser.name;
  const joined = meetups.filter((m) => m.participants.includes(CURRENT_USER));
  const waiting = meetups.filter((m) => m.waitlist.includes(CURRENT_USER));
  const hosted = meetups.filter((m) => m.hostName === CURRENT_USER);
  const following = currentUser.following || [];
  const hostStatus = currentUser.host?.status || 'none';

  const handlePickImage = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onProfileImageChange(reader.result);
    reader.readAsDataURL(file);
  };

  if (panel === 'notifications') {
    return (
      <NotificationSettingsScreen
        settings={currentUser.notificationSettings}
        onChange={(settings) => onPatchUser({ notificationSettings: settings })}
        onBack={() => setPanel('main')}
      />
    );
  }

  if (panel === 'host') {
    return (
      <HostRegisterScreen
        host={currentUser.host}
        currentUserName={CURRENT_USER}
        onSave={(host) => onPatchUser({ host })}
        onCancelHost={() => onPatchUser({ host: { ...currentUser.host, status: 'none' } })}
        onBack={() => setPanel('main')}
      />
    );
  }

  if (panel === 'admin') {
    return <AdminHostApprovalScreen onBack={() => setPanel('main')} />;
  }

  return (
    <div className="screen profile-screen">
      <div className="screen-header">
        <h1>프로필</h1>
      </div>

      <div className="profile-head">
        <button className="profile-avatar" onClick={handlePickImage}>
          {profileImage ? <img src={profileImage} alt="프로필" /> : '🙂'}
          <span className="profile-avatar-edit">＋</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="profile-head-info">
          <h2>
            {CURRENT_USER}
            {hostStatus === 'approved' && <span className="kkachi-badge" title="승인된 팝미팅 호스트">🐦 까치</span>}
          </h2>
          <p className="muted">까치와 함께한 지 {daysSince(currentUser.joinedAt)}일째</p>
        </div>
        <button className="btn btn-secondary btn-small" onClick={handlePickImage}>
          사진 설정
        </button>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <strong>{joined.length}</strong>
          <span>참여한 모임</span>
        </div>
        <div className="profile-stat">
          <strong>{following.length}</strong>
          <span>팔로잉</span>
        </div>
        <div className="profile-stat">
          <strong>{hosted.length}</strong>
          <span>내가 연 모임</span>
        </div>
      </div>

      {following.length > 0 && (
        <section className="profile-section">
          <h3>팔로잉</h3>
          <div className="chip-list">
            {following.map((f) => (
              <span key={f} className="chip">
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="profile-section">
        <h3>참여한 모임</h3>
        {joined.length === 0 && <p className="muted">아직 참여한 모임이 없어요.</p>}
        <div className="profile-grid">
          {joined.map((m) => (
            <button key={m.id} className="profile-grid-item" onClick={() => onOpenMeetup(m.id)}>
              <span className="profile-grid-emoji">{m.hostAvatar || '📍'}</span>
              <span className="profile-grid-title">{m.title}</span>
            </button>
          ))}
        </div>
      </section>

      {waiting.length > 0 && (
        <section className="profile-section">
          <h3>대기중인 모임</h3>
          <div className="profile-grid">
            {waiting.map((m) => (
              <button key={m.id} className="profile-grid-item" onClick={() => onOpenMeetup(m.id)}>
                <span className="profile-grid-emoji">{m.hostAvatar || '📍'}</span>
                <span className="profile-grid-title">{m.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="profile-section">
        <h3>설정</h3>
        <div className="settings-list">
          <button className="settings-row" onClick={() => setPanel('notifications')}>
            <span>🔔 알림 설정</span>
            <span className="muted">›</span>
          </button>
          <button className="settings-row" onClick={() => setPanel('host')}>
            <span>🏪 {HOST_MENU_LABEL[hostStatus]}</span>
            <span className="muted">›</span>
          </button>
          <div className="settings-row">
            <span>💳 참가비 정산 안내</span>
            <span className="muted">›</span>
          </div>
          {isAdmin(currentUser) && (
            <button className="settings-row" onClick={() => setPanel('admin')}>
              <span>🛠 호스트 승인 관리</span>
              <span className="muted">›</span>
            </button>
          )}
          <button className="settings-row settings-row-danger" onClick={onLogout}>
            <span>🚪 로그아웃</span>
          </button>
        </div>
      </section>
    </div>
  );
}
