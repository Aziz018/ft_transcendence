import SecondaryButton from "../../../components/ui/SecondaryButton";
import Fuego from "../../../index";
import { Link } from "../../../library/Router/Router";
// import { Button } from "../../../../components/ui/button";

const sections = [
  {
    label: "PING PONG SHOWDOWN",
    title:
      "Get Ready For Lightning Rallies And — Unstoppable Ping Pong Action!",
    description:
      "Step Into The Arena Where Speed Meets Precision! Every Serve, Smash, And Rally Will Keep Your Heart Racing And Your Focus .",
    buttonText: "Play Now",
    buttonIcon: "/group-312.png",
  },
  {
    label: "TOURNAMENT",
    title:
      "Join The Thrilling World Of Ping — Pong Battles Where Every Shot Counts!",
    description:
      "Step Into Tournaments Where Legends Are Born And Rivalries Ignite With Explosive Intensity. Watch As Players Dance Around The Table With",
    buttonText: "Join",
    buttonIcon: "/group-312-1.png",
  },
];

const DashboardSection = () => {
  return (
    <section className=" w-full flex flex-col lg:flex-row gap-[200px] pt-[100px]">
      <article className="">
        <div className="flex flex-col gap-6">
          <header>
            <p className="[-webkit-text-stroke:1px_#87878766] text-white text-[10px] leading- 10 [font-family:'Questrial',Helvetica] font-normal tracking-[0] mb-1">
              {sections[0].label}
            </p>
            <h2 className="[-webkit-text-stroke:1px_#87878766] pt-[10px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-4xl tracking-[0] leading-[60px] max-w-96">
              {sections[0].title}
            </h2>
          </header>

          <p className="[-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9b2] text-[10px] tracking-[0] leading-[23px] max-w-[321px]">
            {sections[0].description}
          </p>

          <div className="flex items-center gap-0">
            {/* <img
              className="w-[37px] h-[37px]"
              alt="Join icon"
              src={sections[1].buttonIcon}
            /> */}
            {/* <Button className="bg-[#dda15e] hover:bg-[#dda15e]/90 text-[#f9f9f9] rounded-[30px] h-[37px] px-6 [-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px]">
              {sections[1].buttonText}
            </Button> */}
            <Link to="/leaderboard">
              <SecondaryButton data={"Play Now"} />
            </Link>
          </div>
        </div>
      </article>
      <article className="">
        <div className="flex flex-col gap-6">
          <header>
            <p className="[-webkit-text-stroke:1px_#87878766] text-white text-[10px] leading- 10 [font-family:'Questrial',Helvetica] font-normal tracking-[0] mb-1">
              {sections[1].label}
            </p>
            <h2 className="[-webkit-text-stroke:1px_#87878766] pt-[10px] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9] text-4xl tracking-[0] leading-[60px] max-w-96">
              {sections[1].title}
            </h2>
          </header>

          <p className="[-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-[#f9f9f9b2] text-[10px] tracking-[0] leading-[23px] max-w-[321px]">
            {sections[1].description}
          </p>

          <div className="flex items-center gap-0">
            {/* <img
              className="w-[37px] h-[37px]"
              alt="Join icon"
              src={sections[1].buttonIcon}
            /> */}
            {/* <Button className="bg-[#dda15e] hover:bg-[#dda15e]/90 text-[#f9f9f9] rounded-[30px] h-[37px] px-6 [-webkit-text-stroke:1px_#87878766] [font-family:'Questrial',Helvetica] font-normal text-base tracking-[0] leading-[15px]">
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
