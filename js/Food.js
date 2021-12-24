import { MIN_UNIT, DEFAULT_FOODSCORE } from './constant.js';
export default class Food {
    constructor(foodScore = DEFAULT_FOODSCORE) {
        this.foodScore = foodScore;
        const foodElement = document.createElement('div');
        foodElement.innerHTML = '<div></div><div></div><div></div><div></div>';
        foodElement.className = 'food';
        this.foodElement = foodElement;
    }
    get point() {
        return {
            x: +this.foodElement.style.left.match(/^\d+/) / MIN_UNIT,
            y: +this.foodElement.style.top.match(/^\d+/) / MIN_UNIT
        };
    }
    set point({ x, y }) {
        this.foodElement.style.left = x * MIN_UNIT + 'px';
        this.foodElement.style.top = y * MIN_UNIT + 'px';
    }
}
