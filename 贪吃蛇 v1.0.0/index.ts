/* TS类型断言方式：
  1. ... as 类型
  2. <类型> ...
  3. ... ! 非空断言（undef | null）
*/

/* Node.appendChild() 方法：
  如果给定的子节点是对文档中现有节点的引用，则将其从当前位置移动到新位置
  重复调用固然可以，但性能打折，等同于整个节点重新渲染
  参考：https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
*/

/* 类实例之间调用的问题：设计模式问题
  在编写类实例方法时，可能遇到需要调用别的类实例的方法的需求，有两种解决：
  1.  继承。存在的问题：单一类只能继承一个，且‘兄弟类’
  2.  形参，传值。
*/

/* 接口声明问题：
  0. 已知接口中允许的关键字：readonly、get、set、new
  1. 如何声明 静态的属性或方法？（GAME_UNIT）
  2. 如何声明 私有/保护的属性或方法？（winElement等）
  3. 如何正确声明 get属性和set方法？（winSize 和 randomX/Y）
*/

/* 游戏主循环：
  1. 每轮循环更新蛇的位置，蛇的行进方向由蛇自身的属性决定
  2. 每轮循环需要判断游戏的失败或胜利条件：
    失败条件：
    1. 蛇撞到边框或撞到自身
    胜利条件：
    1. 全胜利：蛇的长度为游戏窗口宽高的乘积
    2. 条件胜利：每一等级需要吃到一定分数则晋级下一关
  3. 产生特殊事件，增加游戏趣味性：
    1. 限时蛇的移动速度降低果实
      游戏循环为无延迟循环，蛇的运动有冷却（运动后x轮循环或x秒后不可再运动），
      增加蛇的速度等于减少蛇的运动冷却。
    2. 限时高分果实：3倍Food得分
    3. 限时果实：无界边框
      边框变为虚线时，可以出边框从另一侧出来
*/

/* 游戏扩展性优化：
  1. 可模块化的地图设计
    地图边缘或中间可以存在墙体
*/

/* Web端的高速循环用哪个方法更好？区别是什么？浏览器特殊的 setInterval最低4ms的循环限制是否影响？
 1. while(true) { ... } // 无法实现：循环时页面卡死
 2. setInterval(()=>{...})
*/

// 测试多种循环方式的钟差表现
/* function fn(callback: () => void): void {
  callback();
  setTimeout(fn, 1000, callback);
}
fn($.clockerDiff(undefined, 1000)); */
/* const clocker = $.clockerDiff(undefined, 1000);
setInterval(clocker, 1000); */
/* const gameLoop = new Loop($.clockerDiff(undefined, 1000));
gameLoop.appendHandler(new Game()); */

/* ----- ----- ----- ----- ----- < 自定义库方法 > ----- ----- ----- ----- ----- */
const $ = {
  // 取区间整数
  range(min?: number, max?: number): number { // TS 在 Math 上添加 range 方法时报错
    // 形参省略规则：
    //   1. range(1, 10) // 1~10
    //   2. range(10) // 0~10
    //   3. range() // 0~1
    let minTmp: number,
      maxTmp: number;
    switch (arguments.length) {
      case 0:
        minTmp = 0;
        maxTmp = 1;
        break;
      case 1:
        minTmp = 0;
        maxTmp = min ?? 1;
        break;
      default:
        minTmp = min ?? 0;
        maxTmp = max ?? 1;
    }
    return Math.floor(Math.random() * (maxTmp - minTmp + 1)) + minTmp;
  },
  // 取随机列表项
  rangeLs(list: number[]) {
    // 生成器：每次调用不重复的返回一项随机列表项，直到全部返回后返回null
  },
  // interval间隔节流函数
  throttleInterval(handler: () => void, timeout: number): () => void {
    let timer: number | undefined;
    return () => {
      if (timer) return;
      handler();
      timer = setTimeout(() => { timer = undefined }, timeout);
    }
  },
  // looporder环序节流函数
  throttleLooporder(handler: () => void, count: number): () => void {
    let currentCount: number = 0;
    return () => {
      if (currentCount-- != 0) return;
      handler();
      currentCount = count;
    }
  },
  // 钟差函数：闭包函数，计算每次调用的时间差
  clockerDiff(signId: string = new Date().getTime().toString()) {
    let preTime: number | undefined;
    return () => {
      const curTime: number = new Date().getTime();
      console.log('diffTime [' + signId + ']', (preTime === undefined ? '-0' : curTime - preTime));
      preTime = curTime;
    }
  }
};

/* ----- ----- ----- ----- ----- < 接口文档 > ----- ----- ----- ----- ----- */
type Point = { x: number, y: number };
type Handler = (() => void) | (() => void)[] | { [integer: string]: (() => void) | (() => void)[] };
type HandlerObject = Handler | { interval?: Handler, looporder?: Handler };
type LoopOptions = { timeout?: number, interval?: number, looporder?: number, isActived?: boolean };
interface ILoop {
  readonly isActived: boolean,
  options: LoopOptions,
  actived(): void,
  break(): void,
  appendHandler(handlerObject: HandlerObject): void,
  removeHandler(handlerObject: HandlerObject): void,
}
interface IGame {
  readonly GAME_UNIT: number,
  readonly winSize: { width: number, height: number },
  winElement: HTMLElement,
  level: number,
  score: number,
}
interface ISnakeChunk {
  element: HTMLElement,
  point: Point,
}
interface ISnake {
  snakeChunks: SnakeChunk[]
  moveDirection: MoveDirection,
  move(): void,
}
interface IFood {
  readonly foodScore: number,
  element: HTMLElement,
  point: Point,
  render(xy?: Point): void,
}
enum MoveDirection {
  UP, DOWN, LEFT, RIGHT
}

/* ----- ----- ----- ----- ----- < 定义‘单例’类 > ----- ----- ----- ----- ----- */
// Loop类 创建 loop实例：用于控制在主循环中事件函数的触发（多个循环互不影响）
class Loop implements ILoop {
  /* 需求：init函数、actived回调、break回调 */
  constructor(handlerObject: HandlerObject = {}, public options: LoopOptions = {}) {
    this.handlers = this.throttle(handlerObject);
    if (this.options.isActived ?? true) this.actived();
  }

  // 主循环 ID
  private timmer: number | undefined;
  // 主循环遍历的处理程序数组
  private handlers: (() => void)[];

  // 加工 handlerObject 对象，返回 (()=>void)[]
  private throttle(handlerObject: HandlerObject): (() => void)[] {
    const TIMEOUT: number = this.options.interval ?? 1000;
    const COUNT: number = this.options.looporder ?? 100;
    function interval(handler: () => void, timeout: number): () => void {
      let timer: number | undefined;
      return () => {
        if (timer) return;
        handler();
        timer = setTimeout(() => { timer = undefined }, timeout);
      }
    }
    function looporder(handler: () => void, count: number): () => void {
      let currentCount: number = 0;
      return () => {
        if (currentCount-- != 0) return;
        handler();
        currentCount = count;
      }
    }

    function factory(handlerObj: Handler, throttling: (handler: () => void, integer: number) => (() => void), defaultInterger: number): (() => void)[] {
      const _handlers: (() => void)[] = [];
      if (typeof handlerObj === 'function') {
        _handlers.push(throttling(handlerObj, defaultInterger));
      } else if (handlerObj instanceof Array) {
        _handlers.push(...handlerObj.map(handler => throttling(handler, defaultInterger)));
      } else {
        // 需要考虑到实参为 {}空对象 时的处理方法。
        for (const [integer, _handler] of Object.entries(handlerObj) as [string, (() => void) | (() => void)[]][]) {
          // 过滤对象，只对满足匹配条件的属性加工
          if (/^(0|[1-9]\d*)$/.test(integer)) {
            _handlers.push(..._handler instanceof Array
              ? _handler.map(handler => throttling(handler, +integer))
              : [throttling(_handler, +integer)]
            );
          }
        }
      }
      return _handlers;
    }

    const handlers: (() => void)[] = [];
    if (typeof handlerObject === 'object' && !(handlerObject instanceof Array) && (handlerObject.hasOwnProperty('interval') || handlerObject.hasOwnProperty('looporder'))) {
      if (handlerObject.interval !== undefined) {
        handlers.push(...factory(handlerObject.interval, interval, TIMEOUT));
      }
      if (handlerObject.looporder !== undefined) {
        handlers.push(...factory(handlerObject.looporder, looporder, COUNT));
      }
    } else {
      handlers.push(...factory(<Handler>handlerObject, interval, TIMEOUT));
    }
    return handlers;
  }

  // 激活 主循环
  actived(): void {
    if (this.timmer) return;
    this.timmer = setInterval(() => this.handlers.forEach(handler => {
      // 遍历 handlers处理函数数组 时检查到期标志，移除或执行。
      if (false) {

      } else {
        handler();
      }
    }), this.options.timeout);
  }

  // 跳出 主循环
  break(): void {
    this.timmer = clearInterval(this.timmer) as undefined;
  }

  // 解析处理 HandlerObject 类型，追加到 handlers 数组
  appendHandler(handlerObject: HandlerObject): void {
    this.handlers.push(...this.throttle(handlerObject));
  }

  // 根据条件，移除 handlers 数组中的函数
  removeHandler(_handlerObject: HandlerObject): void {
    // 目前没有办法在实例方法中实现该功能，原因在于：this.handlers 打印出完全一样的函数列表，原理未知。
    console.warn('Unable: Loop.handlers', this.handlers);
  }

  // 获取：主循环被激活状态
  get isActived(): boolean {
    return this.timmer ? true : false;
  }
}

// Info类 创建 info实例：用于游戏信息及内容的更新显示
class Game implements IGame {
  constructor() {
    this.levelElement = document.getElementById('level') as HTMLElement;
    this.scoreElement = document.getElementById('score') as HTMLElement;
    this.winElement = document.getElementById('win') as HTMLElement;

    for (let x = 0; x < this.winSize.width; x++) {
      for (let y = 0; y < this.winSize.height; y++) {
        this.FULL_POINTS.push([x, y]);
      }
    }
  }

  // 游戏单位（与像素单位的比例 1:10）
  readonly GAME_UNIT: number = 10;
  // 游戏棋盘全部坐标点
  readonly FULL_POINTS: [number, number][] = [];

  private levelElement: HTMLElement;
  private scoreElement: HTMLElement;
  winElement: HTMLElement;

  // 获取 & 设置：等级level | 得分score
  get level(): number {
    return +this.levelElement.innerText;
  }
  set level(value: number) {
    this.levelElement.innerText = value.toString();
  }
  get score(): number {
    return +this.scoreElement.innerText;
  }
  set score(value: number) {
    this.scoreElement.innerText = value.toString();
  }

  // 获取：游戏窗口尺寸winSize（游戏单位）
  get winSize(): { width: number, height: number } {
    return {
      width: this.winElement.clientWidth / this.GAME_UNIT,
      height: this.winElement.clientHeight / this.GAME_UNIT
    }
  }
}

class Food implements IFood {
  constructor(xy?: Point, readonly foodScore: number = 1) {
    const foodElement: HTMLElement = document.createElement('div');
    foodElement.innerHTML = '<div></div><div></div><div></div><div></div>';
    foodElement.className = 'food';
    this.element = foodElement;

    this.render(xy);
  }

  element: HTMLElement;

  // 获取 & 设置：食物坐标
  get point(): Point {
    return {
      x: +this.element.style.left.match(/^\d+/)! / game.GAME_UNIT,
      y: +this.element.style.top.match(/^\d+/)! / game.GAME_UNIT
    };
  }
  set point({ x, y }: Point) {
    this.element.style.left = x * game.GAME_UNIT + 'px';
    this.element.style.top = y * game.GAME_UNIT + 'px';
  }

  // 渲染|刷新：Food 的方法
  render(xy?: Point): void {
    // 获取空点（不能出现在蛇身上 & 食物自身）
    function getEmptyPoint(): Point {
      // 根据 棋盘全坐标列表game.FULL_POINTS 生成 可供随机的坐标索引列表pointIndex[0, ..., 899]
      const pointIndex: number[] = [];
      for (let i = 0; i < game.FULL_POINTS.length; i++) {
        pointIndex.push(i);
      }
      // 遍历 snake.snakeChunks 排除蛇存在坐标
      for (const chunk of snake.snakeChunks) {
        const { x, y }: Point = chunk.point;
        // 遍历 game.FULL_POINTS 从 pointIndex 删除值匹配的索引
        for (let i = 0; i < game.FULL_POINTS.length; i++) {
          const [_x, _y] = game.FULL_POINTS[i];
          if (x === _x && y === _y) {
            pointIndex.splice(pointIndex.indexOf(i), 1);
            break;
          }
        }
      }
      const [x, y] = game.FULL_POINTS[$.range(pointIndex.length - 1)];
      return { x, y };
    }

    this.point = xy ?? getEmptyPoint();

    // 根据 此元素有无父元素 区分 是否为首次渲染：执行 首次渲染 或 刷新
    if (!this.element.parentElement) {
      game.winElement.appendChild(this.element);
    } else {
      // 被吃掉后加分
      game.score += this.foodScore;
    }
  }
}

class Snake implements ISnake {
  constructor(xy?: Point) {
    const snakeChunk: SnakeChunk = new SnakeChunk(xy);
    snakeChunk.element.classList.add('snake-head');
    this.snakeChunks = [snakeChunk];

    this.moveDirection = MoveDirection.RIGHT;

    // keyup事件 控制 预期移动方向
    document.addEventListener('keyup', evt => {
      // 游戏循环暂停时不可改变预期移动方向
      if (!loop.isActived) return;
      // 不可预期地向 snakeChunks[1] 的坐标上移动
      const { x, y }: Point = this.snakeChunks[0].point;
      if (this.snakeChunks[1]) {
        if (x === this.snakeChunks[1].point.x && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown'))
          return;
        else if (y === this.snakeChunks[1].point.y && (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight'))
          return;
      }
      switch (evt.key) {
        case 'ArrowUp':
          this.moveDirection = MoveDirection.UP;
          break;
        case 'ArrowDown':
          this.moveDirection = MoveDirection.DOWN;
          break;
        case 'ArrowLeft':
          this.moveDirection = MoveDirection.LEFT;
          break;
        case 'ArrowRight':
          this.moveDirection = MoveDirection.RIGHT;
          break;
      }
    });
  }

  snakeChunks: SnakeChunk[];
  moveDirection: MoveDirection;

  // 循环中的移动方法
  move(): void {
    // 移动渲染
    const snakeTailPoint: Point = this.render();
    // 碰撞检测
    this.bumpDetection(snakeTailPoint);
  }

  private render(): Point {
    const head: SnakeChunk = this.snakeChunks[0];
    // 记录 蛇头 和 蛇尾 的 原始坐标
    const { x, y }: Point = head.point;
    const { point }: SnakeChunk = this.snakeChunks.slice(-1)[0];
    // 改变 蛇头的坐标
    switch (this.moveDirection) {
      case MoveDirection.UP:
        head.point = { x, y: y - 1 };
        break;
      case MoveDirection.DOWN:
        head.point = { x, y: y + 1 };
        break;
      case MoveDirection.LEFT:
        head.point = { x: x - 1, y };
        break;
      case MoveDirection.RIGHT:
        head.point = { x: x + 1, y };
        break;
    }
    // 改变body[-1]的坐标为临时的蛇头坐标，同时也要改变body[-1]的索引为body[0]（移动snakeChunks[-1]的索引为[1]）
    if (this.snakeChunks.length >= 2) {
      this.snakeChunks.splice(1, 0, this.snakeChunks.pop()!);
      this.snakeChunks[1].point = { x, y };
    }
    // 返回 snakeChunk[-1]原本的坐标用于为 takeFood增加的蛇块 设置坐标
    return point;
  }

  private bumpDetection(snakeTailXY: Point) {
    const { x, y }: Point = this.snakeChunks[0].point;
    // if 撞到食物：触发 takeFood方法
    if (x === food.point.x && y === food.point.y) {
      this.takeFood(snakeTailXY);
    }
    // elif 撞到墙或障碍物：结束游戏（失败）
    else if (x < 0 || x > game.winSize.width - 1 || y < 0 || y > game.winSize.height - 1) {
      this.gameover(false);
    }
    // elif 撞到自身：结束游戏（失败）
    else if (this.snakeChunks.slice(1).some(({ point }: SnakeChunk) => x === point.x && y === point.y)) {
      this.gameover(false);
    }
    // [else 正常移动]
  }

  private takeFood(snakeTailXY: Point): void {
    // 在 body[-1]原坐标 处生成新蛇块
    this.snakeChunks.push(new SnakeChunk(snakeTailXY));
    // if 蛇的长度 达到极限（w*h）：结束游戏（获胜）
    if (this.snakeChunks.length === game.winSize.width * game.winSize.height) {
      this.gameover(true);
    }
    // else 触发：食物的refresh刷新方法
    else {
      food.render();
    }
  }

  private gameover(result: boolean): void {
    // 结束当前循环，显示游戏得分，提示是否重新游戏或保持结束画面
    loop.break();
    if (result) {
      console.log('游戏结束【成功】\n【得分】' + game.score);
    } else {
      console.log('游戏结束【失败】\n【得分】' + game.score);
    }
  }
}

// SnakeChunk类 创建 SnakeChunk实例：渲染蛇块、获取蛇块信息
class SnakeChunk implements ISnakeChunk {
  constructor(xy?: Point) {
    const snakeChunkElement = document.createElement('div');
    snakeChunkElement.className = 'snake-chunk';
    this.element = snakeChunkElement;

    this.point = xy ?? { x: 0, y: 0 };

    game.winElement.appendChild(this.element);
  }

  element: HTMLElement;

  // 获取 & 设置：单一蛇块坐标
  get point(): Point {
    return {
      x: +this.element.style.left.match(/^-?\d+/)! / game.GAME_UNIT,
      y: +this.element.style.top.match(/^-?\d+/)! / game.GAME_UNIT
    };
  }
  set point({ x, y }: Point) {
    this.element.style.left = x * game.GAME_UNIT + 'px';
    this.element.style.top = y * game.GAME_UNIT + 'px';
  }
}

/* ----- ----- ----- ----- ----- < 初始化 > ----- ----- ----- ----- ----- */
const loop = new Loop();
const game = new Game();
const snake = new Snake();
const food = new Food({ x: 15, y: 15 }); // food.render 依赖 snake.snakeChunks 需要后声明

// 在 游戏循环中 编排游戏事件
let flag = false;
loop.appendHandler({
  'interval': {
    // '0': $.clockerDiff('0'),
    // '100': snake.move.bind(snake),
    // '2000': food.render.bind(food), // 意外的加分
    '200': snake.move.bind(snake)
  },
  /* 'looporder': [
    // $.clockerDiff(),
    (): void => {
      // 外部中断 Loop.removeHandler() 的替代方案。
      if (flag) return console.log('外部中断...');
    }
  ] */
  /* 'looporder': {
    '10': snake.move.bind(snake)
  } */
});

/* ----- ----- ----- ----- ----- < 动态控制 > ----- ----- ----- ----- ----- */
document.addEventListener('keyup', evt => {
  if (evt.key === 'Escape') {
    if (loop.isActived) {
      loop.break();
    } else {
      loop.actived();
    }
  }
});



// 1. 代码重构优化：逻辑提升、更高级地定义棋盘大小
// 2. 手柄api + 穿墙 + 产生特殊事件 + 如何重开