import { FunctionComponent, Props } from "../types/types";
import Fuego from "../../index";

export function Router({
  path,
  Component,
  ...rest
}: {
  path: string;
  Component: FunctionComponent;
  [key: string]: any;
}) {
  const setRender = Fuego.useRender();
  const [currentPath, setCurrentPath] = Fuego.useState(
    window.location.pathname
  );

  Fuego.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setRender((prev: any) => !prev); // Toggle to force re-render
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const url = new URL(window.location.href);
  const slugs = path.split("/");
  const currentSlugs = url.pathname.split("/");

  if (
    currentSlugs.every(
      (e, i) =>
        e.toLowerCase() == slugs[i]?.toLowerCase() || slugs[i]?.startsWith(":")
    )
  ) {
    // Check for protected route
    if (rest.protectedRoute) {
      const token = localStorage.getItem("pongrush_token"); // Direct access to avoid circular dependency or import issues if lib is not ready
      if (!token) {
        // Redirect to login
        if (window.location.pathname !== "/login") {
          window.history.pushState({}, "", "/login");
          /* We need to force a re-render or side-effect here, 
             but since we are inside render, we should ideally use useEffect.
             However, returning null stops render. 
             The redirect above changes URL but might not trigger router re-eval immediately if not tied to state.
             Ideally, we return null and let the URL change trigger re-render via popstate or similar.
          */
          // To ensure we don't get stuck, we can use a timeout or just rely on the pushState + setRender if we had access.
          // But wait, we are inside a component render. Side-effects like pushState are risky.
          // Better approach:
        }
        // Use a small effect to redirect to avoid state update during render warning
        // But for now, returning null effectively guards the content.
        // We need to actually perform the navigation.
        setTimeout(() => {
          if (window.location.pathname !== "/login") {
            window.history.pushState({}, "", "/login");
            const event = new PopStateEvent("popstate");
            window.dispatchEvent(event);
          }
        }, 0);
        return null;
      }
    }
    return <Component {...rest} />;
  }
  return null;
}

export function Link({ to, children, ...rest }: Props) {
  const setRender = Fuego.useRender();
  const handleClick = (event: any) => {
    event.preventDefault();
    const currentPath = window.location.pathname;

    if (currentPath !== to) {
      window.history.pushState({}, "", to);

      setRender((prev: any) => !prev);
    }
  };

  return (
    <a {...rest} href={to} onClick={handleClick}>
      {children}
    </a>
  );
}

export function redirect(to: string) {
  const currentPath = window.location.pathname;
  if (currentPath !== to) {
    window.history.pushState({}, "", to);
    const setRender = Fuego.useRender();
    setRender((prev: any) => !prev);
  }
}
