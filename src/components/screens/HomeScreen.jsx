import { useState } from 'react';
import KakaoMap from '../KakaoMap';
import FallbackMap from '../FallbackMap';
import BrandLogo from '../BrandLogo';

export default function HomeScreen({
  kakaoStatus,
  meetups,
  selectedId,
  onSelect,
  pickMode,
  pickedLocation,
  onPick,
  onOpenCreate,
  onConfirmPick,
}) {
  const MapComponent = kakaoStatus === 'ready' ? KakaoMap : FallbackMap;
  const [myLocation, setMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('이 기기에서는 위치 확인을 지원하지 않아요.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() });
        setLocating(false);
      },
      () => {
        setLocationError('위치 권한을 확인해주세요.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="screen home-screen">
      <div className="home-top-bar">
        <BrandLogo iconOnly />
        <div className="home-top-bar-actions">
          <button className="btn btn-secondary btn-fab-round" onClick={handleLocateMe} disabled={locating}>
            {locating ? '…' : '🧭'}
          </button>
          <button className="btn btn-primary btn-fab" onClick={onOpenCreate}>
            + 모임 만들기
          </button>
        </div>
      </div>

      {locationError && <div className="map-notice map-notice-error">{locationError}</div>}

      {kakaoStatus === 'no-key' && (
        <div className="map-notice">
          카카오맵 키가 없어 임시 지도로 보여드려요. <code>.env</code>에 <code>VITE_KAKAO_MAP_KEY</code> 설정 시
          실제 지도가 표시됩니다.
        </div>
      )}
      {kakaoStatus === 'error' && (
        <div className="map-notice map-notice-error">카카오맵 SDK 로드 실패. 키와 플랫폼 도메인을 확인하세요.</div>
      )}

      <div className="home-map-wrap">
        <MapComponent
          meetups={meetups}
          selectedId={selectedId}
          onSelect={onSelect}
          pickMode={pickMode}
          pickedLocation={pickedLocation}
          onPick={onPick}
          myLocation={myLocation}
        />
        {pickMode && (
          <div className="pick-banner">
            📍 모임 위치를 지정할 곳을 지도에서 클릭하세요
            <button className="btn btn-primary btn-small" onClick={onConfirmPick} disabled={!pickedLocation}>
              위치 확정
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
