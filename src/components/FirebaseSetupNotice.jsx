export default function FirebaseSetupNotice() {
  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <img src="/brand-icon-original.jpg" alt="까치" className="auth-brand-icon" />
        <h1>까치 로컬 커뮤니티</h1>
      </div>
      <div className="firebase-setup-notice">
        <p className="firebase-setup-title">⚙️ 서버 연결이 필요해요</p>
        <p className="muted">
          여러 사람이 같은 모임 데이터를 공유하려면 Firebase 프로젝트 설정이 필요합니다.
          <br />
          아래 값을 <code>.env</code> 파일에 넣어주세요.
        </p>
        <pre className="firebase-setup-code">
{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}
        </pre>
      </div>
    </div>
  );
}
