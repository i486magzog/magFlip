type Listener = (...args: any[]) => void;

class Event {
  private listeners: { [event: string]: Listener[] } = {};

  // 이벤트 리스너 등록
  addEventListener(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  // 이벤트 리스너 제거
  removeEventListener(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  // 이벤트 발생
  emitEvent(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener(...args));
  }
}

export default Event;