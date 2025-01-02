'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function Home({ ...props }) {
  const [gameData, setGameData] = useState({ x: 10, y: 10, bombs: 10 });

  const handleInputChange = (event) => {
    const name = event.currentTarget.name;
    const value = event.currentTarget.value;

    setGameData({ ...gameData, [name]: parseInt(value) });
  };

  const handleSubmit = () => {
    localStorage.setItem('gameSettings', JSON.stringify(gameData));
    redirect('/game');
  };

  return (
    <div className='mainWrapper'>
      <div className='gameSelectorWrapper'>
        <h1>Minesweeper</h1>
        <label htmlFor='x-axis-input'>Columns:</label>
        <input type='number' name='x' id='x-axis-input' value={gameData.x} onChange={handleInputChange} />
        <label htmlFor='y-axis-input'>Rows:</label>
        <input type='number' name='y' id='y-axis-input' value={gameData.y} onChange={handleInputChange} />
        <label htmlFor='bombs-input'>Bombs:</label>
        <input type='number' name='bombs' id='bombs-input' value={gameData.bombs} onChange={handleInputChange} />
        {gameData.x * gameData.y <= gameData.bombs && <span className='errorSpan'>You can't have more bombs than squares in the game</span>}

        <button className='confirm-button' onClick={handleSubmit}>
          Start Game
        </button>
      </div>
    </div>
  );
}
