import { useEffect, useRef, useState } from 'react';
import { subscribeMeetupMessages, sendMeetupMessage } from '../lib/meetupChat';
import {
  setDutchpay,
  clearDutchpay,
  markDutchpayPaid,
  markDutchpayUnpaid,
  createPoll,
  votePoll,
  closePoll,
  clearPoll,
} from '../lib/meetupsStore';
import { formatRecurrence, getNextOccurrence } from '../lib/recurrence';

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDateTime(d) {
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}(${day}) ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

function SchedulePanel({ meetup }) {
  const recurrenceLabel = formatRecurrence(meetup.recurrence);
  const nextDate = getNextOccurrence(meetup);
  return (
    <div className="chat-tool-panel">
      <h4>📅 일정</h4>
      <dl className="detail-info">
        <dt>{recurrenceLabel ? '다음 일정' : '일시'}</dt>
        <dd>{nextDate ? `${formatDateTime(nextDate)} (${meetup.durationMin}분)` : '종료됨'}</dd>
        {recurrenceLabel && (
          <>
            <dt>반복</dt>
            <dd>{recurrenceLabel}</dd>
          </>
        )}
        <dt>참여 조건</dt>
        <dd>{meetup.condition}</dd>
      </dl>
    </div>
  );
}

function LocationPanel({ meetup, currentUser }) {
  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(meetup.title)},${meetup.lat},${meetup.lng}`;

  const shareToChat = () => {
    sendMeetupMessage(meetup.id, currentUser, `📍 모임 장소: ${meetup.address}\n${mapUrl}`);
  };

  return (
    <div className="chat-tool-panel">
      <h4>📍 장소공유</h4>
      <p>{meetup.address}</p>
      <div className="chat-tool-actions">
        <a className="btn btn-secondary btn-small" href={mapUrl} target="_blank" rel="noreferrer">
          카카오맵에서 보기
        </a>
        <button className="btn btn-primary btn-small" onClick={shareToChat}>
          채팅방에 공유
        </button>
      </div>
    </div>
  );
}

function DutchpayPanel({ meetup, currentUser }) {
  const [total, setTotal] = useState('');
  const [note, setNote] = useState('');
  const [kakaoPayLink, setKakaoPayLink] = useState('');
  const dutchpay = meetup.dutchpay;
  const memberCount = Math.max(1, meetup.participants.length);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(total);
    if (!amount || amount <= 0) return;
    setDutchpay(meetup.id, { total: amount, note, kakaoPayLink: kakaoPayLink.trim(), updatedBy: currentUser });
    setTotal('');
    setNote('');
    setKakaoPayLink('');
  };

  if (dutchpay) {
    const perPerson = Math.ceil(dutchpay.total / memberCount);
    const paidBy = dutchpay.paidBy || [];
    const iPaid = paidBy.includes(currentUser);
    const members = meetup.participants.length ? meetup.participants : [meetup.hostName];

    return (
      <div className="chat-tool-panel">
        <h4>💰 더치페이</h4>
        <p className="dutchpay-total">총 {dutchpay.total.toLocaleString()}원</p>
        <p>
          참여자 {memberCount}명 ÷ 1인당 <strong>{perPerson.toLocaleString()}원</strong>
        </p>
        {dutchpay.note && <p className="muted">메모: {dutchpay.note}</p>}
        <p className="muted">{dutchpay.updatedBy}님이 등록</p>

        {dutchpay.kakaoPayLink && (
          <a
            className="btn btn-block btn-small btn-kakaopay"
            href={dutchpay.kakaoPayLink}
            target="_blank"
            rel="noreferrer"
          >
            💛 카카오페이로 {perPerson.toLocaleString()}원 송금하기
          </a>
        )}

        <button
          className={`btn btn-small btn-block ${iPaid ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() =>
            iPaid ? markDutchpayUnpaid(meetup.id, currentUser) : markDutchpayPaid(meetup.id, currentUser)
          }
        >
          {iPaid ? '✓ 정산 완료함 (취소하기)' : '정산 완료로 표시'}
        </button>

        <ul className="dutchpay-status-list">
          {members.map((name) => (
            <li key={name} className={paidBy.includes(name) ? 'paid' : ''}>
              <span>{name}</span>
              <span>{paidBy.includes(name) ? '✓ 완료' : '대기중'}</span>
            </li>
          ))}
        </ul>
        <p className="muted">
          {paidBy.length} / {members.length}명 정산 완료
        </p>

        <button className="btn btn-secondary btn-small" onClick={() => clearDutchpay(meetup.id)}>
          정산 삭제
        </button>
      </div>
    );
  }

  return (
    <div className="chat-tool-panel">
      <h4>💰 더치페이</h4>
      <form onSubmit={handleSubmit} className="dutchpay-form">
        <input
          type="number"
          min={1}
          placeholder="총 금액"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
        />
        <input placeholder="메모 (선택)" value={note} onChange={(e) => setNote(e.target.value)} />
        <input
          placeholder="카카오페이 송금 링크 (선택 — 카카오페이 앱에서 발급)"
          value={kakaoPayLink}
          onChange={(e) => setKakaoPayLink(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-small">
          정산 등록
        </button>
      </form>
    </div>
  );
}

function PollPanel({ meetup, currentUser }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const poll = meetup.poll;

  const updateOption = (i, value) => setOptions((o) => o.map((v, idx) => (idx === i ? value : v)));
  const addOption = () => options.length < 4 && setOptions((o) => [...o, '']);

  const handleCreate = (e) => {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) return;
    createPoll(meetup.id, { question: question.trim(), options: cleaned, createdBy: currentUser });
    setQuestion('');
    setOptions(['', '']);
  };

  if (poll) {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0) || 1;
    const myVote = poll.options.findIndex((o) => o.votes.includes(currentUser));
    return (
      <div className="chat-tool-panel">
        <h4>🗳 투표</h4>
        <p className="poll-question">{poll.question}</p>
        {poll.options.map((opt, i) => {
          const pct = Math.round((opt.votes.length / totalVotes) * 100);
          return (
            <button
              key={i}
              className={`poll-option ${myVote === i ? 'voted' : ''}`}
              disabled={!poll.open}
              onClick={() => votePoll(meetup.id, meetup, i, currentUser)}
            >
              <span className="poll-option-bar" style={{ width: `${pct}%` }} />
              <span className="poll-option-label">{opt.text}</span>
              <span className="poll-option-count">{opt.votes.length}표 ({pct}%)</span>
            </button>
          );
        })}
        {!poll.open && <p className="muted">투표가 종료됐어요.</p>}
        <div className="chat-tool-actions">
          {poll.open && (
            <button className="btn btn-secondary btn-small" onClick={() => closePoll(meetup.id)}>
              투표 종료
            </button>
          )}
          <button className="btn btn-danger btn-small" onClick={() => clearPoll(meetup.id)}>
            투표 삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-tool-panel">
      <h4>🗳 투표 만들기</h4>
      <form onSubmit={handleCreate} className="poll-form">
        <input placeholder="질문 (예: 다음 모임 요일은?)" value={question} onChange={(e) => setQuestion(e.target.value)} />
        {options.map((o, i) => (
          <input
            key={i}
            placeholder={`항목 ${i + 1}`}
            value={o}
            onChange={(e) => updateOption(i, e.target.value)}
          />
        ))}
        {options.length < 4 && (
          <button type="button" className="btn btn-secondary btn-small" onClick={addOption}>
            + 항목 추가
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-small">
          투표 만들기
        </button>
      </form>
    </div>
  );
}

export default function MeetupChatRoom({ meetup, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [tool, setTool] = useState(null); // 'schedule' | 'location' | 'dutchpay' | 'poll' | null
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
  const toggleTool = (name) => setTool((t) => (t === name ? null : name));

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

      <div className="chat-toolbar">
        <button className={`chat-tool-btn ${tool === 'schedule' ? 'active' : ''}`} onClick={() => toggleTool('schedule')}>
          📅 일정
        </button>
        <button className={`chat-tool-btn ${tool === 'location' ? 'active' : ''}`} onClick={() => toggleTool('location')}>
          📍 장소공유
        </button>
        <button className={`chat-tool-btn ${tool === 'dutchpay' ? 'active' : ''}`} onClick={() => toggleTool('dutchpay')}>
          💰 더치페이
        </button>
        <button className={`chat-tool-btn ${tool === 'poll' ? 'active' : ''}`} onClick={() => toggleTool('poll')}>
          🗳 투표
        </button>
      </div>

      {tool === 'schedule' && <SchedulePanel meetup={meetup} />}
      {tool === 'location' && <LocationPanel meetup={meetup} currentUser={currentUser} />}
      {tool === 'dutchpay' && <DutchpayPanel meetup={meetup} currentUser={currentUser} />}
      {tool === 'poll' && <PollPanel meetup={meetup} currentUser={currentUser} />}

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
