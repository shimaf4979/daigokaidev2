"use client";

import React from "react";
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

const page = () => {
  const [user, setuser] = useState(null);
  const [newTheme, setNewTheme] = useState("");
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user);
      setuser(user);
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

  const handleLogin = () => {
    signInWithGoogle();
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
      console.log("ログアウトエラー");
    }
  };

  const inputChange = (e) => {
    setNewTheme(e.target.value);
    console.log(e.target.value);
  };

  const handleSubmit = () => {
    addTheme();
  };

  const addTheme = async (e) => {
    // e.preventdefault();
    if (!user) {
      alert("ログインが必須だにゃ！");
      return;
    }
    if (newTheme.trim()) {
      await addDoc(collection(db, "themes"), {
        title: newTheme,
        createdAt: new Date(),
        userId: user.uid,
        userName: user.displayName || user.email,
      });
    }
    setThemes("");
    fetchThemes();
  };

  return (
    <div className={styles.container}>
      <div className={styles.flexbox}>
        page
        {user ? (
          <>
            <p>{user.displayName}</p>
            <button onClick={handleSignOut}>ログアウト</button>
          </>
        ) : (
          <button onClick={handleLogin}>Googleでログイン</button>
        )}
      </div>
      <div>
        <input type="text" onChange={inputChange} value={newTheme} />
        <button onClick={handleSubmit}>作成する</button>
      </div>
      <div>
        {themes.map((theme) => (
          <div key={theme.id} className={styles.cardBox}>
            <Link href={`test3/${theme.id}`}>{theme.title}</Link>
            <p>作成者:{theme.userName || "匿名"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
