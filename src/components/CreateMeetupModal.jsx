import { useState } from 'react';
import { CATEGORIES } from '../data/meetups';
import { WEEKDAY_LABELS, FREQUENCY_OPTIONS, END_TYPE_OPTIONS } from '../lib/recurrence';

const EMPTY_FORM = {
  title: '',
  category: 'food',
  hostName: '',
  isBusiness: false,
  address: '',
  description: '',
  date: '',
  time: '',
  durationMin: 60,
  capacity: 6,
  condition: '',
  price: '무료',
};

const EMPTY_RECURRENCE = {
  enabled: false,
  frequency: 'weekly',
  weekdays: [],
  endType: 'never',
  endCount: 4,
  endDate: '',
};

export default function CreateMeetupModal({ pickedLocation, onPickLocation, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [recurrence, setRecurrence] = useState(EMPTY_RECURRENCE);
  const [error, setError] = useState('');

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateRecurrence = (patch) => setRecurrence((r) => ({ ...r, ...patch }));

  const toggleWeekday = (day) => {
    setRecurrence((r) => ({
      ...r,
      weekdays: r.weekdays.includes(day) ? r.weekdays.filter((d) => d !== day) : [...r.weekdays, day].sort(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.hostName.trim() || !form.address.trim()) {
      setError('모임 이름, 호스트 이름, 주소는 필수예요.');
      return;
    }
    if (!pickedLocation) {
      setError('지도를 클릭해서 모임 위치를 지정해주세요.');
      return;
    }
    if (!form.date || !form.time) {
      setError('모임 날짜와 시간을 입력해주세요.');
      return;
    }
    if (recurrence.enabled && recurrence.frequency !== 'monthly' && recurrence.weekdays.length === 0) {
      setError('정기모임 반복 요일을 하나 이상 선택해주세요.');
      return;
    }
    if (recurrence.enabled && recurrence.endType === 'date' && !recurrence.endDate) {
      setError('정기모임 종료일을 입력해주세요.');
      return;
    }
    const startAt = `${form.date}T${form.time}:00`;

    onSubmit({
      title: form.title.trim(),
      category: form.category,
      hostName: form.hostName.trim(),
      isBusiness: form.isBusiness,
      address: form.address.trim(),
      lat: pickedLocation.lat,
      lng: pickedLocation.lng,
      description: form.description.trim(),
      startAt,
      durationMin: Number(form.durationMin) || 60,
      capacity: Math.max(1, Number(form.capacity) || 1),
      condition: form.condition.trim() || '누구나 참여 가능',
      price: form.price.trim() || '무료',
      recurrence: recurrence.enabled
        ? {
            enabled: true,
            frequency: recurrence.frequency,
            weekdays: recurrence.frequency === 'monthly' ? [] : recurrence.weekdays,
            endType: recurrence.endType,
            endCount: Number(recurrence.endCount) || 1,
            endDate: recurrence.endDate,
          }
        : { enabled: false },
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal create-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>새 모임 만들기</h2>
          <button type="button" className="detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <label>
          모임 이름
          <input value={form.title} onChange={update('title')} placeholder="예) 동네 북카페 독서모임" />
        </label>

        <div className="form-row">
          <label>
            카테고리
            <select value={form.category} onChange={update('category')}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            호스트 이름
            <input value={form.hostName} onChange={update('hostName')} placeholder="가게 이름 또는 닉네임" />
          </label>
        </div>

        <label className="checkbox-label">
          <input type="checkbox" checked={form.isBusiness} onChange={update('isBusiness')} />
          스몰비즈니스(가게/공방 등)로 모임을 엽니다
        </label>

        <label>
          주소
          <input value={form.address} onChange={update('address')} placeholder="예) 서울 마포구 망원동 ..." />
        </label>

        <label>
          지도에서 위치 지정
          <button type="button" className="btn btn-secondary btn-block" onClick={onPickLocation}>
            {pickedLocation ? '✅ 위치 지정됨 · 다시 지정하려면 클릭' : '📍 지도에서 위치 클릭하기'}
          </button>
        </label>

        <label>
          모임 소개
          <textarea
            value={form.description}
            onChange={update('description')}
            placeholder="모임의 목적과 진행 내용을 자유롭게 작성해주세요."
            rows={4}
          />
        </label>

        <div className="form-row">
          <label>
            날짜
            <input type="date" value={form.date} onChange={update('date')} />
          </label>
          <label>
            시간
            <input type="time" value={form.time} onChange={update('time')} />
          </label>
          <label>
            소요시간(분)
            <input type="number" min={10} step={10} value={form.durationMin} onChange={update('durationMin')} />
          </label>
        </div>

        <div className="form-row">
          <label>
            모집 인원
            <input type="number" min={1} value={form.capacity} onChange={update('capacity')} />
          </label>
          <label>
            참가비
            <input value={form.price} onChange={update('price')} placeholder="무료 / 10,000원 등" />
          </label>
        </div>

        <label>
          참여 조건
          <input
            value={form.condition}
            onChange={update('condition')}
            placeholder="예) 성인 누구나, 반려견 동반 가능 등"
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={recurrence.enabled}
            onChange={(e) => updateRecurrence({ enabled: e.target.checked })}
          />
          🔁 정기모임으로 설정 (반복되는 모임이에요)
        </label>

        {recurrence.enabled && (
          <div className="recurrence-box">
            <label>
              반복 주기
              <select value={recurrence.frequency} onChange={(e) => updateRecurrence({ frequency: e.target.value })}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            {recurrence.frequency !== 'monthly' && (
              <div className="weekday-picker">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    type="button"
                    key={label}
                    className={`weekday-chip ${recurrence.weekdays.includes(i) ? 'active' : ''}`}
                    onClick={() => toggleWeekday(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <label>
              종료 조건
              <select value={recurrence.endType} onChange={(e) => updateRecurrence({ endType: e.target.value })}>
                {END_TYPE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {recurrence.endType === 'count' && (
              <label>
                반복 횟수
                <input
                  type="number"
                  min={1}
                  value={recurrence.endCount}
                  onChange={(e) => updateRecurrence({ endCount: e.target.value })}
                />
              </label>
            )}
            {recurrence.endType === 'date' && (
              <label>
                종료일
                <input
                  type="date"
                  value={recurrence.endDate}
                  onChange={(e) => updateRecurrence({ endDate: e.target.value })}
                />
              </label>
            )}
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            모임 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}
