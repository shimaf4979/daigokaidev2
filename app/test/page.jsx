"use client";

import { db } from "./../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

const page = () => {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const snapshot = await getDocs(collection(db, "test"));
    console.log(snapshot);
    const value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(value);
    setData(value);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addPost = async () => {
    await addDoc(collection(db, "test"), {
      name: "nyaaaaa",
      content: "おはなう",
    });
    loadData();
  };

  const deletePost = async (id) => {
    await deleteDoc(doc(db, "test", id));
    loadData();
  };

  return (
    <div>
      <button onClick={addPost}>データを追加</button>
      {data.map((item) => (
        <div key={item.id}>
          {item.name}
          <p>{item.content}</p>
          <button onClick={() => deletePost(item.id)}>データを削除</button>
        </div>
      ))}
    </div>
  );
};

export default page;
