

import React from "react";
const WelcomeHeaderSection = () => {
  return (
    <header className="w-full flex justify-between items-start gap-[193px] bg-transparent">
      <div className="w-[401px] h-[55px] flex flex-col gap-[24.8px]">
        <div className="w-[250px] h-[15.22px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f980] text-base tracking-[0] leading-[15px] whitespace-nowrap">
          {/* Here&apos;s what&apos;s waiting for you today. */}
        </div>

        <div className="w-[397px] h-[15px] [font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-4xl tracking-[0] leading-[15px] whitespace-nowrap">
          {/* Welcome Back, Evaplea! */}
        </div>
      </div>

      <div className="w-[407px] h-10 relative">
        <div className="flex items-center gap-[10px]">
          <div className="relative w-[230px]">
            {/* <SearchIcon className="absolute w-[10px] h-[10px] top-[15px] left-[15px] text-[#f9f9f980]" /> */}
            {/* <Input
              placeholder="Search"
              className="w-full h-10 pl-[35px] pr-4 bg-transparent rounded-[14px] border border-solid border-[#f9f9f933] text-[#f9f9f980] text-[11px] [font-family:'Questrial',Helvetica] placeholder:text-[#f9f9f980] placeholder:text-[11px] focus:border-[#f9f9f933] focus:ring-0"
            /> */}
          </div>

          <div className="relative">
            {/* <Button
              variant="ghost"
              size="icon"
              className="w-[43px] h-10 bg-transparent rounded-[14px] border border-solid border-[#f9f9f933] hover:bg-transparent">
              <BellIcon className="w-[22px] h-[22px] text-theme-text-primary" />
            </Button> */}
            <div className="absolute top-[9px] right-[11px] w-[5px] h-[5px] bg-[#b7f272] rounded-[2.5px]" />
          </div>

          {/* <Button className="w-[117px] h-10 bg-[#dda15e] rounded-[14px] border border-solid border-[#f9f9f933] hover:bg-[#dda15e]/90 [font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-sm tracking-[0] leading-[15px] h-auto">
            Switch Mode
          </Button> */}
        </div>
      </div>
    </header>
  );
};

export default WelcomeHeaderSection;