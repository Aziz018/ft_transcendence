import { Fragment } from "../Factory/Factory";
import { globalState } from "../globals/globals";
import { FiberNode, Maybe, Props, TextVNode, VNode } from "../types/types";
import { isEventListener, isTextNode, setAttributes } from "../utils/utils";

export const workLoop: IdleRequestCallback = function (deadline) {
  let shouldYield = false;
  while (!shouldYield && globalState.nextUnitOfWork) {
    globalState.nextUnitOfWork = performUnitOfWork(globalState.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!globalState.nextUnitOfWork && globalState.wipRoot) {
    commitRoot();
    for (const {
      fn,
      dependencies,
      fiber,
      hookIndex,
    } of globalState.pendingEffects) {
      const cleanUp = fn();
      if (typeof cleanUp === "function") {
        const currentHook = fiber.hooks[hookIndex];
        if (currentHook) {
          currentHook.cleanUp = cleanUp;
        } else {
        }
      }
    }
    globalState.pendingEffects = [];
  }
  requestIdleCallback(workLoop);
};

function performUnitOfWork(fiber: FiberNode | null): Maybe<FiberNode> {
  if (!fiber) return null;
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  return findNextSibling(fiber);
}

function findNextSibling(fiber: FiberNode): Maybe<FiberNode> {
  let currentFiber: Maybe<FiberNode> = fiber;

  while (currentFiber) {
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.parent;
  }
  return null;
}
export function createDom(fiber: FiberNode) {
  const dom = isTextNode(fiber)
    ? document.createTextNode(fiber.props.nodeValue)
    : document.createElement(fiber.type as string);

  if (dom.nodeType == Node.ELEMENT_NODE)
    setAttributes(dom as Element, fiber.props);
  return dom;
}
const generateKey = (element: VNode, index: number) => {
  if (element?.props?.key) return element.props.key;

  const type = element?.type || "text";
  const identifier =
    element?.props?.htmlFor ||
    element?.props?.name ||
    element?.props?.id ||
    `${type}_${index}`;

  return `${type}:${identifier}`;
};
function recouncilChildren(elements: VNode[], wipFiber: FiberNode) {
  let index = 0;
  let prevSibling: Maybe<FiberNode> = null;

  const oldFiberMap = new Map<string | number, FiberNode>();
  const oldFibersByIndex: FiberNode[] = [];

  let oldFiber = wipFiber.alternate?.child;
  let oldIndex = 0;
  while (oldFiber) {
    const key = generateKey(oldFiber, oldIndex);
    oldFiberMap.set(key, oldFiber);
    oldFibersByIndex.push(oldFiber);
    oldFiber = oldFiber.sibling;
    oldIndex++;
  }

  const usedOldFibers = new Set<FiberNode>();
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementKey = element?.props?.key ?? `__index_${i}`;
    let matchingOldFiber = oldFiberMap.get(elementKey);
    if (
      !matchingOldFiber &&
      oldFibersByIndex[i] &&
      !usedOldFibers.has(oldFibersByIndex[i])
    ) {
      const oldFiberAtPosition = oldFibersByIndex[i];
      if (oldFiberAtPosition.type === element?.type) {
        matchingOldFiber = oldFiberAtPosition;
      }
    }

    const sameType = !!(
      matchingOldFiber &&
      element &&
      matchingOldFiber.type === element.type
    );

    let newFiber: FiberNode | null = null;

    if (sameType && matchingOldFiber) {
      usedOldFibers.add(matchingOldFiber);
      const newProps =
        matchingOldFiber.type === "TEXT_NODE"
          ? { nodeValue: element.props?.nodeValue }
          : element.props;

      newFiber = {
        type: matchingOldFiber.type,
        props: newProps,
        dom: matchingOldFiber.dom,
        parent: wipFiber,
        alternate: matchingOldFiber,
        effectTag: "UPDATE",
        hookIndex: matchingOldFiber.hookIndex, // ✅ Preserve hookIndex
        hooks: [...(matchingOldFiber.hooks || [])], // ✅ Deep copy hooks
      };
    } else if (element) {
      newFiber = {
        type: element.type || "TEXT_NODE",
        props: element.props || { nodeValue: String(element) },
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
        hookIndex: 0,
        hooks: [],
      };
    }
    if (i === 0) {
      wipFiber.child = newFiber;
    } else if (prevSibling && newFiber) {
      prevSibling.sibling = newFiber;
    }

    if (newFiber) {
      prevSibling = newFiber;
    }
  }
  for (const oldFib of oldFibersByIndex) {
    if (!usedOldFibers.has(oldFib)) {
      oldFib.effectTag = "DELETION";
      globalState.deletions.push(oldFib);
    }
  }
}

export function render(elm: VNode | TextVNode, container: Element) {
  globalState.wipRoot = {
    dom: container,
    type: "ROOT",
    props: {
      children: [elm],
    },
    alternate: globalState.currentRoot,
    hookIndex: 0,
    hooks: [],
  };

  globalState.nextUnitOfWork = globalState.wipRoot;
}

function commitRoot() {
  const activeElement = document.activeElement;
  const focusInfo = activeElement
    ? {
        element: activeElement,
        selectionStart: (activeElement as HTMLInputElement).selectionStart,
        selectionEnd: (activeElement as HTMLInputElement).selectionEnd,
      }
    : null;
  globalState.deletions.forEach(commitWork);
  commitWork(globalState.wipRoot?.child);

  if (focusInfo && document.contains(focusInfo.element)) {
    (focusInfo.element as HTMLElement).focus();

    if (
      focusInfo.element instanceof HTMLInputElement ||
      focusInfo.element instanceof HTMLTextAreaElement
    ) {
      if (
        focusInfo.selectionStart !== null &&
        focusInfo.selectionEnd !== null
      ) {
        focusInfo.element.setSelectionRange(
          focusInfo.selectionStart,
          focusInfo.selectionEnd
        );
      }
    }
  }

  globalState.currentRoot = globalState.wipRoot;
  globalState.wipRoot = null;
}

// NEW HELPER FUNCTIONS FOR DOM INSERTION
function findNextSiblingDomNode(fiber: FiberNode): Element | Text | null {
  let sibling = fiber.sibling;

  while (sibling) {
    if (sibling.dom && sibling.effectTag !== "DELETION") {
      return sibling.dom as Element | Text;
    }

    if (sibling.child && sibling.effectTag !== "DELETION") {
      const childDom = findFirstDomNode(sibling.child);
      if (childDom) {
        return childDom;
      }
    }

    sibling = sibling.sibling;
  }

  return null;
}

function findFirstDomNode(fiber: FiberNode): Element | Text | null {
  if (fiber.dom && fiber.effectTag !== "DELETION") {
    return fiber.dom as Element | Text;
  }

  if (fiber.child && fiber.effectTag !== "DELETION") {
    return findFirstDomNode(fiber.child);
  }

  if (fiber.sibling) {
    return findFirstDomNode(fiber.sibling);
  }

  return null;
}

function commitWork(fiber: Maybe<FiberNode>) {
  if (!fiber) return;
  fiber.hookIndex = 0;
  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber?.dom;
  if (
    domParent &&
    fiber.parent?.effectTag != "DELETION" &&
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null &&
    fiber.type !== "frag"
  ) {
    const beforeNode = findNextSiblingDomNode(fiber);
    if (beforeNode && domParent.contains(beforeNode)) {
      domParent.insertBefore(fiber.dom as Element | Text, beforeNode);
    } else {
      domParent.appendChild(fiber.dom as Element | Text);
    }
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(
      fiber.dom as Element | Text,
      fiber.alternate?.props || {},
      fiber.props
    );
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent as Element | Text);
  }
  if (fiber.child && fiber.effectTag !== "DELETION") {
    commitWork(fiber.child);
  }
  if (fiber.sibling) {
    commitWork(fiber.sibling);
  }
}

function commitDeletion(fiber: Maybe<FiberNode>, domParent: Element | Text) {
  if (!fiber) return;
  if (fiber.dom) {
    if (domParent.contains(fiber.dom)) domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
  if (fiber.parent?.type === "frag" && fiber.sibling) {
    commitDeletion(fiber.sibling, domParent);
  }
}

function updateDom(dom: Element | Text, oldProps: Props, newProps: Props) {
  // console.log("Updating DOM", oldProps, newProps)
  // Only handle non-event attributes here
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key == "children") continue;
      if (!isEventListener(key)) {
        (dom as Element).removeAttribute(key);
      }
    }
  }

  if (dom.nodeType === Node.ELEMENT_NODE) {
    setAttributes(dom as Element, newProps, oldProps);
  }
  if (dom.nodeType === Node.TEXT_NODE) {
    (dom as Text).nodeValue = newProps.nodeValue as string;
  }
}

function updateFunctionComponent(fiber: FiberNode) {
  if (!fiber.type || typeof fiber.type !== "function") {
    throw new Error("Fiber type is not a function component");
  }
  fiber.hooks ??= [];
  globalState.currentFiber = fiber;

  const children = [fiber.type(fiber.props)].filter(
    (child) => child !== null && child !== undefined
  );
  recouncilChildren(children, fiber);
}

function updateHostComponent(fiber: FiberNode) {
  if (!fiber.dom) {
    fiber.dom = fiber.type !== "frag" ? createDom(fiber) : fiber.parent?.dom;
  }
  //  console.warn("Amount of children", (fiber.props.children || []).length)

  const children = Array.isArray(fiber.props.children)
    ? (fiber.props.children.filter(
        (e) => e != null && e !== undefined
      ) as VNode[])
    : fiber.props.children && typeof fiber.props.children === "object"
      ? [fiber.props.children as VNode]
      : [];

  recouncilChildren(children, fiber);
}
