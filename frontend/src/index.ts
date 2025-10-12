import { createElement, render, Fragment } from "./library/Factory/Factory";
import { useState } from "./library/hooks/useState";
import { useEffect } from "./library/hooks/useEffect";
import { useRef } from "./library/hooks/useRef";
import { useCallback } from "./library/hooks/useCallback";
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
  useCallback,
  workLoop,
};
export {
  createElement,
  render,
  useState,
  useEffect,
  useRef,
  useCallback,
  useRender,
  workLoop,
};
export default Fuego;
