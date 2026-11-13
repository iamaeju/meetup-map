import { markDutchpayPaid, markDutchpayUnpaid } from '../../lib/meetupsStore';

export default function DutchpaySettlementScreen({ meetups, currentUser, onOpenMeetupChat, onBack }) {
  const myMeetups = meetups.filter(
    (m) => m.participants.includes(currentUser) || m.hostName === currentUser
  );
  const withDutchpay = myMeetups.filter((m) => m.dutchpay);

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>참가비 정산</strong>
      </div>

      {withDutchpay.length === 0 && (
        <p className="muted" style={{ padding: '16px 18px' }}>
          진행 중인 모임의 채팅방에서 💰 더치페이를 등록하면 여기서 한눈에 정산 현황을 볼 수 있어요.
        </p>
      )}

      <div className="settlement-list">
        {withDutchpay.map((m) => {
          const dutchpay = m.dutchpay;
          const members = m.participants.length ? m.participants : [m.hostName];
          const perPerson = Math.ceil(dutchpay.total / Math.max(1, members.length));
          const paidBy = dutchpay.paidBy || [];
          const iPaid = paidBy.includes(currentUser);

          return (
            <div key={m.id} className="settlement-card">
              <button className="settlement-card-head" onClick={() => onOpenMeetupChat(m.id)}>
                <span className="settlement-card-title">{m.title}</span>
                <span className="muted">채팅방 열기 ›</span>
              </button>
              <p className="dutchpay-total">총 {dutchpay.total.toLocaleString()}원</p>
              <p>
                1인당 <strong>{perPerson.toLocaleString()}원</strong> · {paidBy.length}/{members.length}명 완료
              </p>
              {dutchpay.note && <p className="muted">메모: {dutchpay.note}</p>}
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
                  iPaid ? markDutchpayUnpaid(m.id, currentUser) : markDutchpayPaid(m.id, currentUser)
                }
              >
                {iPaid ? '✓ 정산 완료함 (취소하기)' : `${perPerson.toLocaleString()}원 정산 완료로 표시`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
