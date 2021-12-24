export type WindowSize = { width: number, height: number };

export type Point = { x: number, y: number };

export type Handler = (() => void) | (() => void)[] | { [integer: string]: (() => void) | (() => void)[] };

export type HandlerObject = Handler | { interval?: Handler, looporder?: Handler };

export type LoopOptions = { timeout?: number, interval?: number, looporder?: number, isActived?: boolean };

export enum MoveDirection {
  UP, DOWN, LEFT, RIGHT
}

export interface ILoop {
  readonly isActived: boolean,
  options: LoopOptions,
  actived(): void,
  break(): void,
  appendHandler(handlerObject: HandlerObject): void,
  removeHandler(handlerObject: HandlerObject): void
}

export interface IWin {
  winElement: HTMLDivElement,
  readonly width: number,
  readonly height: number,
  readonly EVERY_POINT: Point[],
  resize(winSize: WindowSize): void
}

export interface IInfo {
  init(): void,
  readonly level: number,
  readonly score: number,
  scoring(score?: number, levelUp?: () => void): void
}

export interface IFood {
  readonly foodScore: number,
  foodElement: HTMLDivElement,
  point: Point,
}

export interface ISnake {
  snakeChunks: ISnakeChunk[]
  moveDirection: MoveDirection,
  increase(snakeTailXY: Point): void,
  init(): void
}

export interface ISnakeChunk {
  element: HTMLDivElement,
  point: Point
}