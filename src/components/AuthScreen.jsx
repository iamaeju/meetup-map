import { useState } from 'react';
import { signUp, logIn } from '../lib/auth';

export default function AuthScreen({ onAuthed, externalError }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError || '');
  const [submitting, setSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (mode === 'signup' && !agreedTerms) {
      setError('이용약관에 동의해야 회원가입할 수 있어요.');
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

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <img src="/brand-icon-original.jpg" alt="까치" className="auth-brand-icon" />
        <h1>까치 로컬 커뮤니티</h1>
        <p className="muted">취향기반 팝미팅을 통해 나다움을 만들어 가는 날</p>
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

        {mode === 'signup' && (
          <label className="auth-terms-agree">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
            <span>
              (필수){' '}
              <a href="/terms.html" target="_blank" rel="noreferrer">
                이용약관
              </a>
              에 동의합니다. 부적절한 콘텐츠·괴롭힘 행위는 발견 즉시 삭제·계정 정지될 수 있어요.
            </span>
          </label>
        )}

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
