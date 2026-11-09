// 카카오 로그인 (백엔드 없는 SPA용 — Redirect + Authorization Code 방식)
// 카카오 디벨로퍼스에서 "카카오 로그인" 제품을 활성화하고,
// Redirect URI에 현재 사이트 주소(예: http://localhost:5173/, https://meetup-map-pearl.vercel.app/)를 등록해야 합니다.
// 또한 "보안 > Client Secret 사용"은 꺼져 있어야 합니다(기본값).
const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const PENDING_KEY = 'kkachi_kakao_pending';

function getRedirectUri() {
  return window.location.origin + '/';
}

export function isKakaoLoginAvailable() {
  return !!KAKAO_KEY;
}

export function startKakaoLogin() {
  if (!KAKAO_KEY) return;
  sessionStorage.setItem(PENDING_KEY, '1');
  // scope를 명시하면 콘솔의 동의항목 설정과 정확히 일치해야 해서(안 맞으면 KOE006),
  // 콘솔에 설정된 기본 동의항목을 그대로 쓰도록 scope 파라미터를 생략함
  const params = new URLSearchParams({
    client_id: KAKAO_KEY,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

// 카카오 로그인 리다이렉트로 돌아왔는지 확인하고, 그렇다면 토큰 교환 + 프로필 조회까지 수행
export async function consumeKakaoRedirect() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const wasPending = sessionStorage.getItem(PENDING_KEY) === '1';

  if (!code && !error) return null;
  sessionStorage.removeItem(PENDING_KEY);

  // URL에서 code/error 쿼리 제거 (새로고침해도 재시도 안 되도록)
  url.search = '';
  window.history.replaceState({}, '', url.toString());

  if (!wasPending) return null;
  if (error) throw new Error('카카오 로그인이 취소됐어요.');

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_KEY,
      redirect_uri: getRedirectUri(),
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description || '카카오 토큰 발급에 실패했어요.');
  }

  const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = await profileRes.json();
  const account = profileData.kakao_account;

  return {
    socialId: profileData.id,
    name: account?.profile?.nickname,
    avatar: account?.profile?.profile_image_url,
  };
}
