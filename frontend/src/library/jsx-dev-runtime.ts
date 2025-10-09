import { createElement } from "../index";

export function jsxDEV(type: any, props: any) {
  const { children, ...otherProps } = props || {};
  if (children) {
    return createElement(type, otherProps, ...(Array.isArray(children) ? children : [children]));
  }
  return createElement(type, otherProps);
}

export { jsxs, Fragment } from "../index";
