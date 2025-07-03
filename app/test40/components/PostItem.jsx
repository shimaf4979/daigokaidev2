"use client";

import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { MdEdit, MdSave, MdClose } from "react-icons/md";
import styles from "../page.module.css";

export default function PostItem({ post, user, onPostUpdate }) {
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  const deletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    onPostUpdate();
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
      onPostUpdate();
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  return (
    <div className={styles.post}>
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
  );
}
