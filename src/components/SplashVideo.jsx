import { useEffect, useRef, useState } from 'react';

export default function SplashVideo({ onDone }) {
  const videoRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const finish = () => {
      setHidden(true);
      setTimeout(onDone, 300); // 페이드아웃 트랜지션 끝날 때까지 기다렸다가 언마운트
    };
    // 영상 재생이 막히거나(자동재생 정책 등) 너무 길게 멈춰도 앱이 안 열리는 일이 없도록 안전장치
    const fallback = setTimeout(finish, 4000);

    const video = videoRef.current;
    video?.addEventListener('ended', finish);
    return () => {
      clearTimeout(fallback);
      video?.removeEventListener('ended', finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`splash-video-overlay ${hidden ? 'hidden' : ''}`}>
      <video ref={videoRef} src="/splash.mp4" autoPlay muted playsInline />
    </div>
  );
}
