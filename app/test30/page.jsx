"use client";

import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { MdEmail, MdArrowBack, MdLogout } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import styles from "./page.module.css";

export default function Test30Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError("Google認証に失敗しました");
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setError("");
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError("認証に失敗しました");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthMode("select");
      setEmail("");
      setPassword("");
      setError("");
    } catch (error) {
      console.error("サインアウトエラー:", error);
    }
  };

  const handleGoogleAuthMode = () => {
    setAuthMode("google");
  };

  const handleEmailAuthMode = () => {
    setAuthMode("email");
  };

  const handleBackToSelect = () => {
    setAuthMode("select");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Firebase認証テスト</h1>

      {user ? (
        <div className={styles.signInSection}>
          <h2>ようこそ！</h2>
          <p>
            <strong>名前:</strong> {user.displayName || "未設定"}
          </p>
          <p>
            <strong>メール:</strong> {user.email}
          </p>
          <button
            onClick={handleSignOut}
            className={`${styles.button} ${styles.emailButton}`}
          >
            <MdLogout size={16} />
            サインアウト
          </button>
        </div>
      ) : (
        <div className={styles.signInSection}>
          {authMode === "select" && (
            <>
              <h2>認証方法を選択してください</h2>
              <div className={styles.authButtons}>
                <button
                  onClick={handleGoogleAuthMode}
                  className={`${styles.button} ${styles.googleButton}`}
                >
                  <FaGoogle size={16} />
                  Googleでログイン
                </button>
                <button
                  onClick={handleEmailAuthMode}
                  className={`${styles.button} ${styles.emailButton}`}
                >
                  <MdEmail size={16} />
                  メール/パスワードでログイン
                </button>
              </div>
            </>
          )}

          {authMode === "google" && (
            <>
              <h2>Googleアカウントでログイン</h2>
              <button
                onClick={signInWithGoogle}
                className={`${styles.button} ${styles.googleButton}`}
              >
                <FaGoogle size={16} />
                Googleでログイン
              </button>
              <button
                onClick={handleBackToSelect}
                className={`${styles.button} ${styles.emailButton}`}
              >
                <MdArrowBack size={16} />
                戻る
              </button>
            </>
          )}

          {authMode === "email" && (
            <>
              <h2>{isSignUp ? "アカウント作成" : "ログイン"}</h2>
              {error && <div className={styles.error}>{error}</div>}
              <form onSubmit={handleEmailAuth}>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
                <input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={styles.input}
                />
                <button
                  type="submit"
                  className={`${styles.button} ${styles.emailButton}`}
                >
                  {isSignUp ? "アカウント作成" : "ログイン"}
                </button>
              </form>
              <button
                onClick={handleToggleSignUp}
                className={`${styles.button} ${styles.googleButton}`}
              >
                {isSignUp ? "既存アカウントでログイン" : "新規アカウント作成"}
              </button>
              <button
                onClick={handleBackToSelect}
                className={`${styles.button} ${styles.emailButton}`}
              >
                <MdArrowBack size={16} />
                戻る
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
