import { useEffect, useRef } from 'react';

const DEFAULT_CENTER = { lat: 37.5563, lng: 126.9254 };

export default function KakaoMap({ meetups, selectedId, onSelect, pickMode, pickedLocation, onPick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const pickMarkerRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: 6,
    });
    mapRef.current = map;

    const clickListener = kakao.maps.event.addListener(map, 'click', (e) => {
      if (!pickModeRef.current) return;
      onPickRef.current?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() });
    });

    return () => {
      kakao.maps.event.removeListener(map, 'click', clickListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pickMode/onPick 최신값을 ref로 들고 있어서 클릭 리스너를 매번 재등록하지 않도록 함
  const pickModeRef = useRef(pickMode);
  const onPickRef = useRef(onPick);
  useEffect(() => {
    pickModeRef.current = pickMode;
    onPickRef.current = onPick;
  }, [pickMode, onPick]);

  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((mk) => mk.setMap(null));
    markersRef.current = [];

    meetups.forEach((m) => {
      const position = new kakao.maps.LatLng(m.lat, m.lng);
      const content = document.createElement('div');
      content.className = `kakao-pin ${m.status === 'full' ? 'pin-full' : ''} ${
        selectedId === m.id ? 'pin-selected' : ''
      }`;
      content.textContent = '📍';
      content.title = m.title;
      content.onclick = () => onSelect(m.id);

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1,
      });
      overlay.setMap(map);
      markersRef.current.push(overlay);
    });
  }, [meetups, selectedId, onSelect]);

  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    if (pickMarkerRef.current) {
      pickMarkerRef.current.setMap(null);
      pickMarkerRef.current = null;
    }
    if (pickedLocation) {
      const content = document.createElement('div');
      content.className = 'kakao-pin pin-picking';
      content.textContent = '🧭';
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(pickedLocation.lat, pickedLocation.lng),
        content,
        yAnchor: 1,
      });
      overlay.setMap(map);
      pickMarkerRef.current = overlay;
    }
  }, [pickedLocation]);

  return (
    <div
      ref={containerRef}
      className={`kakao-map-container ${pickMode ? 'pick-mode' : ''}`}
      title={pickMode ? '지도를 클릭해 모임 위치를 지정하세요' : ''}
    />
  );
}
