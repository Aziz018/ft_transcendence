import Fuego from "../../../index";

const BackgroundBlurEffect = () => {
  return (
    <div className="absolute top-[400px] left-[-540px] w-[1275px] h-[1198px]">
      <div className="top-[298px] left-[375px] w-[900px] h-[900px] bg-[#f9f9f980] rounded-[450px] absolute blur-[153px]" />
      <div className="top-0 left-0 w-[700px] h-[700px] bg-[#dda15e] rounded-[350px] absolute blur-[153px]" />
    </div>
  );
};
export default BackgroundBlurEffect;
