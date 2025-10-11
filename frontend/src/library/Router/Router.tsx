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
    window.history.pushState({}, "", to);
    setRender(null);
  };

  return (
    <a {...rest} href={to} onClick={handleClick}>
      {children}
    </a>
  );
}

export function redirect(to: string) {
  window.history.pushState({}, "", to);
  Fuego.useRender()(null);
}
