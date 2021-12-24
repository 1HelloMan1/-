"use strict";
const $ = {
    range(min, max) {
        let minTmp, maxTmp;
        switch (arguments.length) {
            case 0:
                minTmp = 0;
                maxTmp = 1;
                break;
            case 1:
                minTmp = 0;
                maxTmp = min !== null && min !== void 0 ? min : 1;
                break;
            default:
                minTmp = min !== null && min !== void 0 ? min : 0;
                maxTmp = max !== null && max !== void 0 ? max : 1;
        }
        return Math.floor(Math.random() * (maxTmp - minTmp + 1)) + minTmp;
    },
    rangeLs(list) {
    },
    throttleInterval(handler, timeout) {
        let timer;
        return () => {
            if (timer)
                return;
            handler();
            timer = setTimeout(() => { timer = undefined; }, timeout);
        };
    },
    throttleLooporder(handler, count) {
        let currentCount = 0;
        return () => {
            if (currentCount-- != 0)
                return;
            handler();
            currentCount = count;
        };
    },
    clockerDiff(signId = new Date().getTime().toString()) {
        let preTime;
        return () => {
            const curTime = new Date().getTime();
            console.log('diffTime [' + signId + ']', (preTime === undefined ? '-0' : curTime - preTime));
            preTime = curTime;
        };
    }
};
var MoveDirection;
(function (MoveDirection) {
    MoveDirection[MoveDirection["UP"] = 0] = "UP";
    MoveDirection[MoveDirection["DOWN"] = 1] = "DOWN";
    MoveDirection[MoveDirection["LEFT"] = 2] = "LEFT";
    MoveDirection[MoveDirection["RIGHT"] = 3] = "RIGHT";
})(MoveDirection || (MoveDirection = {}));
class Loop {
    constructor(handlerObject = {}, options = {}) {
        var _a;
        this.options = options;
        this.handlers = this.throttle(handlerObject);
        if ((_a = this.options.isActived) !== null && _a !== void 0 ? _a : true)
            this.actived();
    }
    throttle(handlerObject) {
        var _a, _b;
        const TIMEOUT = (_a = this.options.interval) !== null && _a !== void 0 ? _a : 1000;
        const COUNT = (_b = this.options.looporder) !== null && _b !== void 0 ? _b : 100;
        function interval(handler, timeout) {
            let timer;
            return () => {
                if (timer)
                    return;
                handler();
                timer = setTimeout(() => { timer = undefined; }, timeout);
            };
        }
        function looporder(handler, count) {
            let currentCount = 0;
            return () => {
                if (currentCount-- != 0)
                    return;
                handler();
                currentCount = count;
            };
        }
        function factory(handlerObj, throttling, defaultInterger) {
            const _handlers = [];
            if (typeof handlerObj === 'function') {
                _handlers.push(throttling(handlerObj, defaultInterger));
            }
            else if (handlerObj instanceof Array) {
                _handlers.push(...handlerObj.map(handler => throttling(handler, defaultInterger)));
            }
            else {
                for (const [integer, _handler] of Object.entries(handlerObj)) {
                    if (/^(0|[1-9]\d*)$/.test(integer)) {
                        _handlers.push(..._handler instanceof Array
                            ? _handler.map(handler => throttling(handler, +integer))
                            : [throttling(_handler, +integer)]);
                    }
                }
            }
            return _handlers;
        }
        const handlers = [];
        if (typeof handlerObject === 'object' && !(handlerObject instanceof Array) && (handlerObject.hasOwnProperty('interval') || handlerObject.hasOwnProperty('looporder'))) {
            if (handlerObject.interval !== undefined) {
                handlers.push(...factory(handlerObject.interval, interval, TIMEOUT));
            }
            if (handlerObject.looporder !== undefined) {
                handlers.push(...factory(handlerObject.looporder, looporder, COUNT));
            }
        }
        else {
            handlers.push(...factory(handlerObject, interval, TIMEOUT));
        }
        return handlers;
    }
    actived() {
        if (this.timmer)
            return;
        this.timmer = setInterval(() => this.handlers.forEach(handler => {
            if (false) {
            }
            else {
                handler();
            }
        }), this.options.timeout);
    }
    break() {
        this.timmer = clearInterval(this.timmer);
    }
    appendHandler(handlerObject) {
        this.handlers.push(...this.throttle(handlerObject));
    }
    removeHandler(_handlerObject) {
        console.warn('Unable: Loop.handlers', this.handlers);
    }
    get isActived() {
        return this.timmer ? true : false;
    }
}
class Game {
    constructor() {
        this.GAME_UNIT = 10;
        this.FULL_POINTS = [];
        this.levelElement = document.getElementById('level');
        this.scoreElement = document.getElementById('score');
        this.winElement = document.getElementById('win');
        for (let x = 0; x < this.winSize.width; x++) {
            for (let y = 0; y < this.winSize.height; y++) {
                this.FULL_POINTS.push([x, y]);
            }
        }
    }
    get level() {
        return +this.levelElement.innerText;
    }
    set level(value) {
        this.levelElement.innerText = value.toString();
    }
    get score() {
        return +this.scoreElement.innerText;
    }
    set score(value) {
        this.scoreElement.innerText = value.toString();
    }
    get winSize() {
        return {
            width: this.winElement.clientWidth / this.GAME_UNIT,
            height: this.winElement.clientHeight / this.GAME_UNIT
        };
    }
}
class Food {
    constructor(xy, foodScore = 1) {
        this.foodScore = foodScore;
        const foodElement = document.createElement('div');
        foodElement.innerHTML = '<div></div><div></div><div></div><div></div>';
        foodElement.className = 'food';
        this.element = foodElement;
        this.render(xy);
    }
    get point() {
        return {
            x: +this.element.style.left.match(/^\d+/) / game.GAME_UNIT,
            y: +this.element.style.top.match(/^\d+/) / game.GAME_UNIT
        };
    }
    set point({ x, y }) {
        this.element.style.left = x * game.GAME_UNIT + 'px';
        this.element.style.top = y * game.GAME_UNIT + 'px';
    }
    render(xy) {
        function getEmptyPoint() {
            const pointIndex = [];
            for (let i = 0; i < game.FULL_POINTS.length; i++) {
                pointIndex.push(i);
            }
            for (const chunk of snake.snakeChunks) {
                const { x, y } = chunk.point;
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
        this.point = xy !== null && xy !== void 0 ? xy : getEmptyPoint();
        if (!this.element.parentElement) {
            game.winElement.appendChild(this.element);
        }
        else {
            game.score += this.foodScore;
        }
    }
}
class Snake {
    constructor(xy) {
        const snakeChunk = new SnakeChunk(xy);
        snakeChunk.element.classList.add('snake-head');
        this.snakeChunks = [snakeChunk];
        this.moveDirection = MoveDirection.RIGHT;
        document.addEventListener('keyup', evt => {
            if (!loop.isActived)
                return;
            const { x, y } = this.snakeChunks[0].point;
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
    move() {
        const snakeTailPoint = this.render();
        this.bumpDetection(snakeTailPoint);
    }
    render() {
        const head = this.snakeChunks[0];
        const { x, y } = head.point;
        const { point } = this.snakeChunks.slice(-1)[0];
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
        if (this.snakeChunks.length >= 2) {
            this.snakeChunks.splice(1, 0, this.snakeChunks.pop());
            this.snakeChunks[1].point = { x, y };
        }
        return point;
    }
    bumpDetection(snakeTailXY) {
        const { x, y } = this.snakeChunks[0].point;
        if (x === food.point.x && y === food.point.y) {
            this.takeFood(snakeTailXY);
        }
        else if (x < 0 || x > game.winSize.width - 1 || y < 0 || y > game.winSize.height - 1) {
            this.gameover(false);
        }
        else if (this.snakeChunks.slice(1).some(({ point }) => x === point.x && y === point.y)) {
            this.gameover(false);
        }
    }
    takeFood(snakeTailXY) {
        this.snakeChunks.push(new SnakeChunk(snakeTailXY));
        if (this.snakeChunks.length === game.winSize.width * game.winSize.height) {
            this.gameover(true);
        }
        else {
            food.render();
        }
    }
    gameover(result) {
        loop.break();
        if (result) {
            console.log('游戏结束【成功】\n【得分】' + game.score);
        }
        else {
            console.log('游戏结束【失败】\n【得分】' + game.score);
        }
    }
}
class SnakeChunk {
    constructor(xy) {
        const snakeChunkElement = document.createElement('div');
        snakeChunkElement.className = 'snake-chunk';
        this.element = snakeChunkElement;
        this.point = xy !== null && xy !== void 0 ? xy : { x: 0, y: 0 };
        game.winElement.appendChild(this.element);
    }
    get point() {
        return {
            x: +this.element.style.left.match(/^-?\d+/) / game.GAME_UNIT,
            y: +this.element.style.top.match(/^-?\d+/) / game.GAME_UNIT
        };
    }
    set point({ x, y }) {
        this.element.style.left = x * game.GAME_UNIT + 'px';
        this.element.style.top = y * game.GAME_UNIT + 'px';
    }
}
const loop = new Loop();
const game = new Game();
const snake = new Snake();
const food = new Food({ x: 15, y: 15 });
let flag = false;
loop.appendHandler({
    'interval': {
        '200': snake.move.bind(snake)
    },
});
document.addEventListener('keyup', evt => {
    if (evt.key === 'Escape') {
        if (loop.isActived) {
            loop.break();
        }
        else {
            loop.actived();
        }
    }
});
