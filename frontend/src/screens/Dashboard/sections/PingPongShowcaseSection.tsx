import Fuego from "../../../index";
import { useState } from "../../../library/hooks/useState";
import { useEffect } from "../../../library/hooks/useEffect";
import StarsFilled from "../../../assets/stars_filled.svg";
import Logo from "../../../assets/secondLogo.svg";
import ArrowSvg from "../../../assets/arrow.svg";
import { getToken } from "../../../lib/auth";

import React from "react";
import { Link } from "../../../library/Router/Router";

const PingPongShowcaseSection = () => {
  const [userXP, setUserXP] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);

  useEffect(() => {
    fetchUserXP();
  }, []);

  const fetchUserXP = async () => {
    try {
      const backend =
        (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
        "http://localhost:3001";
      const token = getToken();

      if (!token) {
        console.log("[Dashboard] No token found");
        return;
      }

      const res = await fetch(`${backend}/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[Dashboard] User profile data:", data);
        const xp = data.xp || 0;
        console.log("[Dashboard] User XP:", xp);
        setUserXP(xp);
        animateXP(xp);
      } else {
        console.error(
          "[Dashboard] Failed to fetch profile. Status:",
          res.status
        );
      }
    } catch (error) {
      console.error("[Dashboard] Failed to fetch user XP:", error);
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
      <section className="w-full relative pt-[100px]">
        <div className="flex items-center  gap-[188px]">
          <div className="flex flex-col gap-2">
            <div>
              <img alt="Stars filled" src={StarsFilled} />
            </div>
            <div className="pt-2">
              <h2 className="[font-family:'Questrial',Helvetica] font-normal text-theme-primary text-4xl tracking-[0] leading-[50px] whitespace-nowrap">
                My Ping Pong <br /> Evolution
              </h2>
            </div>
          </div>

          {/* <Separator orientation="vertical" className="h-[58px] bg-white/20" /> */}

          <div className="flex flex-col gap-[22px]">
            <p className="[font-family:'Questrial',Helvetica] font-normal text-theme-secondary text-base tracking-[0] leading-[15px] whitespace-nowrap">
              You&apos;ve earned – keep going!
            </p>
            <p className="pt-3 font-family:'Questrial',Helvetica] font-normal text-theme-primary text-5xl tracking-[0] leading-[15px] whitespace-nowrap">
              {formatXP(displayedXP)}xp
            </p>
          </div>

          {/* <Separator orientation="vertical" className="h-[58px] bg-white/20" /> */}

          <Link
            to="/leaderboard"
            className="flex items-center gap-2 [font-family:'Questrial',Helvetica] font-normal text-theme-primary text-[18px] tracking-[0] leading-[15px] underline whitespace-nowrap">
            View Full Leaderboard
            <img src={ArrowSvg} alt="arrow right icon" className="w-4 h-4" />
            {/* <ArrowRightIcon className="w-4 h-4" /> */}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PingPongShowcaseSection;
