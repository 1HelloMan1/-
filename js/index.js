import Game from './Game.js';
const game = new Game(250, false, true);
document.addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'Escape':
            game.reset();
            break;
        case ' ':
            if (game.isAlive) {
                game.isAlive = false;
            }
            else {
                game.isAlive = true;
                game.main();
            }
    }
});
game.addEventListener('gameover', evt => {
    if (!isCustomEvent(evt))
        throw new Error('not a custom event');
    const { result, score } = evt.detail;
    if (confirm(`游戏结束【${result ? '胜利' : '失败'}】\n得分【${score}】\n\n重新开始游戏？`)) {
        game.reset();
    }
});
function isCustomEvent(event) {
    return 'detail' in event;
}
