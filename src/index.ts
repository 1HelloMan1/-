/*
  新增功能：特殊事件、手柄api
  条件胜利：每一等级需要吃到一定分数则晋级下一关
  限时高分果实：3倍Food得分
  限时穿墙果实：无界边框（边框变为虚线时，可以出边框从另一侧出来）
*/

import Game from './Game.js';

const game = new Game(250, false, true);

// document.keyup事件：控制 game 继续或暂停 | 控制 game 重开
document.addEventListener('keyup', ({ key }: KeyboardEvent) => {
  switch (key) {
    case 'Escape': // 重开游戏
      game.reset();
      break;
    case ' ': // 继续或暂停
      if (game.isAlive) {
        game.isAlive = false;
      } else {
        game.isAlive = true;
        game.main();
      }
  }
});

// game.gameover 事件：询问 是否重开
game.addEventListener('gameover', evt => {
  if (!isCustomEvent(evt)) throw new Error('not a custom event');
  const { result, score } = evt.detail;
  if (confirm(`游戏结束【${result ? '胜利' : '失败'}】\n得分【${score}】\n\n重新开始游戏？`)) {
    game.reset();
  }
});
function isCustomEvent(event: Event): event is CustomEvent {
  return 'detail' in event;
}