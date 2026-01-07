import { globalState } from "../globals/globals";

export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  if (!globalState.currentFiber)
    throw new Error("Not in a function Component!");

  const currentFiber = globalState.currentFiber;
  const hookIndex = currentFiber.hookIndex;
  const oldHook = currentFiber.alternate?.hooks?.[hookIndex];

  const hasChanged = oldHook
    ? !deps.every((dep, index) => Object.is(dep, oldHook.deps?.[index]))
    : true;

  const hook = {
    tag: "CALLBACK",
    callback: hasChanged ? callback : oldHook?.callback || callback,
    deps: deps.slice(), // Create a copy of deps array
  };

  if (!currentFiber.hooks) {
    currentFiber.hooks = [];
  }
  currentFiber.hooks[hookIndex] = hook;
  currentFiber.hookIndex++;

  return hook.callback;
}
