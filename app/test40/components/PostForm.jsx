"use client";

import styles from "../page.module.css";

export default function PostForm({
  newName,
  setNewName,
  newContent,
  setNewContent,
  onAddPost,
}) {
  return (
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
          onClick={onAddPost}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          投稿する
        </button>
      </div>
    </div>
  );
}
