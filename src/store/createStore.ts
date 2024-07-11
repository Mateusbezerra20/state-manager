import { useSyncExternalStore } from 'react';

type SetterFn<T> = (prevState: T) => Partial<T>;
type SetFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;

export function createStore<TState extends Record<string, any>>(
  createState: (set: SetFn<TState>, get: () => TState) => TState,
) {
  let state: TState;
  let listeners: Set<() => void>;

  function notify() {
    listeners.forEach((listener) => {
      listener();
    });
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue,
    };

    notify();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(selector: (currentState: TState) => TValue) {
    // const [value, setValue] = useState(() => selector(state));

    // useEffect(() => {
    //   const unsubscribe = subscribe(() => {
    //     const newValue = selector(state);
    //     if (value !== newValue) {
    //       setValue(newValue);
    //     }
    //   });

    //   return () => {
    //     unsubscribe();
    //   }
    // }, [setValue, selector]);

    // return value;

    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore;
}
