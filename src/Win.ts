import { WindowSize, IWin, Point } from './interface.js';
import { MIN_UNIT, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, DEFAULT_WINSIZE } from './constant.js';

export default class Win implements IWin {
  winElement: HTMLDivElement;
  readonly EVERY_POINT: Point[] = [];
  constructor(winSize?: WindowSize) {
    this.winElement = document.getElementById('win') as HTMLDivElement;

    this.resize(winSize ?? DEFAULT_WINSIZE);
  }

  /**
   * Win 实例方法：重置棋盘尺寸、重新生成棋盘全坐标
   * @param winSize 重置时指定的棋盘尺寸对象
   */
  resize({ width, height }: WindowSize): void {
    this.width = width;
    this.height = height;

    // 重置棋盘尺寸时 重新生成棋盘全坐标
    this.EVERY_POINT.splice(0, this.EVERY_POINT.length);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.EVERY_POINT.push({ x, y });
      }
    }
  }

  get width(): number {
    return this.winElement.clientWidth / MIN_UNIT
  }
  private set width(value: number) {
    // 限定最大值和最小值：[MIN_WIDTH, MAX_WIDTH]
    if (value < MIN_WIDTH) value = MIN_WIDTH;
    else if (value > MAX_WIDTH) value = MAX_WIDTH;
    this.winElement.style.width = value * MIN_UNIT + 'px';
  }
  get height(): number {
    return this.winElement.clientHeight / MIN_UNIT
  }
  private set height(value: number) {
    // 限定最大值和最小值：[MIN_HEIGHT, MAX_HEIGHT]
    if (value < MIN_HEIGHT) value = MIN_HEIGHT;
    else if (value > MAX_HEIGHT) value = MAX_HEIGHT;
    this.winElement.style.height = value * MIN_UNIT + 'px';
  }
}