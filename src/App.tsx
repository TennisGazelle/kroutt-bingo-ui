import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8e24aa',
    },
    secondary: {
      main: '#3d5afe',
    },
  },
});

interface BingoButtonProps {
  number?: number;
  text?: string;
}

const BingoButton = ({ number = 0, text }: BingoButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const variant = text ? "contained" : isClicked ? "contained" : "outlined";

  const handleClick = () => {
    setIsClicked(!isClicked);
    console.log(number, "clicked:", isClicked);
  };

  return (
    <Button variant={variant} onClick={handleClick} disabled={!!text}>
      {text || number}
    </Button>
  );
};

const BingoBoard = () => {
  const rowHeaders = ["B", "I", "N", "G", "O"];
  return (
    <Card variant='outlined' sx={{ height: '100%', display: 'inline-block', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
      <CardContent>
        <Stack direction="column" spacing={2.5} key="board">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <Stack direction="row" spacing={2} key={rowIndex}>
              <Typography variant="h4" key={rowIndex} sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                {rowHeaders[rowIndex]}
              </Typography>
              {Array.from({ length: 15 }).map((_, cellIndex) => (
                <BingoButton number={cellIndex + (rowIndex * 15) + 1} />
              ))}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
    // <table className="bingo-board">
    //   <tbody>
    //     {Array.from({ length: 5 }).map((_, rowIndex) => (
    //       <tr key={rowIndex}>
    //         {Array.from({ length: 15 }).map((_, cellIndex) => (
    //           <td key={cellIndex + (rowIndex * 15) + 1}>
    //             <BingoButton number={cellIndex + (rowIndex * 15) + 1} />
    //           </td>
    //         ))}
    //       </tr>
    //     ))}
    //   </tbody>
    // </table>
  )
};

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <BingoBoard />
    </div>
  );
}

export default App;
