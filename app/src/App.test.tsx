import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Notification Demo title', () => {
  render(<App />);
  expect(screen.getByText(/Notification Demo/i)).toBeInTheDocument();
});


