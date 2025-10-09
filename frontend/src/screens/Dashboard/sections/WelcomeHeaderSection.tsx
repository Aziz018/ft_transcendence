import Fuego from "../../../index";

import { BellIcon, SearchIcon } from "lucide-react";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
import NotificationBell from "../../../assets/notification.svg";
import SecondaryButton from "../../../components/ui/SecondaryButton";
import { getToken, decodeTokenPayload } from "../../../lib/auth";
import { useEffect } from "../../../library/hooks/useEffect";
import { useState } from "../../../library/hooks/useState";

const WelcomeHeaderSection = () => {
  const deriveNameFromToken = () => {
    try {
      const token = getToken();
      // debug: log raw token
      if (typeof window !== "undefined") {
        // avoid noisy logs on server side if any
        // eslint-disable-next-line no-console
        console.debug(
          "[WelcomeHeader] deriveNameFromToken: raw token ->",
          token
        );
      }
      if (!token) return "Guest";
      const payload = decodeTokenPayload(token);
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.debug(
          "[WelcomeHeader] deriveNameFromToken: token payload ->",
          payload
        );
      }
      if (payload?.name) return payload.name;
      if (payload?.given_name) return payload.given_name;
      if (payload?.email) {
        const local = String(payload.email).split("@")[0] || payload.email;
        const parts = local
          .replace(/[._+-]+/g, " ")
          .split(/\s+/)
          .filter(Boolean)
          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
        return parts.join(" ") || payload.email;
      }
      return "Guest";
    } catch (e) {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.error("[WelcomeHeader] deriveNameFromToken error:", e);
      }
      return "Guest";
    }
  };

  const [name, setName] = useState<string>(deriveNameFromToken());

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[WelcomeHeader] initial name from token ->", name);
    // eslint-disable-next-line no-console
    console.debug("[WelcomeHeader] document.cookie ->", document?.cookie);
  }

  useEffect(() => {
    if (name && name !== "Guest") {
      if (typeof window !== "undefined") {
        console.debug(
          "[WelcomeHeader] name already set, skipping profile fetch ->",
          name
        );
      }
      return;
    }

    const fetchProfile = async () => {
      try {
        if (typeof window !== "undefined") {
          console.debug(
            "[WelcomeHeader] fetchProfile: starting. current cookie ->",
            document.cookie
          );
        }

        const token = getToken();
        if (typeof window !== "undefined") {
          console.debug(
            "[WelcomeHeader] fetchProfile: token from getToken() ->",
            token
          );
        }

        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3000";

        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backend}/v1/user/profile`, {
          method: "GET",
          headers,
          // include credentials so cookies are sent if backend expects them
          credentials: "include",
        });

        if (typeof window !== "undefined") {
          console.debug(
            "[WelcomeHeader] fetchProfile: response status ->",
            res.status,
            res.statusText
          );
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "<no-body>");
          if (typeof window !== "undefined") {
            console.warn("[WelcomeHeader] fetchProfile: non-ok response ->", {
              status: res.status,
              body: text,
            });
          }
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        let data: any = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text().catch(() => "<no-body>");
          if (typeof window !== "undefined") {
            console.warn(
              "[WelcomeHeader] fetchProfile: expected JSON but got ->",
              text.slice(0, 400)
            );
          }
          return;
        }
        if (typeof window !== "undefined") {
          console.debug("[WelcomeHeader] fetchProfile: json ->", data);
        }
        if (data?.name) {
          if (typeof window !== "undefined") {
            console.debug(
              "[WelcomeHeader] fetchProfile: setting name ->",
              data.name
            );
          }
          setName(data.name);
        }
      } catch (e) {
        if (typeof window !== "undefined") {
          console.error("[WelcomeHeader] fetchProfile error ->", e);
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="w-full flex items-start justify-between gap-4 bg-transparent">
      <div className="flex flex-col gap-6">
        <p className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px]">
          Here&apos;s what&apos;s waiting for you today.
        </p>

        <h1 className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-4xl tracking-[0] leading-[15px] whitespace-nowrap">
          Welcome Back, {name}!
        </h1>
      </div>

      <div className="flex items-center gap-[10px]">
        <div className="relative w-[230px]">
          {/* <input
            type="text"
            placeholder="Search"
            className="flex h-9 w-full focus:text-light rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          /> */}
        </div>

        <button
          variant="outline"
          size="icon"
          className="relative flex items-center justify-center h-10 w-[43px] rounded-[14px] border border-solid border-[#f9f9f933] bg-transparent hover:bg-transparent">
          <img
            src={NotificationBell}
            alt="bell icon"
            className="w-[22px] h-[22px]"
          />
          {/* small notification dot positioned over the top-right of the icon */}
          <span className="absolute top-[10px] right-[13px] z-[1] w-[6px] h-[6px] bg-[#b7f272] rounded-full border border-white/20" />
        </button>

        <button className="h-10 px-[18px] bg-[#dda15e] rounded-[14px] border border-solid border-[#f9f9f933] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm tracking-[0] leading-[15px] hover:bg-[#dda15e]/90">
          Switch Mode
        </button>
      </div>
    </header>
  );
};

export default WelcomeHeaderSection;
