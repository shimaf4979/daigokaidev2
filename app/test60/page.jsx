"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase";
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import styles from "./page.module.css";

export default function ThemeList() {
  const [themes, setThemes] = useState([]);
  const [newTheme, setNewTheme] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const q = query(collection(db, "themes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const themesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setThemes(themesData);
  };

  const addTheme = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("テーマを作成するにはログインが必要です");
      return;
    }
    if (newTheme.trim()) {
      await addDoc(collection(db, "themes"), {
        title: newTheme,
        createdAt: new Date(),
        userId: user.uid,
        userName: user.displayName || user.email,
      });
      setNewTheme("");
      fetchThemes();
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>掲示板テーマ一覧</h1>
        {user ? (
          <div className={styles.userInfo}>
            <span>{user.displayName || user.email}</span>
            <button onClick={handleSignOut} className={styles.authButton}>
              ログアウト
            </button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} className={styles.authButton}>
            Googleでログイン
          </button>
        )}
      </div>

      <form onSubmit={addTheme}>
        <input
          type="text"
          value={newTheme}
          onChange={(e) => setNewTheme(e.target.value)}
          placeholder="新しいテーマを入力"
          className={styles.formInput}
        />
        <button type="submit" className={styles.submitButton}>
          テーマを作成
        </button>
      </form>

      <div>
        {themes.map((theme) => (
          <div key={theme.id} className={styles.themeItem}>
            <Link href={`/test60/${theme.id}`}>{theme.title}</Link>
            <small>作成者: {theme.userName || "匿名"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
