import Fuego from "../../index";
import Button from "../ui/button";
import Shape from "../../assets/Shape.svg";
import { Link } from "../../library/Router/Router";

const Main = () => {
  return (
    <div className="py-[11%] relative">
      <div className="absolute opacity-[0.02] left-[530px] top-[30px]">
        <img src={Shape} className="w-auto h-[680px]" />
      </div>
      <h5 className="text-light opacity-50 pt- [100px] pb-[20px] text-[18px]">
        Master the Game with Just One Swing
      </h5>
      <h1 className="text-light text-[45px] leading-[90px] w-[580px] pb-[45px] font-family[Questrial]">
        One Swing to Rule the Table  A Power Move to Conquer Every Rally.
      </h1>
      <Link to="/secondary-login">
        <Button />
      </Link>
      <div className="flex justify-end">
        <p className="text-light w-[444px] leading-[35px] text-[16px]">
          Step up, take aim, and unleash your winning swing. Every shot is your
          chance to dominate the table, outplay your rivals, and claim victory
          in style.
        </p>
      </div>
    </div>
  );
};

export default Main;
