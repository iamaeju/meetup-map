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

  return (
    <div className="screen home-screen">
      <div className="home-top-bar">
        <BrandLogo iconOnly />
        <button className="btn btn-primary btn-fab" onClick={onOpenCreate}>
          + 모임 만들기
        </button>
      </div>

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
