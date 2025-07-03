"use client";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./../../firebase"; // firebase.jsからdbをインポート

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

const page = () => {
  // Firestoreからデータを取得する関数
  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(postsData);
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
    console.log(posts);
  }, []);

  const [posts, setPosts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleChange = (e) => {
    setNewName(e.target.value);
    console.log(e.target.value);
  };

  const handleContentChange = (e) => {
    setNewContent(e.target.value);
  };

  const addPost = async () => {
    if (newName.trim() && newContent.trim()) {
      const docRef = await addDoc(collection(db, "posts"), {
        name: newName,
        time: new Date().toLocaleString("ja-JP"),
        content: newContent,
        createdAt: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);

      // 入力欄をクリア
      setNewName("");
      setNewContent("");
      fetchPosts();
    }
  };

  const deletePost = async (id) => {
    console.log(id);

    await deleteDoc(doc(db, "posts", id));
    console.log("Document deleted");

    // 削除後に投稿一覧を更新
    fetchPosts();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>にゃおーん掲示板</h1>
      <div className={styles.flexBoxColumn}>
        <input
          type="text"
          placeholder="名前"
          onChange={handleChange}
          className={styles.input}
          value={newName}
        />
        <textarea
          type="text"
          placeholder="内容"
          onChange={handleContentChange}
          className={styles.input}
          value={newContent}
        />
        <button onClick={addPost} className={styles.button}>
          投稿する
        </button>
      </div>
      <div className={styles.postsList}>
        <h3 className={styles.postsTitle}>投稿一覧</h3>
        {posts.map((post) => (
          <div key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <strong className={styles.postName}>{post.name}</strong>
              <small className={styles.postTime}>{post.time}</small>
            </div>
            <p className={styles.postContent}>{post.content}</p>
            <button
              className={styles.deleteButton}
              onClick={() => deletePost(post.id)}
            >
              削除する
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
