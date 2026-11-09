// 카카오맵 키가 없을 때 쓰는 대체 지도 (좌표를 박스 안에 상대 위치로 표시)
const BOUNDS = { minLat: 37.53, maxLat: 37.58, minLng: 126.89, maxLng: 127.05 };

function toPercent(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(96, Math.max(4, y)) };
}

export default function FallbackMap({ meetups, selectedId, onSelect, pickMode, pickedLocation, onPick }) {
  const handleClick = (e) => {
    if (!pickMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    const lng = BOUNDS.minLng + xPct * (BOUNDS.maxLng - BOUNDS.minLng);
    const lat = BOUNDS.maxLat - yPct * (BOUNDS.maxLat - BOUNDS.minLat);
    onPick?.({ lat, lng });
  };

  return (
    <div
      className={`fallback-map ${pickMode ? 'pick-mode' : ''}`}
      onClick={handleClick}
      title={pickMode ? '지도를 클릭해 모임 위치를 지정하세요' : ''}
    >
      <div className="fallback-map-badge">카카오맵 키 미설정 · 임시 지도</div>
      {meetups.map((m) => {
        const { x, y } = toPercent(m.lat, m.lng);
        return (
          <button
            key={m.id}
            className={`map-pin ${m.status === 'full' ? 'pin-full' : ''} ${
              selectedId === m.id ? 'pin-selected' : ''
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(m.id);
            }}
            title={m.title}
          >
            📍
          </button>
        );
      })}
      {pickedLocation && (
        <div
          className="map-pin pin-picking"
          style={(() => {
            const { x, y } = toPercent(pickedLocation.lat, pickedLocation.lng);
            return { left: `${x}%`, top: `${y}%` };
          })()}
        >
          🧭
        </div>
      )}
    </div>
  );
}
