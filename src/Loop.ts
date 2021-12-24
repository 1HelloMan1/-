/* 优化需求：init函数、actived回调、break回调 */

import { ILoop, LoopOptions, Handler, HandlerObject } from './interface.js';

// Loop类 创建 loop实例：用于控制在主循环中事件函数的触发（多个循环互不影响）
export default class Loop implements ILoop {
  constructor(handlerObject: HandlerObject = {}, public options: LoopOptions = {}) {
    this.handlers = this.throttle(handlerObject);
    if (this.options.isActived ?? true) this.actived();
  }

  // 主循环 ID
  private timmer: number | undefined;
  // 主循环遍历的处理程序数组
  private handlers: (() => void)[];

  // 加工 handlerObject 对象，返回 (()=>void)[]
  private throttle(handlerObject: HandlerObject): (() => void)[] {
    const TIMEOUT: number = this.options.interval ?? 1000;
    const COUNT: number = this.options.looporder ?? 100;
    function interval(handler: () => void, timeout: number): () => void {
      let timer: number | undefined;
      return () => {
        if (timer) return;
        handler();
        timer = setTimeout(() => { timer = undefined }, timeout);
      }
    }
    function looporder(handler: () => void, count: number): () => void {
      let currentCount: number = 0;
      return () => {
        if (currentCount-- != 0) return;
        handler();
        currentCount = count;
      }
    }

    function factory(handlerObj: Handler, throttling: (handler: () => void, integer: number) => (() => void), defaultInterger: number): (() => void)[] {
      const _handlers: (() => void)[] = [];
      if (typeof handlerObj === 'function') {
        _handlers.push(throttling(handlerObj, defaultInterger));
      } else if (handlerObj instanceof Array) {
        _handlers.push(...handlerObj.map(handler => throttling(handler, defaultInterger)));
      } else {
        // 需要考虑到实参为 {}空对象 时的处理方法。
        for (const [integer, _handler] of Object.entries(handlerObj) as [string, (() => void) | (() => void)[]][]) {
          // 过滤对象，只对满足匹配条件的属性加工
          if (/^(0|[1-9]\d*)$/.test(integer)) {
            _handlers.push(..._handler instanceof Array
              ? _handler.map(handler => throttling(handler, +integer))
              : [throttling(_handler, +integer)]
            );
          }
        }
      }
      return _handlers;
    }

    const handlers: (() => void)[] = [];
    if (typeof handlerObject === 'object' && !(handlerObject instanceof Array) && (handlerObject.hasOwnProperty('interval') || handlerObject.hasOwnProperty('looporder'))) {
      if (handlerObject.interval !== undefined) {
        handlers.push(...factory(handlerObject.interval, interval, TIMEOUT));
      }
      if (handlerObject.looporder !== undefined) {
        handlers.push(...factory(handlerObject.looporder, looporder, COUNT));
      }
    } else {
      handlers.push(...factory(<Handler>handlerObject, interval, TIMEOUT));
    }
    return handlers;
  }

  // 激活 主循环
  actived(): void {
    if (this.timmer) return;
    this.timmer = setInterval(() => this.handlers.forEach(handler => {
      // 遍历 handlers处理函数数组 时检查到期标志，移除或执行。
      if (false) {

      } else {
        handler();
      }
    }), this.options.timeout);
  }

  // 跳出 主循环
  break(): void {
    this.timmer = clearInterval(this.timmer) as undefined;
  }

  // 解析处理 HandlerObject 类型，追加到 handlers 数组
  appendHandler(handlerObject: HandlerObject): void {
    this.handlers.push(...this.throttle(handlerObject));
  }

  // 根据条件，移除 handlers 数组中的函数
  removeHandler(_handlerObject: HandlerObject): void {
    // 目前没有办法在实例方法中实现该功能，原因在于：this.handlers 打印出完全一样的函数列表，原理未知。
    console.warn('Unable: Loop.handlers', this.handlers);
  }

  // 获取：主循环被激活状态
  get isActived(): boolean {
    return this.timmer ? true : false;
  }
}