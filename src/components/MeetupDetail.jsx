import { CATEGORIES } from '../data/meetups';
import { formatRecurrence, getNextOccurrence } from '../lib/recurrence';

function formatDateTime(d) {
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}(${day}) ${hh}:${mm}`;
}

export default function MeetupDetail({
  meetup,
  currentUser,
  following = [],
  onToggleFollow,
  onStartDM,
  onOpenChat,
  onClose,
  onJoin,
  onLeave,
  onWaitlist,
  onLeaveWaitlist,
}) {
  if (!meetup) return null;
  const cat = CATEGORIES.find((c) => c.id === meetup.category);
  const joined = meetup.participants.length;
  const isFull = joined >= meetup.capacity;
  const isParticipant = meetup.participants.includes(currentUser);
  const isWaiting = meetup.waitlist.includes(currentUser);
  const isFollowing = following.includes(meetup.hostName);
  const isOwnHost = meetup.hostName === currentUser;
  const recurrenceLabel = formatRecurrence(meetup.recurrence);
  const nextDate = getNextOccurrence(meetup);

  return (
    <div className="detail-panel">
      <button className="detail-close" onClick={onClose}>
        ✕
      </button>
      <div className="meetup-card-top">
        <span className="badge badge-cat">{cat?.label ?? meetup.category}</span>
        {meetup.isBusiness && <span className="badge badge-biz">스몰비즈니스</span>}
        {recurrenceLabel && <span className="badge badge-recurring">🔁 {recurrenceLabel}</span>}
      </div>
      <h2>{meetup.title}</h2>
      <div className="detail-host-row">
        <p className="detail-host">
          호스트 · <strong>{meetup.hostName}</strong>
        </p>
        {!isOwnHost && (
          <div className="detail-host-actions">
            <button
              className={`btn btn-small ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => onToggleFollow(meetup.hostName)}
            >
              {isFollowing ? '팔로잉' : '팔로우'}
            </button>
            <button className="btn btn-secondary btn-small" onClick={() => onStartDM(meetup.hostName)}>
              메시지
            </button>
          </div>
        )}
      </div>

      <p className="detail-desc">{meetup.description}</p>

      {meetup.photos?.length > 0 && (
        <div className="detail-photos">
          <h4>호스트가 올린 사진</h4>
          <div className="detail-photo-scroll">
            {meetup.photos.map((bg, i) => (
              <div key={i} className="detail-photo" style={{ background: bg }} />
            ))}
          </div>
        </div>
      )}

      <dl className="detail-info">
        <dt>🕒 {recurrenceLabel ? '다음 일정' : '일시'}</dt>
        <dd>
          {nextDate ? `${formatDateTime(nextDate)} (${meetup.durationMin}분)` : '반복 일정이 종료됐어요'}
        </dd>
        {recurrenceLabel && (
          <>
            <dt>🔁 반복</dt>
            <dd>{recurrenceLabel}</dd>
          </>
        )}
        <dt>📍 장소</dt>
        <dd>{meetup.address}</dd>
        <dt>👥 정원</dt>
        <dd>
          {joined}/{meetup.capacity}명 참여 {meetup.waitlist.length > 0 && `· 대기 ${meetup.waitlist.length}명`}
        </dd>
        <dt>✅ 참여 조건</dt>
        <dd>{meetup.condition}</dd>
        <dt>💰 참가비</dt>
        <dd>{meetup.price}</dd>
      </dl>

      {isParticipant && (
        <button className="btn btn-secondary btn-block meetup-chat-entry" onClick={() => onOpenChat(meetup.id)}>
          💬 모임 채팅방 입장
        </button>
      )}

      <div className="detail-actions">
        {isParticipant ? (
          <button className="btn btn-danger" onClick={() => onLeave(meetup.id)}>
            참여 취소하기
          </button>
        ) : isWaiting ? (
          <button className="btn btn-danger" onClick={() => onLeaveWaitlist(meetup.id)}>
            대기 취소하기
          </button>
        ) : isFull ? (
          <button className="btn btn-secondary" onClick={() => onWaitlist(meetup.id)}>
            대기 걸기
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => onJoin(meetup.id)}>
            참여하기
          </button>
        )}
      </div>

      <div className="detail-participants">
        <h4>참여자</h4>
        <div className="chip-list">
          {meetup.participants.map((p) => (
            <span key={p} className="chip">
              {p}
            </span>
          ))}
          {meetup.participants.length === 0 && <span className="muted">아직 없어요</span>}
        </div>
        {meetup.waitlist.length > 0 && (
          <>
            <h4>대기자</h4>
            <div className="chip-list">
              {meetup.waitlist.map((p) => (
                <span key={p} className="chip chip-wait">
                  {p}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
