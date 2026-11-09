import { useEffect, useState } from 'react';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

let loadingPromise = null;

function loadKakaoSdk() {
  if (window.kakao && window.kakao.maps) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function useKakaoLoader() {
  const [status, setStatus] = useState(KAKAO_KEY ? 'loading' : 'no-key');

  useEffect(() => {
    if (!KAKAO_KEY) {
      setStatus('no-key');
      return;
    }
    let cancelled = false;
    loadKakaoSdk()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
