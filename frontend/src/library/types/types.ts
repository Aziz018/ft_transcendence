export interface Props {
  [key: string]: any;
  children?: any;
}

export interface FuegoAttributes extends Props {
  key?: string | number;
  ref?: any;
}

export interface VNode {
  type: string | FunctionComponent;
  props: Props;
  key?: string | number;
}

export interface TextVNode {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
    children: [];
  };
}

export interface FiberNode {
  type?: string | FunctionComponent;
  props: Props;
  dom?: Element | Text | null;
  parent?: FiberNode | null;
  child?: FiberNode | null;
  sibling?: FiberNode | null;
  alternate?: FiberNode | null;
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
  hooks?: any[];
  hookIndex?: number;
}

export type Maybe<T> = T | null | undefined;

export type FunctionComponent<P = Props> = (props: P) => VNode | null;

export interface ElementType {
  type: string | FunctionComponent;
  props: Props;
}
