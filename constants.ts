
import { Coordinate, Direction } from './types';

export const BOARD_SIZE = 20;
export const INITIAL_SPEED_MS = 200;
export const SPEED_INCREMENT = 5;

export const INITIAL_SNAKE_POSITION: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_FOOD_POSITION: Coordinate = { x: 15, y: 15 };

export const INITIAL_DIRECTION = Direction.RIGHT;
