// utils/eventBus.ts
type EventHandler = (...args: any[]) => void;

class EventBus {
  private listeners: Record<string, EventHandler[]> = {};

  on(event: string, handler: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners[event] = (this.listeners[event] || []).filter((h) => h !== handler);
  }

  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach((handler) => handler(...args));
  }
}

const eventBus = new EventBus();
export default eventBus;
