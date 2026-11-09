import { useState } from 'react';
import { signUp, logIn, loginWithGoogle } from '../lib/auth';
import { startKakaoLogin, isKakaoLoginAvailable } from '../lib/kakaoAuth';

export default function AuthScreen({ onAuthed, externalError }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError || '');
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'kakao' | 'google' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const result =
      mode === 'signup'
        ? await signUp({ name, email: email.trim().toLowerCase(), password })
        : await logIn({ email: email.trim().toLowerCase(), password });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onAuthed(result.user);
  };

  const handleKakaoLogin = () => {
    setError('');
    setSocialLoading('kakao');
    startKakaoLogin(); // 카카오 인증 페이지로 이동 (돌아온 뒤 처리는 App.jsx에서)
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSocialLoading('google');
    try {
      const user = await loginWithGoogle();
      onAuthed(user);
    } catch (err) {
      setError(err.message || '구글 로그인에 실패했어요.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <img src="/brand-icon-original.jpg" alt="까치" className="auth-brand-icon" />
        <h1>까치 로컬 커뮤니티</h1>
        <p className="muted">동네 모임과 스몰비즈니스를 지도에서 찾아보세요</p>
      </div>

      <div className="social-login-group">
        <button
          className="btn btn-social btn-kakao"
          onClick={handleKakaoLogin}
          disabled={!isKakaoLoginAvailable() || socialLoading !== null}
        >
          {socialLoading === 'kakao' ? '연결 중...' : '💬 카카오로 계속하기'}
        </button>
        <button
          className="btn btn-social btn-google"
          onClick={handleGoogleLogin}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'google' ? '연결 중...' : 'G 구글로 계속하기'}
        </button>
      </div>

      <div className="auth-divider">
        <span>또는 이메일로 계속하기</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <label>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="닉네임" />
          </label>
        )}
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '처리 중...' : mode === 'signup' ? '회원가입' : '로그인'}
        </button>
      </form>

      <button
        className="auth-switch"
        onClick={() => {
          setMode(mode === 'signup' ? 'login' : 'signup');
          setError('');
        }}
      >
        {mode === 'signup' ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
      </button>
    </div>
  );
}
