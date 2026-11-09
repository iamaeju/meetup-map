import { CATEGORIES } from '../data/meetups';
import { formatRecurrence, getNextOccurrence } from '../lib/recurrence';

function formatDateTime(d) {
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()}(${day}) ${hh}:${mm}`;
}

export default function MeetupCard({ meetup, onClick, active }) {
  const cat = CATEGORIES.find((c) => c.id === meetup.category);
  const joined = meetup.participants.length;
  const isFull = joined >= meetup.capacity;
  const recurrenceLabel = formatRecurrence(meetup.recurrence);
  const nextDate = getNextOccurrence(meetup);

  return (
    <div className={`meetup-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="meetup-card-top">
        <span className="badge badge-cat">{cat?.label ?? meetup.category}</span>
        {meetup.isBusiness && <span className="badge badge-biz">스몰비즈니스</span>}
        {recurrenceLabel && <span className="badge badge-recurring">🔁 {recurrenceLabel}</span>}
        {isFull ? (
          <span className="badge badge-full">마감 · 대기 {meetup.waitlist.length}</span>
        ) : (
          <span className="badge badge-open">모집중</span>
        )}
      </div>
      <h3>{meetup.title}</h3>
      <div className="meetup-card-meta">
        <span>🧑‍🤝‍🧑 {meetup.hostName}</span>
        <span>🕒 {nextDate ? `${recurrenceLabel ? '다음 ' : ''}${formatDateTime(nextDate)}` : '종료됨'}</span>
      </div>
      <div className="meetup-card-meta">
        <span>📍 {meetup.address}</span>
      </div>
      <div className="meetup-card-foot">
        <div className="capacity-bar">
          <div
            className="capacity-fill"
            style={{ width: `${Math.min(100, (joined / meetup.capacity) * 100)}%` }}
          />
        </div>
        <span className="capacity-text">
          {joined}/{meetup.capacity}명
        </span>
      </div>
    </div>
  );
}
