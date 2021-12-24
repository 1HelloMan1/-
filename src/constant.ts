import { Point, WindowSize, MoveDirection } from './interface.js';

/** 棋盘最小单位（ 1x 游戏单位） */
export const MIN_UNIT: number = 10;

/** Win.width 允许设置的最小宽度 */
export const MIN_WIDTH: number = 2;

/** Win.height 允许设置的最小高度 */
export const MIN_HEIGHT: number = 2;

/** Win.width 允许设置的最大宽度 */
export const MAX_WIDTH: number = 50;

/** Win.height 允许设置的最大高度 */
export const MAX_HEIGHT: number = 50;

/** new Win() 棋盘默认尺寸（游戏单位） */
export const DEFAULT_WINSIZE: WindowSize = { width: 20, height: 20 };

/** Info.scoring() 默认计分分数 */
export const DEFAULT_SCORE: number = 1;

/** Info.level 允许设置的最大等级 */
export const MAX_LEVEL: number = 10;

/** Info.upgradeScore() 计算升级分数的分数基数 */
export const BASE_SCORE: number = 3;

/** new Food() 食物默认分数 */
export const DEFAULT_FOODSCORE: number = 1;

/** Game init().foodRedraw() 食物默认坐标 */
export const DEFAULT_FOOD_POINT: Point | undefined = { x: 15, y: 15 };

/** new SnakeChunk() 蛇默认坐标 */
export const DEFAULT_SNAKE_POINT: Point = { x: 0, y: 0 };

/** new Snake() 蛇默认移动方向 */
export const DEFAULT_SNAKE_MOVEDIRECTION: MoveDirection = MoveDirection.RIGHT;

/** new Game() 游戏 默认 主循环延迟 */
export const DEFAULT_TIMEOUT: number = 300;

/** new Game() 游戏 默认 isAlive 状态 */
export const DEFAULT_ISALIVE: boolean = true;

/** new Game() 游戏 默认 穿墙模式开启状态 */
export const DEFAULT_NOCLIP: boolean = false;

/** Game 升级或重开事件中 主循环延迟的 默认 递减量 */
export const DEFAULT_DECLINE: number = 20;