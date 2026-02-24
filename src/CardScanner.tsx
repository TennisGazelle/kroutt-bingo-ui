import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Typography 
} from '@mui/material';
import Tesseract from 'tesseract.js';

interface CardScannerProps {
  onScanComplete: (grid: number[][]) => void;
  open: boolean;
  onClose: () => void;
}

export const CardScanner = ({ onScanComplete, open, onClose }: CardScannerProps) => {
  const [status, setStatus] = useState<string>('Idle');
  const [progress, setProgress] = useState<number>(0);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string);
          processImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const processImage = async (image: string) => {
    setStatus('Initializing OCR engine...');
    setProgress(0);

    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
            setStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
          } else {
            setStatus(m.status);
          }
        }
      });

      const ret = await worker.recognize(image);
      const { text, lines } = ret.data as any;
      console.log("OCR Raw Text:", text);
      
      setStatus('Parsing grid...');
      const grid = parseGridFromText(lines);
      
      await worker.terminate();

      if (grid) {
        setStatus('Success!');
        onScanComplete(grid);
        onClose();
      } else {
        setStatus('Failed to detect a valid 5x5 grid. Try again with better lighting.');
      }

    } catch (err) {
      console.error(err);
      setStatus('Error processing image.');
    }
  };

  // Heuristic: Try to find 5 lines with ~5 numbers each
  const parseGridFromText = (lines: Tesseract.Line[]): number[][] | null => {
    const numbers: number[] = [];
    
    // Flatten all recognized logic into a stream of numbers
    lines.forEach(line => {
      const lineNums = line.text.match(/\d+/g);
      if (lineNums) {
        lineNums.forEach(n => numbers.push(parseInt(n, 10)));
      }
    });

    // We need at least 24 numbers (center is free) or 25
    if (numbers.length < 24) return null;

    // Naive 5x5 construct taking the first 25 found numbers
    // Note: detailed geometric analysis would be better, but this is a V1
    const grid: number[][] = [];
    let ptr = 0;
    
    for (let r = 0; r < 5; r++) {
      const row: number[] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) {
          row.push(0); // FREE space logic, might need adjustment if OCR reads "FREE"
        } else {
          row.push(numbers[ptr] || 0); // fallback to 0 if we run out
          ptr++;
        }
      }
      grid.push(row);
    }

    return grid;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Scan Bingo Card</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        
        <input
          type="file"
          accept="image/*"
          capture="environment" // Forces rear camera on mobile
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {!imageSrc && (
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => fileInputRef.current?.click()}
            sx={{ py: 4, width: '100%' }}
          >
            📸 Take Photo / Upload
          </Button>
        )}

        {imageSrc && (
          <Box sx={{ width: '100%', maxHeight: 300, overflow: 'hidden', borderRadius: 1, border: '1px solid #444' }}>
            <img src={imageSrc} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
          </Box>
        )}

        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>{status}</Typography>
          {status !== 'Idle' && <CircularProgress variant="determinate" value={progress * 100} />}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        {imageSrc && <Button onClick={() => { setImageSrc(null); setStatus('Idle'); }}>Retake</Button>}
      </DialogActions>
    </Dialog>
  );
};
