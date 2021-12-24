import { DEFAULT_SCORE, MAX_LEVEL, BASE_SCORE } from './constant.js';
export default class Info {
    constructor() {
        this.levelElement = document.createElement('span');
        this.scoreElement = document.createElement('span');
        document.getElementById('level').appendChild(this.levelElement);
        document.getElementById('score').appendChild(this.scoreElement);
        this.init();
    }
    init() {
        this.level = 0;
        this.score = 0;
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
    scoring(score, levelUp) {
        this.score += score !== null && score !== void 0 ? score : DEFAULT_SCORE;
        while (this.score >= this.upgradeScore(this.level) && this.level < MAX_LEVEL) {
            this.level += 1;
            if (levelUp !== undefined)
                levelUp();
        }
    }
    upgradeScore(level) {
        if (level === 0)
            return BASE_SCORE;
        return (level + 1) * BASE_SCORE + this.upgradeScore(level - 1);
    }
}
