import { useEffect, useRef, useState } from 'react';

// ready=true가 될 때까지(로그인 상태 확인 등 실제 로딩이 끝날 때까지) 로고 영상을 반복 재생하다가,
// 로딩이 끝나면 영상을 멈추고 앱으로 넘어간다. 로딩이 비정상적으로 오래 걸려도 무한정 막히지 않도록 최대 대기시간을 둔다.
const MAX_WAIT_MS = 6000;

export default function SplashVideo({ ready, onDone }) {
  const videoRef = useRef(null);
  const [hidden, setHidden] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setHidden(true);
    setTimeout(onDone, 300); // 페이드아웃 트랜지션 끝날 때까지 기다렸다가 언마운트
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise?.catch) playPromise.catch(() => {}); // 자동재생이 막혀도 로딩 자체는 정상 진행
    }
    const fallback = setTimeout(finish, MAX_WAIT_MS);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className={`splash-video-overlay ${hidden ? 'hidden' : ''}`}>
      <video ref={videoRef} src="/splash.mp4" autoPlay loop muted playsInline />
    </div>
  );
}
