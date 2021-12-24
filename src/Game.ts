import { Point, MoveDirection, ISnakeChunk } from './interface.js';
import { DEFAULT_TIMEOUT, DEFAULT_ISALIVE, DEFAULT_NOCLIP, DEFAULT_DECLINE, DEFAULT_FOOD_POINT } from './constant.js';

import $ from './lib.js';
import Win from './Win.js';
import Info from './Info.js';
import Food from './Food.js';
import Snake from './Snake.js';

export default class Game extends EventTarget {
  private win: Win;
  private info: Info;
  private food: Food;
  private snake: Snake;

  /** 游戏主循环 的 基础延迟 */
  private timeout: number;
  /** 蛇 存活状态 */
  isAlive: boolean;
  /** 穿墙模式 开启状态 */
  private noclip: boolean;

  constructor(timeout?: number, isAlive?: boolean, noclip?: boolean) {
    super();

    this.timeout = timeout ?? DEFAULT_TIMEOUT;
    this.isAlive = isAlive ?? DEFAULT_ISALIVE;
    this.noclip = noclip ?? DEFAULT_NOCLIP;

    // Win,Info类 能够自行完成初始化
    this.win = new Win();
    this.info = new Info();

    // Food,Snake类 不能自行完成初始化，因为存在代码逻辑提升
    this.food = new Food();
    this.snake = new Snake();

    // 执行 初始化函数
    this.init();
    // 执行 游戏主循环（可优化为外部控制）
    if (this.isAlive) this.main();
  }

  // 仅在 new Game() 时 调用一次
  private init(): void {
    const { win, food, snake } = this;

    // 判断是否为穿墙模式更改win元素style.borderStyle为 虚线
    if (this.noclip) win.winElement.style.borderStyle = 'dashed';

    // 1. snake 首次渲染render
    win.winElement.appendChild(snake.snakeChunks[0].element);
    // 2. snake 监听keyup事件：UDLR | 控制 Snake 预期移动方向
    document.addEventListener('keyup', evt => {
      // 条件1：游戏循环暂停时不可改变预期移动方向
      if (!this.isAlive) return;

      // 条件2：不可预期地向 snakeChunks[1] 的坐标上移动
      const { x, y }: Point = snake.snakeChunks[0].point;
      if (snake.snakeChunks[1]) {
        if (x === snake.snakeChunks[1].point.x && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown'))
          return;
        else if (y === snake.snakeChunks[1].point.y && (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight'))
          return;
      }

      switch (evt.key) {
        case 'ArrowUp':
          snake.moveDirection = MoveDirection.UP;
          break;
        case 'ArrowDown':
          snake.moveDirection = MoveDirection.DOWN;
          break;
        case 'ArrowLeft':
          snake.moveDirection = MoveDirection.LEFT;
          break;
        case 'ArrowRight':
          snake.moveDirection = MoveDirection.RIGHT;
          break;
      }
    });

    // 1. food 重绘redraw
    this.foodRedraw(DEFAULT_FOOD_POINT);
    // 2. food 首次渲染render
    win.winElement.append(food.foodElement);
  }

  // 游戏主循环：Snake.move（移动渲染 + 碰撞检测）
  main(): void {
    this.bumpDetection(this.snakeRefresh());

    if (this.isAlive) setTimeout(this.main.bind(this), this.timeout);
  }

  // 重开游戏
  reset(): void {
    const { info, snake } = this;

    // 初始化 循环基础延迟
    for (let lv = 0; lv < info.level; lv++) {
      this.timeout += DEFAULT_DECLINE;
    }
    console.log('Level Reset (SPEED):', this.timeout);

    // 初始化 计分板info
    info.init();

    // 初始化 蛇的长度、位置、移动方向
    snake.init();

    // 初始化 食物位置
    this.foodRedraw();

    if (!this.isAlive) {
      this.isAlive = true;
      this.main();
    }
  }

  /* ----- ----- ----- ----- ----- < 高级功能：代码逻辑提升 Food, Snake > ----- ----- ----- ----- ----- */

  /** food 重绘方法：重置 food.point */
  private foodRedraw(xy?: Point): void {
    const { food } = this;
    // 获取空点（不能出现在蛇身上 & 食物自身）
    food.point = xy ?? this.getRandomEmptyPoint();
  }
  /** 获取棋盘随机空坐标 */
  private getRandomEmptyPoint(): Point {
    const { win, snake } = this;
    // 根据 棋盘全坐标列表win.EVERY_POINT 生成 可供随机的空坐标索引列表emptyPointIndex
    const emptyPointIndex: number[] = win.EVERY_POINT.map(({ x, y }, index) => {
      for (const { point } of snake.snakeChunks) {
        if (x === point.x && y === point.y) index = -1;
      }
      return index;
    }).filter(index => index >= 0);
    return win.EVERY_POINT[$.rangeLs(emptyPointIndex)];
  }

  /** Snake 刷新方法：移动渲染 */
  private snakeRefresh(): Point {
    const { win, snake } = this;
    const head: ISnakeChunk = snake.snakeChunks[0];
    // 记录 蛇头,蛇尾 的 原始坐标
    const { x, y }: Point = head.point;
    const { point }: ISnakeChunk = snake.snakeChunks.slice(-1)[0];
    // 改变 蛇头的坐标
    switch (snake.moveDirection) {
      case MoveDirection.UP:
        // 穿墙模式
        if (this.noclip && y - 1 < 0)
          head.point = { x, y: win.height - 1 };
        // 非穿墙模式
        else
          head.point = { x, y: y - 1 };
        break;
      case MoveDirection.DOWN:
        if (this.noclip && y + 1 > win.height - 1)
          head.point = { x, y: 0 };
        else
          head.point = { x, y: y + 1 };
        break;
      case MoveDirection.LEFT:
        if (this.noclip && x - 1 < 0)
          head.point = { x: win.width - 1, y };
        else
          head.point = { x: x - 1, y };
        break;
      case MoveDirection.RIGHT:
        if (this.noclip && x + 1 > win.width - 1)
          head.point = { x: 0, y };
        else
          head.point = { x: x + 1, y };
        break;
    }
    // 改变 蛇尾body[-1] 坐标为临时的蛇头坐标
    // 改变 蛇尾body[-1] 索引为 body[0]：移动 snakeChunks[-1] 到索引 [1]
    if (snake.snakeChunks.length >= 2) {
      snake.snakeChunks.splice(1, 0, snake.snakeChunks.pop()!);
      snake.snakeChunks[1].point = { x, y };
    }
    // 返回 snakeChunk[-1]原本的坐标用于为 takeFood方法增加的蛇块 设置坐标
    return point;
  }

  /* ----- ----- ----- ----- ----- < 游戏核心：碰撞检测 > ----- ----- ----- ----- ----- */

  private bumpDetection(snakeTailXY: Point): void {
    const { win, info, food, snake } = this;

    // 获取 蛇头坐标
    const { x, y }: Point = snake.snakeChunks[0].point;

    // if 撞到食物：触发 takeFood方法
    if (x === food.point.x && y === food.point.y) {
      // 在 body[-1]原坐标 生成新蛇块 + 首次渲染
      snake.increase(snakeTailXY);
      win.winElement.appendChild(snake.snakeChunks.slice(-1)[0].element);

      // 得分 + 升级回调事件：增加蛇的速度（降低主循环延迟）
      info.scoring(food.foodScore, () => {
        this.timeout -= DEFAULT_DECLINE;
        console.log('Level Up (SPEED):', this.timeout);
      });

      // if 蛇的长度 达到极限（w*h）：结束游戏（获胜）
      if (snake.snakeChunks.length === win.width * win.height) {
        this.gameover(true);
      }
      // elif 分数 达到目标分数（?）：结束游戏（获胜）
      else if (info.score >= Infinity) {
        this.gameover(true);
      }
      // else ：食物重绘
      else {
        this.foodRedraw();
      }
    }
    // elif 撞到墙或障碍物：结束游戏（失败）
    else if (x < 0 || x > win.width - 1 || y < 0 || y > win.height - 1) {
      this.gameover(false);
    }
    // elif 撞到自身：结束游戏（失败）
    else if (snake.snakeChunks.slice(1).some(({ point }: ISnakeChunk) => x === point.x && y === point.y)) {
      this.gameover(false);
    }
    // [else ：正常移动]
  }

  private gameover(result: boolean): void {
    this.isAlive = false;

    // 使用 0延迟 的异步函数让当前的 main函数 退出
    setTimeout(() => {
      const { info } = this;
      this.dispatchEvent(new CustomEvent('gameover', {
        detail: {
          result: result,
          score: info.score
        }
      }));
    });
  }
}