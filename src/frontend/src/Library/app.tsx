// ---- Library --- //

// createElement Function
const React = {
  createElement: (tag: any, props: any, ...children: any[]) => {
    const element = {
      tag,
      props,
      children,
    };
    return element;
  },
};

// reRender function
const reRender = () => {
  let root = document.getElementById("my-app");
  root.innerHTML = ""; // Clear the root element
  myAppStateCursor = 0;
  render(<App />, root);
};

// render function
const render = (el: any, container: any) => {
  let docNode;
  // 0. Check the type of el
  //    if string we need to handle it like text node.
  if (typeof el === "string" || typeof el === "number") {
    // create an actual Text Node
    docNode = document.createTextNode(String(el));
    container.appendChild(docNode);
    // No children for text so we return.
    return;
  }

  // NEW: Handle functional components
  if (typeof el.tag === "function") {
    // Call the function component with props and render its result
    const componentResult = el.tag(el.props || {});
    render(componentResult, container);
    return;
  }
  // 1: create the document node
  docNode = document.createElement(el.tag);
  // 2: set the props on docNode
  let props = el.props ? Object.keys(el.props) : null;
  if (props && props.length > 0) {
    props.forEach((prop) => (docNode[prop] = el.props[prop]));
  }
  // 3. Handle creating the Children.
  if (el.children && el.children.length > 0) {
    // When child is rendered, the container will be
    // the domEl we created here.
    el.children.forEach((node) => render(node, docNode));
  }
  // 4. append the DOM node to the container.
  container.appendChild(docNode);
};

// hooks
const myAppState = [];
let myAppStateCursor = 0;

const useState = (initialState) => {
  const stateCursor = myAppStateCursor;
  myAppState[myAppStateCursor] = myAppState[myAppStateCursor] || initialState;

  const setState = (e) => {
    myAppState[stateCursor] = e;
    reRender();
  };
  myAppStateCursor++;
  return [myAppState[stateCursor], setState];
};

// ---- Application --- //
const App = () => {
  const [count, setCount] = useState(0);
  console.log(count);
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onclick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

render(<App />, document.getElementById("my-app"));
