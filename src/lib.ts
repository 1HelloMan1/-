// 自定义库方法
export default {
  // 取区间整数
  range(min?: number, max?: number): number { // TS 在 Math 上添加 range 方法时报错
    // 形参省略规则：
    //   1. range(1, 10) // 1~10
    //   2. range(10) // 0~10
    //   3. range() // 0~1
    let minTmp: number,
      maxTmp: number;
    switch (arguments.length) {
      case 0:
        minTmp = 0;
        maxTmp = 1;
        break;
      case 1:
        minTmp = 0;
        maxTmp = min ?? 1;
        break;
      default:
        minTmp = min ?? 0;
        maxTmp = max ?? 1;
    }
    return Math.floor(Math.random() * (maxTmp - minTmp + 1)) + minTmp;
  },
  // 取随机列表项
  rangeLs<T>(list: T[]): T {
    if (list.length === 0) return list[0];
    return list[this.range(list.length - 1)];
  },
  rangeLsGen() {
    /* 生成器函数：传入列表，每次调用不重复地返回一项随机列表项，直到全部返回后返回null */
  },
  // interval间隔节流函数
  throttleInterval(handler: () => void, timeout: number): () => void {
    let timer: number | undefined;
    return () => {
      if (timer) return;
      handler();
      timer = setTimeout(() => { timer = undefined }, timeout);
    }
  },
  // looporder环序节流函数
  throttleLooporder(handler: () => void, count: number): () => void {
    let currentCount: number = 0;
    return () => {
      if (currentCount-- != 0) return;
      handler();
      currentCount = count;
    }
  },
  // 钟差函数：闭包函数，计算每次调用的时间差
  clockerDiff(signId?: string, expected?: number) {
    let preTime: number | undefined;
    return () => {
      const curTime: number = new Date().getTime();
      console.log(
        `diffTime [${signId ?? new Date().getTime().toString()}]`,
        preTime === undefined ? -0 : (expected === undefined ? curTime - preTime : curTime - preTime - expected)
      );
      preTime = curTime;
    }
  }
};