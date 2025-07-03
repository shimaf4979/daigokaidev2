"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { AuthSection, UserInfo, PostForm, PostList } from "./components";
import styles from "./page.module.css";

export default function Test40Page() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setNewName(user.displayName || user.email || "匿名");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Firestoreからデータを取得する関数
  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsData);
  };

  const handleAuthSuccess = () => {
    // 認証成功時の処理（必要に応じて追加）
  };

  const handleSignOut = () => {
    setUser(null);
    setPosts([]);
    setNewName("");
    setNewContent("");
  };

  const addPost = async () => {
    if (!user) return;

    if (newContent.trim()) {
      const docRef = await addDoc(collection(db, "posts"), {
        name: newName,
        time: new Date().toLocaleString("ja-JP"),
        content: newContent,
        createdAt: new Date(),
        userId: user.uid,
        userEmail: user.email,
      });
      console.log("Document written with ID: ", docRef.id);

      setNewContent("");
      fetchPosts();
    }
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>認証付き掲示板</h1>

      {user ? (
        <div>
          <UserInfo user={user} onSignOut={handleSignOut} />

          <PostForm
            newName={newName}
            setNewName={setNewName}
            newContent={newContent}
            setNewContent={setNewContent}
            onAddPost={addPost}
          />

          <PostList posts={posts} user={user} onPostUpdate={fetchPosts} />
        </div>
      ) : (
        <AuthSection onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}
