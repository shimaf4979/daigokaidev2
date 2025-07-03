"use client";

import { useState } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import { MdEmail, MdArrowBack } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import styles from "../page.module.css";

export default function AuthSection({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    try {
      setError("");
      await signInWithPopup(auth, googleProvider);
      onAuthSuccess();
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
      onAuthSuccess();
    } catch (error) {
      setError("認証に失敗しました");
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

  return (
    <div className={styles.authContainer}>
      {authMode === "select" && (
        <>
          <h2>投稿するにはログインしてください</h2>
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
              className={`${styles.button} ${styles.secondaryButton}`}
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
            className={`${styles.button} ${styles.secondaryButton}`}
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
          <form onSubmit={handleEmailAuth} className={styles.authForm}>
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
              className={`${styles.button} ${styles.primaryButton}`}
            >
              {isSignUp ? "アカウント作成" : "ログイン"}
            </button>
          </form>
          <button
            onClick={handleToggleSignUp}
            className={`${styles.button} ${styles.successButton}`}
          >
            {isSignUp ? "既存アカウントでログイン" : "新規アカウント作成"}
          </button>
          <button
            onClick={handleBackToSelect}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            <MdArrowBack size={16} />
            戻る
          </button>
        </>
      )}
    </div>
  );
}
