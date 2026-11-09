import { useState } from 'react';

const SOUND_OPTIONS = [
  { id: 'default', label: '기본음' },
  { id: 'chime', label: '차임벨' },
  { id: 'pop', label: '팝' },
  { id: 'none', label: '무음(진동만)' },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export default function NotificationSettingsScreen({ settings, onChange, onBack }) {
  const [keywordInput, setKeywordInput] = useState('');

  const update = (patch) => onChange({ ...settings, ...patch });

  const addKeyword = (e) => {
    e.preventDefault();
    const kw = keywordInput.trim();
    if (!kw || settings.keywords.includes(kw)) return;
    update({ keywords: [...settings.keywords, kw] });
    setKeywordInput('');
  };

  const removeKeyword = (kw) => update({ keywords: settings.keywords.filter((k) => k !== kw) });

  const allOff = !settings.all;

  return (
    <div className="screen settings-screen">
      <div className="dm-header">
        <button className="detail-close" onClick={onBack}>
          ‹
        </button>
        <strong>알림 설정</strong>
      </div>

      <div className="settings-detail-body">
        <section className="profile-section">
          <div className="settings-toggle-row">
            <div>
              <p className="settings-toggle-title">전체 알림</p>
              <p className="muted">모든 알림을 한 번에 켜거나 꺼요.</p>
            </div>
            <Toggle checked={settings.all} onChange={(v) => update({ all: v })} />
          </div>
        </section>

        <section className="profile-section">
          <h3>알림 종류</h3>
          <div className="settings-toggle-row">
            <p className="settings-toggle-title">채팅 알림</p>
            <Toggle checked={settings.chat} onChange={(v) => update({ chat: v })} disabled={allOff} />
          </div>
          <div className="settings-toggle-row">
            <p className="settings-toggle-title">모임 소식 알림</p>
            <Toggle checked={settings.meetup} onChange={(v) => update({ meetup: v })} disabled={allOff} />
          </div>
          <div className="settings-toggle-row">
            <p className="settings-toggle-title">팔로우 · 좋아요 알림</p>
            <Toggle checked={settings.social} onChange={(v) => update({ social: v })} disabled={allOff} />
          </div>
        </section>

        <section className="profile-section">
          <div className="settings-toggle-row">
            <div>
              <p className="settings-toggle-title">키워드 알림</p>
              <p className="muted">등록한 단어가 모임 제목에 포함되면 알려드려요.</p>
            </div>
            <Toggle
              checked={settings.keywordsEnabled}
              onChange={(v) => update({ keywordsEnabled: v })}
              disabled={allOff}
            />
          </div>
          {settings.keywordsEnabled && (
            <>
              <form className="keyword-add-row" onSubmit={addKeyword}>
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="예) 러닝, 독서모임, 와인"
                />
                <button type="submit" className="btn btn-secondary btn-small">
                  추가
                </button>
              </form>
              <div className="chip-list">
                {settings.keywords.map((kw) => (
                  <span key={kw} className="chip chip-removable">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)}>
                      ✕
                    </button>
                  </span>
                ))}
                {settings.keywords.length === 0 && <span className="muted">등록된 키워드가 없어요.</span>}
              </div>
            </>
          )}
        </section>

        <section className="profile-section">
          <h3>알림음</h3>
          <div className="settings-toggle-row">
            <p className="settings-toggle-title">소리로 알림</p>
            <Toggle checked={settings.sound} onChange={(v) => update({ sound: v })} disabled={allOff} />
          </div>
          {settings.sound && (
            <select
              className="filter-select"
              value={settings.soundType}
              onChange={(e) => update({ soundType: e.target.value })}
              disabled={allOff}
            >
              {SOUND_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </section>
      </div>
    </div>
  );
}
