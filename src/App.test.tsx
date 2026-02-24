import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders bingo board', () => {
  render(<App />);
  const titleElement = screen.getByText(/Kroutt Bingo Night/i);
  expect(titleElement).toBeInTheDocument();
});
