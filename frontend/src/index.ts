import { createElement, render, Fragment } from "./library/Factory/Factory";
import { useState } from "./library/hooks/useState";
import { useEffect } from "./library/hooks/useEffect";
import { useRef } from "./library/hooks/useRef";
import useRender from "./library/hooks/useRender";
import { workLoop } from "./library/render/render";

export function jsx(type: any, props: any) {
  const { children, ...otherProps } = props || {};
  if (children) {
    return createElement(
      type,
      otherProps,
      ...(Array.isArray(children) ? children : [children])
    );
  }
  return createElement(type, otherProps);
}

export function jsxs(type: any, props: any) {
  const { children, ...otherProps } = props || {};
  if (children) {
    return createElement(
      type,
      otherProps,
      ...(Array.isArray(children) ? children : [children])
    );
  }
  return createElement(type, otherProps);
}

export { Fragment };

const Fuego = {
  createElement,
  render,
  Fragment,
  useState,
  useRender,
  useEffect,
  useRef,
  workLoop,
};
export {
  createElement,
  render,
  useState,
  useEffect,
  useRef,
  useRender,
  workLoop,
};
export default Fuego;
