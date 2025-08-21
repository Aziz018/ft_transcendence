function render(element, container) {
  // Create a DOM node based on the element type
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // Set the properties on the DOM node
  Object.keys(element.props).forEach((name) => {
    if (name === "children") {
      // Render children
      element.props.children.forEach((child) => {
        render(child, dom);
      });
    } else {
      // Set the property
      dom[name] = element.props[name];
    }
  });

  // Append the DOM node to the container
  container.appendChild(dom);
}
// Export the render function
export default render;
