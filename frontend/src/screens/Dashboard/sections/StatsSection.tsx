import { StarIcon, ThumbsUpIcon } from "lucide-react";
import Fuego from "../../../index";

const statsData = [
  {
    label: "Win Rate",
    value: "87%",
    icon: ThumbsUpIcon,
  },
  {
    label: "Games Played",
    value: "134",
    icon: ThumbsUpIcon,
  },
  {
    label: "Ranking",
    value: "87%",
    icon: StarIcon,
  },
];

const StatsSection = ()  => {
  return (
    <div>
      {/* <section className="w-full flex gap-[26px] justify-center">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="w-[294px] h-[107px] rounded-[52px] border border-solid border-[#f9f9f91a] bg-transparent">
            <CardContent className="relative h-full p-0">
              <div className="absolute top-[17px] left-9 [font-family:'Questrial',Helvetica] font-normal text-white text-xl tracking-[0] leading-10 whitespace-nowrap">
                {stat.label}
              </div>
              <div className="absolute top-[50px] left-9 [font-family:'Questrial',Helvetica] font-normal text-white text-xl tracking-[0] leading-10 whitespace-nowrap">
                {stat.value}
              </div>
              <stat.icon className="absolute top-[31px] right-[33px] w-[30px] h-[30px] text-white" />
            </CardContent>
          </Card>
        ))}
      </section> */}
    </div>
  );
};

export default StatsSection;