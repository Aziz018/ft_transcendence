import { useState } from "./useState";

export default function useRender() {
  const [_, setRender] = useState(null);
  return setRender;
}
