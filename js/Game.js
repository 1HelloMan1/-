import { MoveDirection } from './interface.js';
import { DEFAULT_TIMEOUT, DEFAULT_ISALIVE, DEFAULT_NOCLIP, DEFAULT_DECLINE, DEFAULT_FOOD_POINT } from './constant.js';
import $ from './lib.js';
import Win from './Win.js';
import Info from './Info.js';
import Food from './Food.js';
import Snake from './Snake.js';
export default class Game extends EventTarget {
    constructor(timeout, isAlive, noclip) {
        super();
        this.timeout = timeout !== null && timeout !== void 0 ? timeout : DEFAULT_TIMEOUT;
        this.isAlive = isAlive !== null && isAlive !== void 0 ? isAlive : DEFAULT_ISALIVE;
        this.noclip = noclip !== null && noclip !== void 0 ? noclip : DEFAULT_NOCLIP;
        this.win = new Win();
        this.info = new Info();
        this.food = new Food();
        this.snake = new Snake();
        this.init();
        if (this.isAlive)
            this.main();
    }
    init() {
        const { win, food, snake } = this;
        if (this.noclip)
            win.winElement.style.borderStyle = 'dashed';
        win.winElement.appendChild(snake.snakeChunks[0].element);
        document.addEventListener('keyup', evt => {
            if (!this.isAlive)
                return;
            const { x, y } = snake.snakeChunks[0].point;
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
        this.foodRedraw(DEFAULT_FOOD_POINT);
        win.winElement.append(food.foodElement);
    }
    main() {
        this.bumpDetection(this.snakeRefresh());
        if (this.isAlive)
            setTimeout(this.main.bind(this), this.timeout);
    }
    reset() {
        const { info, snake } = this;
        for (let lv = 0; lv < info.level; lv++) {
            this.timeout += DEFAULT_DECLINE;
        }
        console.log('Level Reset (SPEED):', this.timeout);
        info.init();
        snake.init();
        this.foodRedraw();
        if (!this.isAlive) {
            this.isAlive = true;
            this.main();
        }
    }
    foodRedraw(xy) {
        const { food } = this;
        food.point = xy !== null && xy !== void 0 ? xy : this.getRandomEmptyPoint();
    }
    getRandomEmptyPoint() {
        const { win, snake } = this;
        const emptyPointIndex = win.EVERY_POINT.map(({ x, y }, index) => {
            for (const { point } of snake.snakeChunks) {
                if (x === point.x && y === point.y)
                    index = -1;
            }
            return index;
        }).filter(index => index >= 0);
        return win.EVERY_POINT[$.rangeLs(emptyPointIndex)];
    }
    snakeRefresh() {
        const { win, snake } = this;
        const head = snake.snakeChunks[0];
        const { x, y } = head.point;
        const { point } = snake.snakeChunks.slice(-1)[0];
        switch (snake.moveDirection) {
            case MoveDirection.UP:
                if (this.noclip && y - 1 < 0)
                    head.point = { x, y: win.height - 1 };
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
        if (snake.snakeChunks.length >= 2) {
            snake.snakeChunks.splice(1, 0, snake.snakeChunks.pop());
            snake.snakeChunks[1].point = { x, y };
        }
        return point;
    }
    bumpDetection(snakeTailXY) {
        const { win, info, food, snake } = this;
        const { x, y } = snake.snakeChunks[0].point;
        if (x === food.point.x && y === food.point.y) {
            snake.increase(snakeTailXY);
            win.winElement.appendChild(snake.snakeChunks.slice(-1)[0].element);
            info.scoring(food.foodScore, () => {
                this.timeout -= DEFAULT_DECLINE;
                console.log('Level Up (SPEED):', this.timeout);
            });
            if (snake.snakeChunks.length === win.width * win.height) {
                this.gameover(true);
            }
            else if (info.score >= Infinity) {
                this.gameover(true);
            }
            else {
                this.foodRedraw();
            }
        }
        else if (x < 0 || x > win.width - 1 || y < 0 || y > win.height - 1) {
            this.gameover(false);
        }
        else if (snake.snakeChunks.slice(1).some(({ point }) => x === point.x && y === point.y)) {
            this.gameover(false);
        }
    }
    gameover(result) {
        this.isAlive = false;
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
