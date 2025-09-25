declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
    div: any;
    h1: any;
    h2: any;
    p: any;
    button: any;
    input: any;
    textarea: any;
    form: any;
    nav: any;
    main: any;
    footer: any;
    ul: any;
    li: any;
    span: any;
    label: any;
  }
  
  interface Element {
    type: any;
    props: any;
  }
  
  interface ElementAttributesProperty {
    props: {};
  }
  
  interface ElementChildrenAttribute {
    children: {};
  }
}