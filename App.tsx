
import React, { useState, useEffect, useCallback } from 'react';
import { Coordinate, Direction } from './types';
import {
  BOARD_SIZE,
  INITIAL_SNAKE_POSITION,
  INITIAL_FOOD_POSITION,
  INITIAL_DIRECTION,
  INITIAL_SPEED_MS,
  SPEED_INCREMENT,
} from './constants';

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const RestartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);


const App: React.FC = () => {
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE_POSITION);
  const [food, setFood] = useState<Coordinate>(INITIAL_FOOD_POSITION);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED_MS);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setFood(INITIAL_FOOD_POSITION);
    setDirection(INITIAL_DIRECTION);
    setSpeed(INITIAL_SPEED_MS);
    setIsGameOver(false);
    setIsRunning(false);
    setScore(0);
  }, []);

  const generateFood = useCallback((snakeBody: Coordinate[]): Coordinate => {
    while (true) {
      const newFoodPosition = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      if (!snakeBody.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y)) {
        return newFoodPosition;
      }
    }
  }, []);

  const gameLoop = useCallback(() => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case Direction.UP:
        head.y -= 1;
        break;
      case Direction.DOWN:
        head.y += 1;
        break;
      case Direction.LEFT:
        head.x -= 1;
        break;
      case Direction.RIGHT:
        head.x += 1;
        break;
    }

    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      setIsGameOver(true);
      setIsRunning(false);
      return;
    }

    for (let i = 1; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        setIsGameOver(true);
        setIsRunning(false);
        return;
      }
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 1);
      setFood(generateFood(newSnake));
      setSpeed(prev => Math.max(50, prev - SPEED_INCREMENT));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, generateFood]);
  
  useEffect(() => {
    if (!isRunning || isGameOver) {
      return;
    }
    const interval = setInterval(gameLoop, speed);
    return () => clearInterval(interval);
  }, [isRunning, isGameOver, speed, gameLoop]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== Direction.DOWN) setDirection(Direction.UP);
        break;
      case 'ArrowDown':
        if (direction !== Direction.UP) setDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
        if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
        if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
        break;
      case ' ': // Spacebar to toggle pause/play
         if(!isGameOver) {
            setIsRunning(prev => !prev);
         }
        break;
    }
  }, [direction, isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getCellClass = (x: number, y: number): string => {
    const isSnakeHead = snake[0].x === x && snake[0].y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    if (isSnakeHead) return 'bg-cyan-400 rounded-sm';
    if (isSnakeBody) return 'bg-cyan-500 rounded-sm';
    if (isFood) return 'bg-red-500 rounded-full';
    return 'bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">React Snake</h1>
          <div className="text-xl md:text-2xl">Score: <span className="font-bold text-red-500">{score}</span></div>
        </header>

        <div className="relative aspect-square w-full bg-gray-700 p-1 rounded-lg shadow-2xl shadow-cyan-500/10">
          <div className="grid grid-cols-20 gap-px" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
            {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
              const x = i % BOARD_SIZE;
              const y = Math.floor(i / BOARD_SIZE);
              return (
                <div key={i} className="aspect-square">
                  <div className={`w-full h-full ${getCellClass(x, y)} transition-colors duration-100`}></div>
                </div>
              );
            })}
          </div>
          
          {(!isRunning && !isGameOver) && (
             <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                <button 
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-4 bg-cyan-500 text-gray-900 font-bold rounded-lg text-2xl hover:bg-cyan-400 transition-all transform hover:scale-105"
                >
                  Start Game
                </button>
             </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
              <h2 className="text-5xl font-extrabold text-red-500 mb-2">Game Over</h2>
              <p className="text-2xl mb-6">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-cyan-500 text-gray-900 font-bold rounded-lg text-xl hover:bg-cyan-400 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <RestartIcon className="w-6 h-6" />
                Play Again
              </button>
            </div>
          )}
        </div>

        <footer className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setIsRunning(prev => !isGameOver && !prev)}
            disabled={isGameOver}
            className="p-3 bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            aria-label={isRunning ? "Pause" : "Play"}
          >
            {isRunning ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
          </button>
          <button
            onClick={resetGame}
            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            aria-label="Restart"
          >
            <RestartIcon className="w-8 h-8"/>
          </button>
        </footer>
        <p className="text-center text-gray-500 mt-4 text-sm">Use Arrow Keys to move & Spacebar to pause/resume.</p>
      </div>
    </div>
  );
};

export default App;
