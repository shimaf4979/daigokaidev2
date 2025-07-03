"use client";

import PostItem from "./PostItem";
import styles from "../page.module.css";

export default function PostList({ posts, user, onPostUpdate }) {
  return (
    <div>
      <h3>投稿一覧</h3>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          user={user}
          onPostUpdate={onPostUpdate}
        />
      ))}
    </div>
  );
}
