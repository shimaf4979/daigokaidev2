"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase";
import {
  MdEmail,
  MdArrowBack,
  MdLogout,
  MdEdit,
  MdSave,
  MdClose,
} from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import styles from "./page.module.css";

export default function App() {
  // メイン状態
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  // 認証関連の状態
  const [authMode, setAuthMode] = useState("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // 投稿編集関連の状態
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

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

  // Firestoreからデータを取得
  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsData);
  };

  // 認証関連の関数
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
      setUser(null);
      setPosts([]);
      setNewName("");
      setNewContent("");
    } catch (error) {
      console.error("サインアウトエラー:", error);
    }
  };

  const handleGoogleAuthMode = () => setAuthMode("google");
  const handleEmailAuthMode = () => setAuthMode("email");
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

  // 投稿関連の関数
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

  const deletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    fetchPosts();
  };

  const startEdit = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const saveEdit = async () => {
    if (editingPost && editContent.trim()) {
      await updateDoc(doc(db, "posts", editingPost), {
        content: editContent,
        editedAt: new Date(),
      });
      setEditingPost(null);
      setEditContent("");
      fetchPosts();
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>認証付き掲示板</h1>

      {user ? (
        // ログイン後のUI
        <div>
          {/* ユーザー情報 */}
          <div className={styles.userInfo}>
            <h3>ようこそ！</h3>
            <p>
              <strong>名前:</strong> {user.displayName || "未設定"}
            </p>
            <p>
              <strong>メール:</strong> {user.email}
            </p>
            <button
              onClick={handleSignOut}
              className={`${styles.button} ${styles.dangerButton}`}
            >
              <MdLogout size={16} />
              サインアウト
            </button>
          </div>

          {/* 投稿フォーム */}
          <div className={styles.postForm}>
            <h3>新規投稿</h3>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="名前"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={styles.input}
              />
              <textarea
                placeholder="投稿内容"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className={styles.textarea}
              />
              <button
                onClick={addPost}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                投稿する
              </button>
            </div>
          </div>

          {/* 投稿一覧 */}
          <div>
            <h3>投稿一覧</h3>
            {posts.map((post) => (
              <div key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <strong>{post.name}</strong>
                  <small>{post.time}</small>
                </div>

                {editingPost === post.id ? (
                  <div className={styles.editForm}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.textarea}
                    />
                    <div className={styles.editActions}>
                      <button
                        onClick={saveEdit}
                        className={`${styles.button} ${styles.successButton}`}
                      >
                        <MdSave size={14} />
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className={`${styles.button} ${styles.secondaryButton}`}
                      >
                        <MdClose size={14} />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{post.content}</p>
                )}

                {user.uid === post.userId && (
                  <div className={styles.postActions}>
                    <button
                      onClick={() => startEdit(post)}
                      className={`${styles.button} ${styles.warningButton}`}
                    >
                      <MdEdit size={14} />
                      編集
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className={`${styles.button} ${styles.dangerButton}`}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 認証UI
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
      )}
    </div>
  );
}
