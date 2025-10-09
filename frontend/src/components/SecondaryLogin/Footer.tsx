import Fuego from "../../index";

const Footer = () => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-light opacity-50 pt- [140px] w-[200px] text-[10px]">
          © 2025 — Built with passion by Ibnoukhalkane
        </p>
      </div>
      <div>
        <p className="text-light text-[14px]">Start Ping Pong</p>
        <div className="flex gap-[2px] pt-[4px]">
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
          <span className="w-[14.4px] h-[2px] bg-light rounded-full block"></span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
