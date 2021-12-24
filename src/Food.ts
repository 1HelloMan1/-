import { Point, IFood } from './interface.js';
import { MIN_UNIT, DEFAULT_FOODSCORE } from './constant.js';

export default class Food implements IFood {
  foodElement: HTMLDivElement;
  constructor(readonly foodScore: number = DEFAULT_FOODSCORE) {
    const foodElement: HTMLDivElement = document.createElement('div');
    foodElement.innerHTML = '<div></div><div></div><div></div><div></div>';
    foodElement.className = 'food';
    this.foodElement = foodElement;
  }

  // 获取 & 设置：食物坐标
  get point(): Point {
    return {
      x: +this.foodElement.style.left.match(/^\d+/)! / MIN_UNIT,
      y: +this.foodElement.style.top.match(/^\d+/)! / MIN_UNIT
    };
  }
  set point({ x, y }: Point) {
    this.foodElement.style.left = x * MIN_UNIT + 'px';
    this.foodElement.style.top = y * MIN_UNIT + 'px';
  }
}