import React from "react";
import SecondaryButton from "../../../components/ui/SecondaryButton";
import { Link } from "../../../router";

const sections = [
  {
    label: "PONGRUSH GAME SHOWDOWN",
    title:
      "Get Ready For Lightning Rallies And — Unstoppable Pongrush Game Action!",
    description:
      "Step Into The Arena Where Speed Meets Precision! Every Serve, Smash, And Rally Will Keep Your Heart Racing And Your Focus .",
    buttonText: "Play Now",
    buttonIcon: "/group-312.png",
  },
  {
    label: "TOURNAMENT [COMING SOON]",
    title:
      "Join The Thrilling World Of Pongrush Game Battles Where Every Shot Counts!",
    description:
      "Step Into Tournaments Where Legends Are Born And Rivalries Ignite With Explosive Intensity. Watch As Players Dance Around The Table With",
    buttonText: "Join",
    buttonIcon: "/group-312-1.png",
  },
];

const DashboardSection = () => {
  return (
    <section className="w-full flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-[200px] pt-8 md:pt-16 lg:pt-[100px]">
      <article className="w-full">
        <div className="flex flex-col gap-4 md:gap-6">
          <header>
            <p className="[-webkit-text-stroke:1px_#87878766] text-white text-[8px] md:text-[10px] leading-10 [font-family:'Questrial',Helvetica] font-normal tracking-[0] mb-1">
              {sections[0].label}
            </p>
            <h2 className="[-webkit-text-stroke:1px_#87878766] pt-2 md:pt-[10px] [font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-2xl md:text-3xl lg:text-4xl tracking-[0] leading-[40px] md:leading-[50px] lg:leading-[60px] max-w-full md:max-w-96">
              {sections[0].title}
            </h2>
          </header>

          <p className="[-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9b2] text-[8px] md:text-[10px] tracking-[0] leading-[18px] md:leading-[23px] max-w-full md:max-w-[321px]">
            {sections[0].description}
          </p>

          <div className="flex items-center gap-0">
            {/* <img
              className="w-[37px] h-[37px]"
              alt="Join icon"
              src={sections[1].buttonIcon}
            /> */}
            {/* <Button className="bg-[#dda15e] hover:bg-[#dda15e]/90 text-theme-text-primary rounded-[30px] h-[37px] px-6 [-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px]">
              {sections[1].buttonText}
            </Button> */}
            <Link to="/game">
              <SecondaryButton data={"Play Now"} />
            </Link>
          </div>
        </div>
      </article>
      <article className="w-full">
        <div className="flex flex-col gap-4 md:gap-6">
          <header>
            <p className="[-webkit-text-stroke:1px_#87878766] text-white text-[8px] md:text-[10px] leading-10 [font-family:'Questrial',Helvetica] font-normal tracking-[0] mb-1">
              {sections[1].label}
            </p>
            <h2 className="[-webkit-text-stroke:1px_#87878766] pt-2 md:pt-[10px] [font-family:'Questrial',Helvetica] font-normal text-theme-text-primary text-2xl md:text-3xl lg:text-4xl tracking-[0] leading-[40px] md:leading-[50px] lg:leading-[60px] max-w-full md:max-w-96">
              {sections[1].title}
            </h2>
          </header>

          <p className="[-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9b2] text-[8px] md:text-[10px] tracking-[0] leading-[18px] md:leading-[23px] max-w-full md:max-w-[321px]">
            {sections[1].description}
          </p>

          <div className="flex items-center gap-0">
            {/* <img
              className="w-[37px] h-[37px]"
              alt="Join icon"
              src={sections[1].buttonIcon}
            /> */}
            {/* <Button className="bg-[#dda15e] hover:bg-[#dda15e]/90 text-theme-text-primary rounded-[30px] h-[37px] px-6 [-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px]">
              {sections[1].buttonText}
            </Button> */}
            <Link to="/leaderboard">
              <SecondaryButton data={"Join Now"} />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
};

export default DashboardSection;
