import { ComponentInstance } from "./core";

let currentInstance: ComponentInstance | null = null;

export function getCurrentInstance(): ComponentInstance {
  if (!currentInstance) {
    throw new Error("Hooks can only be called inside functional components");
  }
  return currentInstance;
}

export function useState<T>(initialState: T): [T, (newState: T) => void] {
  const instance = getCurrentInstance();
  const hookIndex = instance.hookIndex;

  if (instance.hooks[hookIndex] === undefined) {
    instance.hooks[hookIndex] =
      typeof initialState === "function" ? initialState() : initialState;
  }

  const state = instance.hooks[hookIndex];

  const setState = (newState: T | ((prev: T) => T)) => {
    const actualNewState =
      typeof newState === "function" ? (newState as Function)(state) : newState;

    instance.hooks[hookIndex] = actualNewState;
    console.log("State updated:", actualNewState);
  };

  instance.hookIndex++;
  return [state, setState];
}

export function setCurrentInstance(instance: ComponentInstance | null) {
  currentInstance = instance;
}
