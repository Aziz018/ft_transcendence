import React, { useState, useEffect } from "react";
import StarsFilled from "../../../assets/stars_filled.svg";
import Logo from "../../../assets/secondLogo.svg";
import ArrowSvg from "../../../assets/arrow.svg";
import { getToken } from "../../../lib/auth";

import { Link } from "../../../router";

const PongrushGameShowcaseSection = () => {
  const [userXP, setUserXP] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    fetchUserXP();
  }, []);

  const fetchUserXP = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.warn("[Dashboard] No token found");
        return;
      }

      const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";

      const res = await fetch(`${backend}/v1/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMsg = errorData?.message || errorData?.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error("[Dashboard] Could not parse error response", parseErr);
        }
        console.error(`[Dashboard] Request failed: ${errorMsg}`);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error(`[Dashboard] Expected JSON but got ${contentType}`);
        return;
      }

      const data = await res.json();
      console.log("[Dashboard] User profile data:", data);
      const xp = data?.xp || 0;
      console.log("[Dashboard] User XP:", xp);
      setUserXP(xp);
      animateXP(xp);
      fetchUserRank();
    } catch (error) {
      console.error("[Dashboard] Network or parsing error:", error);
    }
  };

  const fetchUserRank = async () => {
    try {
      const token = getToken();
      const backend = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "/api";
      const res = await fetch(`${backend}/v1/leaderboard/my-rank`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserRank(data.rank);
      }
    } catch (e) {
      console.error("Failed to fetch rank", e);
    }
  };

  const animateXP = (targetXP: number) => {
    const duration = 1500;
    const steps = 50;
    const increment = targetXP / steps;
    let currentStep = 0;

    setDisplayedXP(0);

    const counter = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayedXP(targetXP);
        clearInterval(counter);
      } else {
        setDisplayedXP(Math.floor(increment * currentStep));
      }
    }, duration / steps);
  };

  const formatXP = (xp: number) => {
    return xp.toLocaleString();
  };
  return (
    <div>
      <section className="w-full relative pt-8 sm:pt-12 md:pt-16 lg:pt-[100px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8 md:gap-12 lg:gap-[188px]">
          {/* Game Evolution Title */}
          <div className="flex flex-col gap-2">
            <div>
              <img alt="Stars filled" src={StarsFilled} className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="pt-2">
              <h2 className="[font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-2xl sm:text-3xl md:text-4xl tracking-[0] leading-tight sm:leading-[40px] md:leading-[50px]">
                My Pongrush Game <br /> Evolution
              </h2>
            </div>
          </div>

          {/* XP Display */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-[22px]">
            <p className="[font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-sm sm:text-base tracking-[0] leading-[15px]">
              You&apos;ve earned – keep going!
            </p>
            <p className="pt-2 sm:pt-3 font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-3xl sm:text-4xl md:text-5xl tracking-[0] leading-tight md:leading-[15px]">
              {formatXP(displayedXP)}xp
            </p>
          </div>

          {/* Leaderboard Link */}
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 [font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-base sm:text-lg tracking-[0] leading-[15px] underline hover:text-accent-green transition-colors touch-manipulation min-h-[44px]">
            View Full Leaderboard
            <img src={ArrowSvg} alt="arrow right icon" className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PongrushGameShowcaseSection;
