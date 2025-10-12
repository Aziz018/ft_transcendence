import Fuego from "../../../index";

import { BellIcon, SearchIcon } from "lucide-react";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
import NotificationBell from "../../../assets/notification.svg";
import SecondaryButton from "../../../components/ui/SecondaryButton";
import { getToken, decodeTokenPayload } from "../../../lib/auth";
import { useEffect } from "../../../library/hooks/useEffect";
import { useState } from "../../../library/hooks/useState";
import ArrowReturn from "../../../assets/arrow-return.svg";
import { redirect } from "../../../library/Router/Router";

const WelcomeHeaderSection = () => {
  const deriveNameFromToken = () => {
    try {
      const token = getToken();
      if (!token) return "Guest";
      const payload = decodeTokenPayload(token);
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
      return "Guest";
    }
  };

  const [name, setName] = useState<string>(deriveNameFromToken());

  useEffect(() => {
    if (name && name !== "Guest") {
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = getToken();

        if (!token) {
          redirect("/");
          return;
        }

        const backend =
          (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
          "http://localhost:3000";

        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backend}/v1/user/profile`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        let data: any = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          return;
        }
        if (data?.name) {
          setName(data.name);
        }
      } catch (e) {
        console.error("Failed to fetch profile:", e);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="bg-r ed-500 w-full flex items-start justify-between gap-4 bg-transparent">
      <button onClick={() => redirect("/chat")}>
        <div className="flex flex- col gap -6 bg-light rounded-[14px] p-4 cursor-pointer hover:opacity-90 transition-colors duration-150">
          <div>
            <img src={ArrowReturn} alt="ArrowReturn icon" className="" />
          </div>
          <div>
            <img src={ArrowReturn} alt="ArrowReturn icon" className="" />
          </div>
        </div>
      </button>

      <div className="flex items-center gap-[10px]">
        <div className="relative w-[230px]">
          <input
            placeholder="Search"
            className="w-full h-full rounded-[14px] border-[1px] border-[#878782] p-3 bg-transparent pl-4 pr-12 [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-sm placeholder:text-[#878787] focus:outline-none"
          />
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
