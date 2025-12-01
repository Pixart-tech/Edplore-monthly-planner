import { render, screen } from '@testing-library/react';
import App from './App';

it('renders planner steps', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /pick a class, month, and day to view lessons/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /choose a class/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /select a month/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /pick a day/i })).toBeInTheDocument();
});
