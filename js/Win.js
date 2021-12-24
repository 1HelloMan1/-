import { MIN_UNIT, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, DEFAULT_WINSIZE } from './constant.js';
export default class Win {
    constructor(winSize) {
        this.EVERY_POINT = [];
        this.winElement = document.getElementById('win');
        this.resize(winSize !== null && winSize !== void 0 ? winSize : DEFAULT_WINSIZE);
    }
    resize({ width, height }) {
        this.width = width;
        this.height = height;
        this.EVERY_POINT.splice(0, this.EVERY_POINT.length);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.EVERY_POINT.push({ x, y });
            }
        }
    }
    get width() {
        return this.winElement.clientWidth / MIN_UNIT;
    }
    set width(value) {
        if (value < MIN_WIDTH)
            value = MIN_WIDTH;
        else if (value > MAX_WIDTH)
            value = MAX_WIDTH;
        this.winElement.style.width = value * MIN_UNIT + 'px';
    }
    get height() {
        return this.winElement.clientHeight / MIN_UNIT;
    }
    set height(value) {
        if (value < MIN_HEIGHT)
            value = MIN_HEIGHT;
        else if (value > MAX_HEIGHT)
            value = MAX_HEIGHT;
        this.winElement.style.height = value * MIN_UNIT + 'px';
    }
}
