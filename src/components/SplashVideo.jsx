import { useEffect, useRef, useState } from 'react';

// ready=true가 될 때까지(로그인 상태 확인 등 실제 로딩이 끝날 때까지) 로고를 보여주다가,
// 로딩이 끝나면 앱으로 넘어간다. 로딩이 비정상적으로 오래 걸려도 무한정 막히지 않도록 최대 대기시간을 둔다.
const MAX_WAIT_MS = 3000;

export default function SplashVideo({ ready, onDone }) {
  const [hidden, setHidden] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setHidden(true);
    setTimeout(onDone, 300); // 페이드아웃 트랜지션 끝날 때까지 기다렸다가 언마운트
  };

  useEffect(() => {
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
      <img src="/brand-icon-original.jpg" alt="까치" className="splash-logo" />
    </div>
  );
}
