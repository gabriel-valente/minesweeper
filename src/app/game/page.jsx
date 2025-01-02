'use client';

import './game.css';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
import 'material-symbols';

export default function Game({ ...props }) {
  const [gameSettings, setGameSettings] = useState({});
  const [gameState, setGameState] = useState();
  const [activeBombs, setActiveBombs] = useState();
  const [time, setTime] = useState(0);
  const [grid, setGrid] = useState();
  const [userGrid, setUserGrid] = useState();
  const [gameMessage, setGameMessage] = useState('');
  const [gridCreated, setGridCreated] = useState(false);

  let timer = null;

  useEffect(() => {
    const lsGameSettings = JSON.parse(localStorage.getItem('gameSettings'));
    const lsGameState = localStorage.getItem('gameState');

    if (lsGameSettings == null) redirect('/');

    setGameSettings(lsGameSettings);
    setGameState(lsGameState);
    setActiveBombs(lsGameSettings.bombs);

    setGrid(Array.from({ length: lsGameSettings.x }, () => Array(lsGameSettings.y).fill(0)));
    setUserGrid(Array.from({ length: lsGameSettings.x }, () => Array(lsGameSettings.y).fill(false)));
  }, []);

  useEffect(() => {
    if (gameState == 'paused') clearInterval(timer);
    else timer = setInterval(() => setTime(time + 1), 1000);

    return () => clearInterval(timer);
  }, [time, gameState]);

  useEffect(() => {
    if (activeBombs == 0) {
      clearInterval(timer);
      setGameMessage('You Win!');
      setGameState('win');
    } else if (gameState == 'lost') {
      clearInterval(timer);
      setGameMessage('You Lost!');
    }
  }, [activeBombs, gameState]);

  const handleStatusChange = () => {
    const state = gameState == 'playing' ? 'paused' : 'playing';

    setGameState(state);

    localStorage.setItem('gameState', state);
  };

  const createGrid = (clickX, clickY) => {
    const currentGrid = grid;

    const bombPositions = new Set();
    while (bombPositions.size < gameSettings.bombs) {
      const row = Math.floor(Math.random() * gameSettings.x);
      const col = Math.floor(Math.random() * gameSettings.y);

      if ((row !== clickX || col !== clickY) && !bombPositions.has(`${row},${col}`)) {
        bombPositions.add(`${row},${col}`);
      }
    }

    for (const pos of bombPositions) {
      const [row, col] = pos.split(',').map(Number);
      currentGrid[row][col] = 'B';

      for (let i = Math.max(0, row - 1); i <= Math.min(gameSettings.x - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(gameSettings.y - 1, col + 1); j++) {
          if (currentGrid[i][j] !== 'B') currentGrid[i][j]++;
        }
      }
    }

    setGrid(currentGrid);

    return currentGrid;
  };

  const handleCellClick = (event, x, y) => {
    event.preventDefault();

    let tempGrid = grid;

    if (!gridCreated) {
      setGridCreated(true);
      tempGrid = createGrid(x, y);
    }

    if (event.type == 'contextmenu') {
      setUserGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row]);

        if (!newGrid[x][y] && activeBombs > 0) {
          newGrid[x][y] = 'F';
          setActiveBombs(activeBombs - 1);
        } else if (newGrid[x][y] == 'F') {
          newGrid[x][y] = false;
          setActiveBombs(activeBombs + 1);
        }

        return newGrid;
      });
    } else if (event.type == 'click' && userGrid[x][y] != 'F') {
      if (tempGrid[x][y] == '0') {
        const tempUserGrid = propagateEmptyCells(x, y, userGrid, tempGrid);

        setUserGrid([...tempUserGrid]);
      } else {
        setUserGrid((prevGrid) => {
          const newGrid = prevGrid.map((row) => [...row]);
          newGrid[x][y] = 'O';

          if (newGrid[x][y] == 'O' && tempGrid[x][y] == 'B') setGameState('lost');

          return newGrid;
        });
      }
    }
  };

  const propagateEmptyCells = (x, y, tempUserGrid, grid) => {
    for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, gameSettings.x); i++) {
      for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, gameSettings.y); j++) {
        if (tempUserGrid[i][j] == 'O' || tempUserGrid[i][j] == 'F') continue;

        if (grid[i][j] == '0') {
          tempUserGrid[i][j] = 'O';
          tempUserGrid = propagateEmptyCells(i, j, tempUserGrid, grid);
        } else if (grid[i][j] != 'B') tempUserGrid[i][j] = 'O';
      }
    }

    return tempUserGrid;
  };

  return (
    <>
      <div className='gameWrapper'>
        <div className='gameHeader'>
          <div className='infoWrapper'>
            <span className='hint'>Bombs</span>
            <span className='info bombs'>{activeBombs}</span>
          </div>
          <div className='infoWrapper'>
            <span className='hint'>Status</span>
            <button className='info status' onClick={handleStatusChange}>
              <span className='material-icons'>{gameState == 'playing' ? 'pause' : 'play_arrow'}</span>
            </button>
          </div>
          <div className='infoWrapper'>
            <span className='hint'>Time</span>
            <span className='info timer'>{time}</span>
          </div>
        </div>
        <div className='gameGrid'>
          {console.log(userGrid)}
          {grid &&
            grid.map((row, i) => (
              <div key={`row-${i}`} className='row'>
                {row.map((cell, j) => (
                  <div
                    key={`cell-${i}-${j}`}
                    className={`cell ${userGrid[i][j] == 'O' ? (grid[i][j] == 'B' ? 'fail' : 'open') : ''}`}
                    onClick={(e) => handleCellClick(e, i, j)}
                    onContextMenu={(e) => handleCellClick(e, i, j)}>
                    {userGrid[i][j] == 'O' && cell == 'B' && <span className='material-symbols-outlined'>explosion</span>}
                    {userGrid[i][j] == 'O' && cell != '0' && cell != 'B' && cell}
                    {userGrid[i][j] == 'F' && <span className='material-symbols-outlined'>flag</span>}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
      {gameState == 'win' || gameState == 'lost' ? (
        <div className='gameStatus'>
          <p className={gameState}>{gameMessage}</p>
        </div>
      ) : null}
    </>
  );
}
