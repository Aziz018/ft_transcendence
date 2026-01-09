import Fuego from "../../../index";
import { saveToken } from "../../../lib/auth";
import { redirect } from "../../../library/Router/Router";

const BACKEND_ORIGIN =
  (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";

function openIntraPopup() {
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.innerWidth - w) / 2;
  const top = window.screenY + (window.innerHeight - h) / 2;
  const authEndpoint = `${BACKEND_ORIGIN}/v1/auth/intra42`;
  const popup = window.open(
    authEndpoint,
    "Intra Login",
    `width=${w},height=${h},left=${left},top=${top}`
  );

  function handleMessage(e: MessageEvent) {
    if (!e.origin.startsWith(new URL(BACKEND_ORIGIN).origin)) {
      return;
    }
    const data = e.data as any;
    if (data && data.access_token) {
      saveToken(data.access_token);
      try {
        window.removeEventListener("message", handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {}
      redirect("/dashboard");
    }
  }

  window.addEventListener("message", handleMessage, false);
}

const IntraBtn = () => {
  return (
    <button
      type="button"
      onClick={openIntraPopup}
      className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-light dark:hover:bg-gray-700">
      Intra
    </button>
  );
};

export default IntraBtn;
