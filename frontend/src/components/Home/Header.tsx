import React from "react";
import Logo from "../../assets/Logo.svg";
import Vector from "../../assets/Vector.svg";
import { Link } from "../../router";

const Header = () => {
  return (
    <header className="animate-[fadeInDown_0.8s_ease-out]">
      <nav className="pt-6 md:pt-12 lg:pt-[73px] px-4">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link
            to="/"
            className="flex items-center hover:scale-105 transition-transform duration-300">
            <img src={Logo} className="h-[35px] md:h-[45px] lg:h-[50px] w-auto" alt="Pongrush Logo" />
          </Link>
          <div className="flex items-center hover:rotate-12 transition-transform duration-300">
            <img src={Vector} className="h-[35px] md:h-[45px] lg:h-[50px] w-auto" alt="Vector" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
