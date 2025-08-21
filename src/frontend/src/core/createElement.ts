// function createElement(type, props, ...children) {
//   return {
//     type,
//     props: {
//       ...props,
//       children: children.map((child) => {
//         typeof child === "object" ? child : createTextElement(child);
//       }),
//     },
//   };
// }

function createTextElement(text: string) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// type Props = {
//   [key: string]: any;
//   children?: ElementNode[];
// };

// type ElementNode = {
//   type: string;
//   props: Props;
// };

// function createTextElement(text: string): ElementNode {
//   return {
//     type: "TEXT_ELEMENT",
//     props: {
//       nodeValue: text,
//       children: [],
//     },
//   };
// }

// function createElement(
//   type: string,
//   props: Props | null,
//   ...children: (ElementNode | string)[]
// ): ElementNode {
//   return {
//     type,
//     props: {
//       ...props,
//       children: children.map((child) =>
//         typeof child === "object" ? child : createTextElement(child)
//       ),
//     },
//   };
// }
