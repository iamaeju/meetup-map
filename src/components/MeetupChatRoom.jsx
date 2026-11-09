import { useEffect, useRef, useState } from 'react';
import { subscribeMeetupMessages, sendMeetupMessage } from '../lib/meetupChat';

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function MeetupChatRoom({ meetup, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => subscribeMeetupMessages(meetup.id, setMessages), [meetup.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMeetupMessage(meetup.id, currentUser, text.trim());
    setText('');
  };

  const memberCount = meetup.participants.length;

  return (
    <div className="meetup-chat-room">
      <div className="dm-header">
        <button className="detail-close" onClick={onClose}>
          ‹
        </button>
        <div className="meetup-chat-head-text">
          <strong>{meetup.title}</strong>
          <span className="muted">참여자 {memberCount}명</span>
        </div>
      </div>

      <div className="dm-messages" ref={listRef}>
        {messages.length === 0 && <p className="muted dm-empty">아직 대화가 없어요. 첫 메시지를 보내보세요.</p>}
        {messages.map((m, i) => {
          const mine = m.sender === currentUser;
          return (
            <div key={i} className={`dm-bubble-row ${mine ? 'mine' : ''}`}>
              {!mine && <span className="meetup-chat-sender">{m.sender}</span>}
              <div className="dm-bubble">{m.text}</div>
              <span className="dm-bubble-time">{formatTime(m.at)}</span>
            </div>
          );
        })}
      </div>

      <form className="dm-input-row" onSubmit={handleSend}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지 보내기..." />
        <button type="submit" className="btn btn-primary btn-small">
          전송
        </button>
      </form>
    </div>
  );
}
