import Fuego from "../../index";
import Button from "../ui/PrimaryButton";

import { Link, redirect } from "../../library/Router/Router";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { saveToken } from "../../lib/auth";

const BACKEND_ORIGIN =
  (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3000";

function openGooglePopup() {
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.innerWidth - w) / 2;
  const top = window.screenY + (window.innerHeight - h) / 2;
  const authEndpoint = `${BACKEND_ORIGIN}/v1/auth/google`;
  const popup = window.open(
    authEndpoint,
    "Google Login",
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

function openFacebookPopup() {
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.innerWidth - w) / 2;
  const top = window.screenY + (window.innerHeight - h) / 2;
  const authEndpoint = `${BACKEND_ORIGIN}/v1/auth/facebook`;
  const popup = window.open(
    authEndpoint,
    "Facebook Login",
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

function open42IntraPopup() {
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.innerWidth - w) / 2;
  const top = window.screenY + (window.innerHeight - h) / 2;
  const authEndpoint = `${BACKEND_ORIGIN}/v1/auth/intra42`;
  const popup = window.open(
    authEndpoint,
    "42 Intra Login",
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

const Main = () => {
  return (
    <div className="pt -[11%] pb-[9%] relative">
      <div className="flex justify-center flex-col items-center bg- red-500">
        <div className="animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
          <h1 className="text-light text-[128px] leading -[90px] w- [580px] pb -[45px] font-family[Questrial]">
            Ping-Together
          </h1>
        </div>
        <div className="pt-4 animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
          <p className="text-light w-[607px] m-auto text-center leading-[35px] text-[15px] opacity-70">
            Think you've got the skills to outplay your friends? Step into the
            virtual ping pong arena and prove it. Quick reflexes, sharp aim, and
            a bit of strategy are all you need to.
          </p>
        </div>
        <div className="flex gap-4 mt-8 animate-[fadeInUp_0.8s_ease-out_0.6s_both]">
          <div className="hover:scale-105 transition-transform duration-300">
            {" "}
            <button onClick={open42IntraPopup}>
              <PrimaryButton data="42 Intra" />
            </button>
          </div>
          <div className="hover:scale-105 transition-transform duration-300">
            {" "}
            <button onClick={openFacebookPopup}>
              <SecondaryButton data="Facebook" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
