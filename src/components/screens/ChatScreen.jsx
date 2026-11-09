import { useEffect, useRef, useState } from 'react';
import { subscribeThreads, subscribeMessages, sendMessage } from '../../lib/dm';

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function DMConversation({ currentUser, otherUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => subscribeMessages(currentUser, otherUser, setMessages), [currentUser, otherUser]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(currentUser, otherUser, currentUser, text.trim());
    setText('');
  };

  return (
    <div className="dm-conversation">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>{otherUser}</strong>
      </div>
      <div className="dm-messages" ref={listRef}>
        {messages.length === 0 && <p className="muted dm-empty">{otherUser}님에게 첫 메시지를 보내보세요.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`dm-bubble-row ${m.sender === currentUser ? 'mine' : ''}`}>
            <div className="dm-bubble">{m.text}</div>
            <span className="dm-bubble-time">{formatTime(m.at)}</span>
          </div>
        ))}
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

export default function ChatScreen({ threads, onOpenMeetup, currentUser, dmTarget, onConsumeDmTarget }) {
  const [dmThreads, setDmThreads] = useState([]);
  const [openDmUser, setOpenDmUser] = useState(null);

  useEffect(() => subscribeThreads(currentUser, setDmThreads), [currentUser]);

  useEffect(() => {
    if (dmTarget) {
      setOpenDmUser(dmTarget);
      onConsumeDmTarget();
    }
  }, [dmTarget, onConsumeDmTarget]);

  if (openDmUser) {
    return (
      <div className="screen chat-screen">
        <DMConversation currentUser={currentUser} otherUser={openDmUser} onBack={() => setOpenDmUser(null)} />
      </div>
    );
  }

  return (
    <div className="screen chat-screen">
      <div className="screen-header">
        <h1>채팅</h1>
      </div>

      {dmThreads.length > 0 && (
        <>
          <p className="chat-section-title">다이렉트 메시지</p>
          <div className="chat-list">
            {dmThreads.map((t) => (
              <button key={t.id} className="chat-row" onClick={() => setOpenDmUser(t.otherUser)}>
                <span className="chat-avatar">👤</span>
                <div className="chat-row-text">
                  <div className="chat-row-top">
                    <strong>{t.otherUser}</strong>
                    {t.lastAt && <span className="chat-time">{formatTime(t.lastAt)}</span>}
                  </div>
                  <p className="chat-last-message">{t.lastMessage || '대화를 시작해보세요'}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="chat-section-title">모임 대화</p>
      <div className="chat-list">
        {threads.map((t) => (
          <button key={t.id} className="chat-row" onClick={() => onOpenMeetup(t.meetupId)}>
            <span className="chat-avatar">{t.avatar}</span>
            <div className="chat-row-text">
              <div className="chat-row-top">
                <strong>{t.title}</strong>
                <span className="chat-time">{t.time}</span>
              </div>
              <p className="chat-last-message">{t.lastMessage}</p>
            </div>
            {t.unread > 0 && <span className="chat-unread">{t.unread}</span>}
          </button>
        ))}

        {threads.length === 0 && dmThreads.length === 0 && (
          <div className="empty-state">
            <p className="empty-emoji">💬</p>
            <p>참여한 모임이 없어요.</p>
            <p className="muted">모임에 참여하거나 호스트에게 메시지를 보내면 여기에 표시돼요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
