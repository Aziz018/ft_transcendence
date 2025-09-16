import { MyReact } from "./core";

export interface Route {
  path: string;
  component: () => any;
}

export class Router {
  private routes: Route[] = [];
  private currentPath: string = "/";

  constructor(private container: HTMLElement) {
    window.addEventListener("popstate", () => {
      this.navigate(window.location.pathname, false);
    });
  }

  addRoute(path: string, component: () => any) {
    this.routes.push({ path, component });
  }

  navigate(path: string, pushState: boolean = true) {
    this.currentPath = path;

    if (pushState) {
      window.history.pushState(null, "", path);
    }

    this.render();
  }

  render() {
    const route = this.routes.find((r) => r.path === this.currentPath);

    if (route) {
      this.container.innerHTML = "";
      const componentResult = route.component();

      if (componentResult && componentResult.type) {
        const instance = MyReact.createComponentInstance(componentResult);
        MyReact.mountComponent(instance, this.container);
      }
    }
  }

  start() {
    this.navigate(window.location.pathname || "/home", false);
  }
}

export function Link({ to, children, ...props }: any) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("navigate", { detail: to }));
  };

  return MyReact.createElement(
    "a",
    {
      href: to,
      onClick: handleClick,
      ...props,
    },
    ...children
  );
}
