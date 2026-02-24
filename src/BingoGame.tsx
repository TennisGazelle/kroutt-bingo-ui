import React, { useState, useEffect } from 'react';
import './BingoGame.css';

// Standard Bingo range: B (1-15), I (16-30), N (31-45), G (46-60), O (61-75)
const COLUMNS = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 }
};

interface BingoState {
  board: number[][]; // 5x5 grid, 0 for empty/marked-free
  marked: boolean[][];
  lastCalledNumber: number | null;
  winType: 'none' | 'line' | 'blackout';
}

const generateBoard = (): number[][] => {
  const board: number[][] = [];
  const colKeys = Object.keys(COLUMNS) as (keyof typeof COLUMNS)[];

  // Initialize columns
  const cols: number[][] = colKeys.map(key => {
    const { min, max } = COLUMNS[key];
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(nums);
  });

  // Transpose to rows for display
  for (let r = 0; r < 5; r++) {
    const row: number[] = [];
    for (let c = 0; c < 5; c++) {
      if (r === 2 && c === 2) {
        row.push(0); // Free space
      } else {
        row.push(cols[c][r]);
      }
    }
    board.push(row);
  }
  return board;
};

const checkWin = (marked: boolean[][]): 'none' | 'line' | 'blackout' => {
  // Check Blackout
  const allMarked = marked.every(row => row.every(m => m));
  if (allMarked) return 'blackout';

  // Check Lines (Rows & Cols)
  for (let i = 0; i < 5; i++) {
    if (marked[i].every(m => m)) return 'line'; // Row
    if (marked.map(row => row[i]).every(m => m)) return 'line'; // Col
  }

  // Check Diagonals
  if ([0, 1, 2, 3, 4].every(i => marked[i][i])) return 'line';
  if ([0, 1, 2, 3, 4].every(i => marked[i][4 - i])) return 'line';

  return 'none';
};

export const BingoGame: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(generateBoard());
  const [marked, setMarked] = useState<boolean[][]>(
    Array(5).fill(null).map((_, r) => Array(5).fill(null).map((_, c) => r === 2 && c === 2))
  );
  const [lastCall, setLastCall] = useState<number | null>(null);
  const [winStatus, setWinStatus] = useState<'none' | 'line' | 'blackout'>('none');

  // Stub for OCR / Mobile Client parser
  const handleScanCard = () => {
    console.log("📷 OCR Stub: Launching camera/upload to parse card...");
    // Future implementation:
    // 1. Capture image
    // 2. Send to backend/OCR service
    // 3. Parse grid numbers
    // 4. setBoard(parsedBoard)
    alert("OCR Stub: Mobile scanner integration point.");
  };

  const toggleCell = (r: number, c: number) => {
    if (r === 2 && c === 2) return; // Always marked
    const newMarked = [...marked];
    newMarked[r] = [...marked[r]];
    newMarked[r][c] = !newMarked[r][c];
    setMarked(newMarked);
  };

  const pickRandomNumber = () => {
    // Generate a random number 1-75 just for display animation
    const num = Math.floor(Math.random() * 75) + 1;
    setLastCall(num);
  };

  useEffect(() => {
    setWinStatus(checkWin(marked));
  }, [marked]);

  return (
    <div className={`bingo-container ${winStatus !== 'none' ? 'win-animation' : ''}`}>
      <h1>Bingo! {winStatus === 'blackout' ? '🔥 BLACKOUT 🔥' : winStatus === 'line' ? '🎉 BINGO! 🎉' : ''}</h1>
      
      <div className="controls">
        <button onClick={pickRandomNumber}>Call Number</button>
        <button onClick={handleScanCard}>📷 Scan Card (Stub)</button>
        <button onClick={() => { setBoard(generateBoard()); setMarked(Array(5).fill(null).map((_, r) => Array(5).fill(null).map((_, c) => r === 2 && c === 2))); }}>New Game</button>
      </div>

      {lastCall && <div className="last-call">Last Called: <strong>{lastCall}</strong></div>}

      <div className="bingo-board">
        {['B', 'I', 'N', 'G', 'O'].map(letter => <div key={letter} className="header-cell">{letter}</div>)}
        {board.map((row, rIndex) => (
          row.map((num, cIndex) => (
            <div 
              key={`${rIndex}-${cIndex}`} 
              className={`cell ${marked[rIndex][cIndex] ? 'marked' : ''} ${rIndex === 2 && cIndex === 2 ? 'free' : ''}`}
              onClick={() => toggleCell(rIndex, cIndex)}
            >
              {num === 0 ? 'FREE' : num}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};
