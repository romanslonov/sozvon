export class Emitter {
  subscribers = {}

  emit(key, info) {
    try {
      const subscribers = this.subscribers[key] || [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < subscribers.length; i++) {
        const fn = subscribers[i];
        try {
          fn(info);
        } catch (err) {
          console.warn('emit warning:', err);
        }
      }
    } catch (err) {
      console.error('emit exception', err);
    }
  }

  on(key, fn) {
    const subscribers = this.subscribers[key] || [];
    subscribers.push(fn);
    this.subscribers[key] = subscribers;
    return {
      cleanup: () => {
        this.off(key, fn);
      },
    };
  }

  off(key, fn) {
    this.subscribers = (this.subscribers[key] || []).filter((f) => fn && f !== fn);
  }
}

export const messages = new Emitter();
