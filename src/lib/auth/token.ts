// accessToken은 메모리(모듈 변수)에만 보관 — localStorage 미사용(XSS 안전).
// 새로고침 시 사라지므로 앱 시작 시 /auth/refresh(HttpOnly 쿠키)로 복구한다.

let accessToken: string | null = null;

export const saveAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};
