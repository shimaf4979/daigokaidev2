"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const page = () => {
  const [name, setName] = useState("");
  const [pokemonData, setPokemonData] = useState(null);

  const inputName = (e) => {
    setName(e.target.value);
  };

  const ClickButton = async () => {
    if (!name.trim()) {
      return;
    }
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    console.log(response);
    const data = await response.json();
    console.log(data);
    setPokemonData(data);
  };

  return (
    <div className={styles.container}>
      <a href="/test">testに遷移</a>
      <input
        type="text"
        className={styles.input}
        onChange={inputName}
        value={name}
      />
      <button onClick={ClickButton}>表示</button>
      {pokemonData && (
        <div>
          <h2>{pokemonData.name}</h2>
          <img
            src={pokemonData.sprites.front_default}
            alt="表示できなかったよー"
          />
        </div>
      )}
    </div>
  );
};

export default page;
