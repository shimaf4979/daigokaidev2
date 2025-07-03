"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../../../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import Link from "next/link";
import styles from "../page.module.css";

export default function ThemePage() {
  const params = useParams();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [theme, setTheme] = useState(null);
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
    fetchTheme();
    fetchPosts();
  }, [params.id]);

  const fetchTheme = async () => {
    const q = query(
      collection(db, "themes"),
      where("__name__", "==", params.id)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setTheme({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      });
    }
  };

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), where("themeId", "==", params.id));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    setPosts(postsData);
  };

  const addPost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("投稿するにはログインが必要です");
      return;
    }
    if (newPost.trim()) {
      await addDoc(collection(db, "posts"), {
        content: newPost,
        name: user.displayName || user.email,
        themeId: params.id,
        createdAt: new Date(),
        userId: user.uid,
      });
      setNewPost("");
      fetchPosts();
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("本当に削除しますか？")) {
      await deleteDoc(doc(db, "posts", postId));
      fetchPosts();
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

  if (loading || !theme) return <div>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/test60">← テーマ一覧に戻る</Link>
          <h1>{theme.title}</h1>
        </div>
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

      {user && (
        <form onSubmit={addPost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="投稿内容"
            required
            className={styles.formTextarea}
          />
          <button type="submit" className={styles.submitButton}>
            投稿する
          </button>
        </form>
      )}

      <div>
        {posts.map((post) => (
          <div key={post.id} className={styles.post}>
            <div>
              <strong>{post.name}</strong>
              <small>{post.createdAt.toDate().toLocaleString("ja-JP")}</small>
              {user && user.uid === post.userId && (
                <button
                  onClick={() => deletePost(post.id)}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              )}
            </div>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
