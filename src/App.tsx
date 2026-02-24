import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  Stack, 
  Typography,
  Paper 
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { CardScanner } from './CardScanner';

// --- Theme Setup ---
const theme = createTheme({
  palette: {
    mode: 'dark', // Dark mode for a "console" feel creates better contrast for projectors
    primary: { main: '#ff4081' }, // Pink/Redish for highlights
    secondary: { main: '#3d5afe' }, // Blue
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
  },
});

// --- Components ---

// 1. Single Bingo Button (Interactive)
interface BingoButtonProps {
  number: number;
  isCalled: boolean;
  onToggle: (num: number) => void;
}

const BingoCell = ({ number, isCalled, onToggle }: BingoButtonProps) => {
  return (
    <Button 
      variant={isCalled ? "contained" : "outlined"} 
      color={isCalled ? "primary" : "inherit"}
      onClick={() => onToggle(number)}
      sx={{ 
        minWidth: '40px', 
        height: '40px', 
        p: 0, 
        fontWeight: 'bold',
        opacity: isCalled ? 1 : 0.5 
      }}
    >
      {number}
    </Button>
  );
};

// 2. The Full 1-75 Grid (Top Bento Box)
interface BoardProps {
  calledNumbers: Set<number>;
  onToggleNumber: (num: number) => void;
}

const BingoBoard = ({ calledNumbers, onToggleNumber }: BoardProps) => {
  const rowHeaders = ["B", "I", "N", "G", "O"];
  // B: 1-15, I: 16-30, etc.
  
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>MASTER BOARD</Typography>
      <Stack spacing={1}>
        {rowHeaders.map((letter, rowIndex) => (
          <Stack direction="row" spacing={1} key={letter} alignItems="center" justifyContent="center">
            <Typography variant="h4" sx={{ width: 40, color: 'primary.main', fontWeight: 'bold' }}>
              {letter}
            </Typography>
            {Array.from({ length: 15 }).map((_, colIndex) => {
              const num = rowIndex * 15 + colIndex + 1;
              return (
                <BingoCell 
                  key={num} 
                  number={num} 
                  isCalled={calledNumbers.has(num)} 
                  onToggle={onToggleNumber} 
                />
              );
            })}
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

// 3. Last Called Number (Bottom Left)
const LastCalledBox = ({ lastNumber }: { lastNumber: number | null }) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
    <Typography variant="overline" color="text.secondary">LAST CALLED</Typography>
    <Typography variant="h1" sx={{ fontSize: '6rem', color: 'secondary.main', textShadow: '0 0 10px rgba(61,90,254,0.5)' }}>
      {lastNumber || "--"}
    </Typography>
  </Paper>
);

// 4. Info / Logo Box (Bottom Middle)
const InfoBox = () => (
  <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 200 }}>
    <Typography variant="h5" gutterBottom>Kroutt Bingo Night</Typography>
    <Typography variant="body2" color="text.secondary">
      Players: Watch your cards!
    </Typography>
    <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
      Mark numbers as they appear on the big screen.
    </Typography>
    <Box sx={{ mt: 2, p: 1, border: '1px dashed grey', borderRadius: 1 }}>
      QR Code / Join Link Space
    </Box>
  </Paper>
);

// 5. Controls / Game Mode (Bottom Right)
interface ControlsProps {
  gameMode: string;
  setGameMode: (mode: string) => void;
  onReset: () => void;
}

const ControlsBox = ({ gameMode, setGameMode, onReset }: ControlsProps) => (
  <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
    <Box>
      <Typography variant="overline" color="text.secondary">GAME CONTROL</Typography>
      <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
        <InputLabel>Win Pattern</InputLabel>
        <Select
          value={gameMode}
          label="Win Pattern"
          onChange={(e) => setGameMode(e.target.value)}
          size="small"
        >
          <MenuItem value="line">Single Line</MenuItem>
          <MenuItem value="corners">Four Corners</MenuItem>
          <MenuItem value="blackout">Blackout (Full Card)</MenuItem>
        </Select>
      </FormControl>
    </Box>
    
    <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Typography variant="subtitle2" color="primary">
        {gameMode === 'line' && "ANY 5 IN A ROW"}
        {gameMode === 'blackout' && "COVER ALL SPOTS"}
        {gameMode === 'corners' && "THE 4 CORNERS"}
      </Typography>
      {/* Animation Placeholder */}
      <Box className={gameMode === 'blackout' ? 'pulse-animation' : ''} sx={{ width: 10, height: 10, bgcolor: 'primary.main', borderRadius: '50%', mx: 'auto', mt: 1 }} />
    </Box>

    <Button variant="outlined" color="error" fullWidth onClick={onReset} size="small">
      Reset Board
    </Button>
  </Paper>
);

// --- Main Layout ---
function App() {
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set());
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<string>('line');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanComplete = (grid: number[][]) => {
    console.log("Scanned Grid:", grid);
    // TODO: Do something with this grid (e.g. validate it against called numbers)
    alert("Card Scanned! Check console for grid data.");
  };

  const handleToggleNumber = (num: number) => {
    const newSet = new Set(calledNumbers);
    if (newSet.has(num)) {
      newSet.delete(num);
      // If we unmark the last called, we'd technically need to find the previous one, 
      // but for now let's just clear lastNumber if it matches
      if (lastNumber === num) setLastNumber(null);
    } else {
      newSet.add(num);
      setLastNumber(num);
    }
    setCalledNumbers(newSet);
  };

  const handleReset = () => {
    if (window.confirm("Clear the board?")) {
      setCalledNumbers(new Set());
      setLastNumber(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden', p: 2, bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          {/* Bento Grid Layout */}
          <Grid container spacing={2} sx={{ height: '100%' }}>
            
            {/* TOP ROW: The Master Board (Takes ~70% height) */}
            <Grid item xs={12} sx={{ height: '70%' }}>
              <BingoBoard calledNumbers={calledNumbers} onToggleNumber={handleToggleNumber} />
            </Grid>

            {/* BOTTOM ROW: 3 Columns (Takes ~30% height) */}
            <Grid item xs={12} container spacing={2} sx={{ height: '30%' }}>
              
              {/* Left: Last Called */}
              <Grid item xs={4}>
                <LastCalledBox lastNumber={lastNumber} />
              </Grid>

              {/* Middle: Info */}
              <Grid item xs={4}>
                <InfoBox />
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1,color: 'text.secondary', borderColor: 'text.secondary' }}
                  onClick={() => setScannerOpen(true)}
                >
                  📷 Mobile Scan (Beta)
                </Button>
              </Grid>

              {/* Right: Controls */}
              <Grid item xs={4}>
                <ControlsBox gameMode={gameMode} setGameMode={setGameMode} onReset={handleReset} />
              </Grid>

            </Grid>
          </Grid>
        </Container>
        
        <CardScanner 
          open={scannerOpen} 
          onClose={() => setScannerOpen(false)} 
          onScanComplete={handleScanComplete} 
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
