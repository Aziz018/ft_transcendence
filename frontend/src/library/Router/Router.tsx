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
    return <Component {...rest} />;
  }
  return null;
}

export function Link({ to, children, ...rest }: Props) {
  const setRender = Fuego.useRender();
  const handleClick = (event: any) => {
    event.preventDefault();
    const currentPath = window.location.pathname;

    // Only navigate if the path is different
    if (currentPath !== to) {
      window.history.pushState({}, "", to);
      // Trigger a re-render by calling setRender with a toggle value
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
