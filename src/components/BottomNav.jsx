const TABS = [
  { id: 'home', label: '홈' },
  { id: 'list', label: '모임' },
  { id: 'feed', label: '피드' },
  { id: 'chat', label: '채팅' },
  { id: 'profile', label: '프로필' },
];

// bar.jpg 원본 비율(2411x576)을 그대로 유지한 채 5등분으로 잘라서 사용
const SPRITE_W = 2411;
const SPRITE_H = 576;
const ICON_H = 24;
const SPRITE_SCALE = ICON_H / SPRITE_H;
const SCALED_W = SPRITE_W * SPRITE_SCALE;
const CELL_W = SCALED_W / TABS.length;

export default function BottomNav({ active, onChange, badges = {}, profileImage }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab, index) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="nav-icon">
              {tab.id === 'profile' && profileImage ? (
                <span className={`nav-avatar ${isActive ? 'active' : ''}`}>
                  <img src={profileImage} alt="프로필" />
                </span>
              ) : (
                <span
                  className={`nav-icon-sprite ${isActive ? 'active' : ''}`}
                  style={{
                    width: `${CELL_W}px`,
                    height: `${ICON_H}px`,
                    backgroundSize: `${SCALED_W}px ${ICON_H}px`,
                    backgroundPosition: `-${index * CELL_W}px 0`,
                  }}
                />
              )}
              {badges[tab.id] > 0 && <span className="nav-badge">{badges[tab.id]}</span>}
            </span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
