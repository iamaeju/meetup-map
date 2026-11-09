import { useState } from 'react';
import { feedPosts } from '../../data/meetups';
import BrandLogo from '../BrandLogo';

const STACK_LIMIT = 4;

function ParticipantStack({ meetup, currentUser, onOpenMeetup }) {
  if (!meetup) return null;
  const participants = meetup.participants;
  if (participants.length === 0) return null;

  const shown = participants.slice(0, STACK_LIMIT);
  const extra = participants.length - shown.length;
  const iJoined = participants.includes(currentUser);

  return (
    <button className="feed-participants" onClick={() => onOpenMeetup(meetup.id)}>
      <span className="feed-avatar-stack">
        {shown.map((p, i) => (
          <span key={p + i} className="feed-mini-avatar" style={{ zIndex: shown.length - i }}>
            {p.slice(0, 1)}
          </span>
        ))}
      </span>
      <span className="feed-participants-text">
        {iJoined && participants.length === 1
          ? '나 참여중'
          : iJoined
          ? `나 외 ${participants.length - 1}명 참여중`
          : `${participants.length}명 참여중`}
        {extra > 0 ? ` (+${extra})` : ''}
      </span>
    </button>
  );
}

export default function FeedScreen({ meetups, onOpenMeetup, currentUser, following = [], onToggleFollow, onStartDM }) {
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="screen feed-screen">
      <div className="screen-header feed-header">
        <h1><BrandLogo /></h1>
      </div>

      <div className="feed-list">
        {feedPosts.map((post) => {
          const meetup = meetups.find((m) => String(m.id) === String(post.meetupId));
          const isFollowing = following.includes(post.author);
          const isOwn = post.author === currentUser;
          return (
            <article key={post.id} className="feed-post">
              <div className="feed-post-head">
                <span className="feed-avatar">{post.avatar}</span>
                <div className="feed-post-head-text">
                  <strong>{post.author}</strong>
                  <span className="muted">{post.timeAgo}</span>
                </div>
                {!isOwn && (
                  <button
                    className={`feed-follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={() => onToggleFollow(post.author)}
                  >
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                )}
                {meetup && (
                  <button className="feed-visit-btn" onClick={() => onOpenMeetup(meetup.id)}>
                    모임 보기
                  </button>
                )}
              </div>

              <div className="feed-image" style={{ background: post.image }} />

              <div className="feed-post-actions">
                <button
                  className={`feed-like-btn ${liked[post.id] ? 'liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  {liked[post.id] ? '💚' : '🤍'}
                </button>
                <span className="muted">💬 {post.comments}</span>
                {!isOwn && (
                  <button className="feed-dm-btn" onClick={() => onStartDM(post.author)}>
                    ✉️ 메시지
                  </button>
                )}
              </div>

              <p className="feed-likes">좋아요 {post.likes + (liked[post.id] ? 1 : 0)}개</p>

              <ParticipantStack meetup={meetup} currentUser={currentUser} onOpenMeetup={onOpenMeetup} />

              <p className="feed-caption">
                <strong>{post.author}</strong> {post.caption}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
