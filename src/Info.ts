import { IInfo } from './interface.js';
import { DEFAULT_SCORE, MAX_LEVEL, BASE_SCORE } from './constant.js';

export default class Info implements IInfo {
  private levelElement: HTMLSpanElement;
  private scoreElement: HTMLSpanElement;
  constructor() {
    this.levelElement = document.createElement('span');
    this.scoreElement = document.createElement('span');
    document.getElementById('level')!.appendChild(this.levelElement);
    document.getElementById('score')!.appendChild(this.scoreElement);

    this.init();
  }

  /** 初始化 等级level 和 分数score */
  init(): void {
    this.level = 0;
    this.score = 0;
  }

  get level(): number {
    return +this.levelElement.innerText;
  }
  private set level(value: number) {
    this.levelElement.innerText = value.toString();
  }
  get score(): number {
    return +this.scoreElement.innerText;
  }
  private set score(value: number) {
    this.scoreElement.innerText = value.toString();
  }

  /** 得分 判断升级，返回 速度timeout */
  scoring(score?: number, levelUp?: () => void): void {
    // 实际加分
    this.score += score ?? DEFAULT_SCORE;
    // 判断 总分是否到达升级条件 且 当前等级小于最大等级
    while (this.score >= this.upgradeScore(this.level) && this.level < MAX_LEVEL) {
      this.level += 1;
      if (levelUp !== undefined) levelUp();
    }
  }
  /** 总分升级条件：递归 */
  private upgradeScore(level: number): number {
    if (level === 0) return BASE_SCORE;
    return (level + 1) * BASE_SCORE + this.upgradeScore(level - 1);
  }
}