export default class Loop {
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
