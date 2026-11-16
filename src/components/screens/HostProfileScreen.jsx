import { useEffect, useState } from 'react';
import { subscribeHostReviews, addHostReview } from '../../lib/hostReviews';
import { formatRecurrence } from '../../lib/recurrence';

function Stars({ value, onChange }) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= value ? 'filled' : ''}`}
          onClick={() => onChange?.(n)}
          disabled={!onChange}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function HostProfileScreen({ hostName, meetups, currentUser, onBack, onOpenMeetup }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [selectedMeetupId, setSelectedMeetupId] = useState('');

  useEffect(() => subscribeHostReviews(hostName, setReviews), [hostName]);

  const hostedMeetups = meetups.filter((m) => m.hostName === hostName);
  const reviewableMeetups = hostedMeetups.filter(
    (m) => m.participants.includes(currentUser) && !reviews.some((r) => r.meetupId === m.id && r.authorName === currentUser)
  );
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const meetup = hostedMeetups.find((m) => m.id === selectedMeetupId) || reviewableMeetups[0];
    if (!meetup) return;
    await addHostReview({
      hostName,
      meetupId: meetup.id,
      meetupTitle: meetup.title,
      authorName: currentUser,
      rating,
      text: text.trim(),
    });
    setText('');
    setRating(5);
    setSelectedMeetupId('');
  };

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>{hostName}님의 호스트 프로필</strong>
      </div>

      <div className="host-profile-summary">
        <h2>{hostName}</h2>
        {reviews.length > 0 ? (
          <p>
            <Stars value={Math.round(avgRating)} /> {avgRating.toFixed(1)} ({reviews.length}개 후기)
          </p>
        ) : (
          <p className="muted">아직 후기가 없어요.</p>
        )}
      </div>

      <section className="profile-section">
        <h3>연 팝미팅 ({hostedMeetups.length})</h3>
        {hostedMeetups.length === 0 && <p className="muted">아직 연 모임이 없어요.</p>}
        <div className="profile-grid">
          {hostedMeetups.map((m) => (
            <button key={m.id} className="profile-grid-item" onClick={() => onOpenMeetup(m.id)}>
              <span className="profile-grid-emoji">{m.hostAvatar || '📍'}</span>
              <span className="profile-grid-title">{m.title}</span>
              {formatRecurrence(m.recurrence) && <span className="muted">🔁 {formatRecurrence(m.recurrence)}</span>}
            </button>
          ))}
        </div>
      </section>

      {reviewableMeetups.length > 0 && (
        <section className="profile-section">
          <h3>후기 남기기</h3>
          <form className="review-form" onSubmit={handleSubmitReview}>
            {reviewableMeetups.length > 1 && (
              <select value={selectedMeetupId} onChange={(e) => setSelectedMeetupId(e.target.value)}>
                {reviewableMeetups.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}
            <Stars value={rating} onChange={setRating} />
            <textarea
              placeholder="호스트는 어땠나요?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn btn-primary btn-block btn-small">
              후기 등록
            </button>
          </form>
        </section>
      )}

      <section className="profile-section">
        <h3>후기 ({reviews.length})</h3>
        {reviews.length === 0 && <p className="muted">아직 후기가 없어요.</p>}
        <div className="review-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-card-head">
                <strong>{r.authorName}</strong>
                <Stars value={r.rating} />
              </div>
              <p className="muted">{r.meetupTitle}</p>
              {r.text && <p>{r.text}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
