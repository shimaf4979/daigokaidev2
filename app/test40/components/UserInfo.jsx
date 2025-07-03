"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { MdLogout } from "react-icons/md";
import styles from "../page.module.css";

export default function UserInfo({ user, onSignOut }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (error) {
      console.error("サインアウトエラー:", error);
    }
  };

  return (
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
  );
}
