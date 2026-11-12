// 카카오 로그인 (백엔드 없는 SPA용 — Authorization Code 방식)
// 웹: 전체 페이지 Redirect. 네이티브 앱: 시스템 브라우저 + 커스텀 URL 스킴으로 복귀.
// 카카오 디벨로퍼스 "카카오 로그인 > Redirect URI"에 아래 두 가지를 모두 등록해야 합니다.
//   - https://meetup-map-pearl.vercel.app/ (웹)
//   - kakaod75f5297db7bc64cab4c80f01f2057c0://oauth (네이티브 앱, 플랫폼 키 > 네이티브 앱 스킴에서 발급된 값)
// 또한 "보안 > Client Secret 사용"은 꺼져 있어야 합니다(기본값).
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapApp } from '@capacitor/app';

// 카카오 로그인(/oauth/authorize, /oauth/token)은 JavaScript 키가 아니라 REST API 키를 써야 함
// (지도 SDK용 VITE_KAKAO_MAP_KEY와는 별개 — 플랫폼 키 > REST API 키 값)
const KAKAO_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const PENDING_KEY = 'kkachi_kakao_pending';
const NATIVE_REDIRECT_URI = 'kakaod75f5297db7bc64cab4c80f01f2057c0://oauth';

function isNative() {
  return Capacitor.isNativePlatform();
}

function getRedirectUri() {
  return isNative() ? NATIVE_REDIRECT_URI : window.location.origin + '/';
}

export function isKakaoLoginAvailable() {
  return !!KAKAO_KEY;
}

async function exchangeCodeForProfile(code, redirectUri) {
  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_KEY,
      redirect_uri: redirectUri,
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

// 네이티브 앱: 시스템 브라우저를 열고, 커스텀 스킴으로 돌아오면 코드 교환까지 끝낸 프로필을 resolve
function startKakaoLoginNative(authorizeUrl) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let urlOpenHandle;
    let finishedHandle;

    const cleanup = () => {
      urlOpenHandle?.remove();
      finishedHandle?.remove();
    };

    urlOpenHandle = CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith(NATIVE_REDIRECT_URI)) return;
      settled = true;
      cleanup();
      Browser.close().catch(() => {});
      try {
        const u = new URL(url);
        const code = u.searchParams.get('code');
        const error = u.searchParams.get('error');
        if (error) throw new Error('카카오 로그인이 취소됐어요.');
        if (!code) throw new Error('카카오 로그인 코드가 전달되지 않았어요.');
        resolve(await exchangeCodeForProfile(code, NATIVE_REDIRECT_URI));
      } catch (err) {
        reject(err);
      }
    });

    finishedHandle = Browser.addListener('browserFinished', () => {
      if (settled) return;
      cleanup();
      reject(new Error('카카오 로그인이 취소됐어요.'));
    });

    Browser.open({ url: authorizeUrl });
  });
}

// 반환값: 웹에서는 항상 undefined(페이지가 이동함), 네이티브에서는 로그인 완료된 프로필(Promise)
export function startKakaoLogin() {
  if (!KAKAO_KEY) return;
  // scope를 명시하면 콘솔의 동의항목 설정과 정확히 일치해야 해서(안 맞으면 KOE006),
  // 콘솔에 설정된 기본 동의항목을 그대로 쓰도록 scope 파라미터를 생략함
  const params = new URLSearchParams({
    client_id: KAKAO_KEY,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
  });
  const authorizeUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;

  if (isNative()) {
    return startKakaoLoginNative(authorizeUrl);
  }

  sessionStorage.setItem(PENDING_KEY, '1');
  window.location.href = authorizeUrl;
}

// 카카오 로그인 리다이렉트로 돌아왔는지 확인하고, 그렇다면 토큰 교환 + 프로필 조회까지 수행 (웹 전용)
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

  return exchangeCodeForProfile(code, getRedirectUri());
}
