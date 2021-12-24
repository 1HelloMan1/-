import { Point, MoveDirection, ISnake, ISnakeChunk } from './interface.js';
import { MIN_UNIT, DEFAULT_SNAKE_POINT, DEFAULT_SNAKE_MOVEDIRECTION } from './constant.js';

export default class Snake implements ISnake {
  snakeChunks: SnakeChunk[];
  moveDirection: MoveDirection;
  constructor(xy?: Point) {
    const snakeChunk: SnakeChunk = new SnakeChunk(xy);
    snakeChunk.element.classList.add('snake-head');
    this.snakeChunks = [snakeChunk];

    this.moveDirection = DEFAULT_SNAKE_MOVEDIRECTION;
  }

  increase(snakeTailXY: Point): void {
    this.snakeChunks.push(new SnakeChunk(snakeTailXY));
  }

  init(): void {
    // 移除 bodys[] 元素 + 初始化 蛇头坐标
    while (this.snakeChunks.length !== 1) {
      this.snakeChunks.pop()!.element.remove();
    }
    this.snakeChunks[0].point = DEFAULT_SNAKE_POINT;
    // 初始化 移动方向
    this.moveDirection = DEFAULT_SNAKE_MOVEDIRECTION;
  }
}

class SnakeChunk implements ISnakeChunk {
  element: HTMLDivElement;
  constructor(xy?: Point) {
    const snakeChunkElement: HTMLDivElement = document.createElement('div');
    snakeChunkElement.className = 'snake-chunk';
    this.element = snakeChunkElement;

    this.point = xy ?? DEFAULT_SNAKE_POINT;
  }

  // 获取 & 设置：蛇块坐标
  get point(): Point {
    return {
      x: +this.element.style.left.match(/^-?\d+/)! / MIN_UNIT,
      y: +this.element.style.top.match(/^-?\d+/)! / MIN_UNIT
    };
  }
  set point({ x, y }: Point) {
    this.element.style.left = x * MIN_UNIT + 'px';
    this.element.style.top = y * MIN_UNIT + 'px';
  }
}