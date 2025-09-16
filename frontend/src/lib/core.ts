import { setCurrentInstance } from "./hooks";

export interface VNode {
  type: string | Function | Symbol;
  props: Record<string, any>;
  children: VNode[];
  key?: string;
  dom?: HTMLElement | Text;
}

export interface ComponentInstance {
  vnode: VNode;
  dom: HTMLElement | Text;
  childInstance?: ComponentInstance;
  hooks: any[];
  hookIndex: number;
}

export const MyReact = {
  createElement(type: any, props: any, ...children: any[]): VNode {
    const normalizedChildren = children
      .flat()
      .filter((child) => child != null && child !== false && child !== true)
      .map((child) =>
        typeof child === "object" ? child : this.createTextNode(String(child))
      );

    return {
      type,
      props: props || {},
      children: normalizedChildren,
    };
  },

  createTextNode(text: string): VNode {
    return {
      type: "TEXT_ELEMENT",
      props: { nodeValue: text },
      children: [],
    };
  },

  Fragment: Symbol("Fragment"),

  render(vnode: VNode, container: HTMLElement) {
    container.innerHTML = "";
    const instance = this.createComponentInstance(vnode);
    this.mountComponent(instance, container);
  },

  createComponentInstance(vnode: VNode): ComponentInstance {
    return {
      vnode,
      dom: null as any,
      hooks: [],
      hookIndex: 0,
    };
  },

  mountComponent(
    instance: ComponentInstance,
    container: HTMLElement | DocumentFragment
  ) {
    const { type, props, children } = instance.vnode;

    if (typeof type === "function") {
      this.renderFunctionalComponent(instance, container);
    } else if (type === "TEXT_ELEMENT") {
      instance.dom = document.createTextNode(props.nodeValue || "");
      container.appendChild(instance.dom);
    } else if (type === this.Fragment) {
      this.renderFragment(instance, container);
    } else {
      this.renderHtmlElement(instance, container);
    }
  },

  renderFunctionalComponent(
    instance: ComponentInstance,
    container: HTMLElement | DocumentFragment
  ) {
    const { type, props, children } = instance.vnode;

    if (typeof type === "function") {
      instance.hookIndex = 0;

      setCurrentInstance(instance);

      try {
        const result = type({ ...props, children });

        if (result) {
          const childInstance = this.createComponentInstance(result);
          instance.childInstance = childInstance;
          this.mountComponent(childInstance, container);
          instance.dom = childInstance.dom;
        }
      } finally {
        setCurrentInstance(null);
      }
    }
  },

  renderFragment(
    instance: ComponentInstance,
    container: HTMLElement | DocumentFragment
  ) {
    const fragment = document.createDocumentFragment();

    instance.vnode.children.forEach((childVNode) => {
      if (childVNode) {
        const childInstance = this.createComponentInstance(childVNode);
        this.mountComponent(childInstance, fragment);
      }
    });

    container.appendChild(fragment);
    instance.dom = fragment as any;
  },

  renderHtmlElement(
    instance: ComponentInstance,
    container: HTMLElement | DocumentFragment
  ) {
    const { type, props, children } = instance.vnode;

    instance.dom = document.createElement(type as string);

    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.toLowerCase().substring(2);
          instance.dom.addEventListener(eventName, value);
        } else if (key === "className") {
          instance.dom.className = value;
        } else if (key === "style" && typeof value === "object") {
          Object.assign(instance.dom.style, value);
        } else if (key !== "children") {
          instance.dom.setAttribute(key, value as string);
        }
      });
    }

    if (children && children.length > 0) {
      children.forEach((childVNode) => {
        if (childVNode) {
          const childInstance = this.createComponentInstance(childVNode);
          this.mountComponent(childInstance, instance.dom as HTMLElement);
        }
      });
    }
    container.appendChild(instance.dom);
  },
};
