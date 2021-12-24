import { MIN_UNIT, DEFAULT_SNAKE_POINT, DEFAULT_SNAKE_MOVEDIRECTION } from './constant.js';
export default class Snake {
    constructor(xy) {
        const snakeChunk = new SnakeChunk(xy);
        snakeChunk.element.classList.add('snake-head');
        this.snakeChunks = [snakeChunk];
        this.moveDirection = DEFAULT_SNAKE_MOVEDIRECTION;
    }
    increase(snakeTailXY) {
        this.snakeChunks.push(new SnakeChunk(snakeTailXY));
    }
    init() {
        while (this.snakeChunks.length !== 1) {
            this.snakeChunks.pop().element.remove();
        }
        this.snakeChunks[0].point = DEFAULT_SNAKE_POINT;
        this.moveDirection = DEFAULT_SNAKE_MOVEDIRECTION;
    }
}
class SnakeChunk {
    constructor(xy) {
        const snakeChunkElement = document.createElement('div');
        snakeChunkElement.className = 'snake-chunk';
        this.element = snakeChunkElement;
        this.point = xy !== null && xy !== void 0 ? xy : DEFAULT_SNAKE_POINT;
    }
    get point() {
        return {
            x: +this.element.style.left.match(/^-?\d+/) / MIN_UNIT,
            y: +this.element.style.top.match(/^-?\d+/) / MIN_UNIT
        };
    }
    set point({ x, y }) {
        this.element.style.left = x * MIN_UNIT + 'px';
        this.element.style.top = y * MIN_UNIT + 'px';
    }
}
