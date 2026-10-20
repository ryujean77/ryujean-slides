/* 마이웨이 아카데미 — 회원 로그인 (Firebase Authentication) + 회원 API 호출.
   비밀번호는 Firebase(구글)가 보관한다. 이 사이트와 회원 API 는 비밀번호를 받지도 저장하지도 않는다.
   아래 설정값은 공개용 식별자라 화면 코드에 있어도 된다(권한은 회원 API 가 토큰으로 판단). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, deleteUser,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, reload,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const FIREBASE = {
  apiKey: "AIzaSyBYQ_H8DxVLZcZXTvA6ZA09tSsq5cw4SVg",
  authDomain: "myway-academy.firebaseapp.com",
  projectId: "myway-academy",
  appId: "1:202979424880:web:23da5e481909ddd97492b5",
};
const API = "https://myway-academy-api.ryujean77.workers.dev";

if (!FIREBASE) {
  window.mwAuth = { disabled: true, ready: Promise.resolve(null) };
} else {
  const auth = getAuth(initializeApp(FIREBASE));
  auth.languageCode = "ko";
  let me = null;
  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));

  async function api(path, opts = {}) {
    const u = auth.currentUser;
    if (!u) throw new Error("로그인이 필요합니다");
    const token = await u.getIdToken();
    return fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: "Bearer " + token } });
  }

  async function loadMe(user) {
    me = null;
    if (user && user.emailVerified) {
      try { const r = await api("/me"); if (r.ok) me = await r.json(); } catch (e) { /* 네트워크 오류: 비회원처럼 */ }
    }
  }

  onAuthStateChanged(auth, async (user) => {
    await loadMe(user);
    resolveReady(user);
    document.dispatchEvent(new CustomEvent("mw-auth", { detail: { user, me } }));
  });

  window.mwAuth = {
    ready,
    api,
    get user() { return auth.currentUser; },
    get me() { return me; },
    google: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signUp: async (email, pw) => { const c = await createUserWithEmailAndPassword(auth, email, pw); await sendEmailVerification(c.user); return c.user; },
    signIn: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    resend: () => sendEmailVerification(auth.currentUser),
    reset: (email) => sendPasswordResetEmail(auth, email),
    // 인증 메일의 링크를 누른 뒤: 계정 상태와 토큰을 새로 받아 /me 를 다시 읽는다
    refresh: async () => {
      await reload(auth.currentUser);
      await auth.currentUser.getIdToken(true);
      await loadMe(auth.currentUser);
      document.dispatchEvent(new CustomEvent("mw-auth", { detail: { user: auth.currentUser, me } }));
      return auth.currentUser;
    },
    signOut: () => signOut(auth),
    // 탈퇴: 회원 DB 행을 지운 뒤 Firebase 계정 삭제 (오래된 로그인이면 다시 로그인하라는 오류가 난다)
    withdraw: async () => {
      const r = await api("/me", { method: "DELETE" });
      if (!r.ok) throw new Error("탈퇴 처리 실패");
      await deleteUser(auth.currentUser);
    },
  };
}
document.dispatchEvent(new Event("mw-auth-ready"));
