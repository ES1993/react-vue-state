type Func = (...args: any[]) => any;

export abstract class State<V> {
  abstract setValue: (value: V) => void;

  private handles = new Set<Func>();

  constructor(protected value: V) {}

  getValue = () => this.value;

  on = (func: Func) => {
    if (!this.handles.has(func)) {
      this.handles.add(func);
    }
  };

  off = (func: Func) => {
    if (this.handles.has(func)) {
      this.handles.delete(func);
    }
  };

  emit = (oldValue: any) => {
    if (this.handles.size > 0) {
      this.handles.forEach((func) => func?.(oldValue));
    }
  };
}
