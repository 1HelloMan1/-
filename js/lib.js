export default {
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
        if (list.length === 0)
            return list[0];
        return list[this.range(list.length - 1)];
    },
    rangeLsGen() {
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
    clockerDiff(signId, expected) {
        let preTime;
        return () => {
            const curTime = new Date().getTime();
            console.log(`diffTime [${signId !== null && signId !== void 0 ? signId : new Date().getTime().toString()}]`, preTime === undefined ? -0 : (expected === undefined ? curTime - preTime : curTime - preTime - expected));
            preTime = curTime;
        };
    }
};
