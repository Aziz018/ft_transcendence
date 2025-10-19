import Fuego from "../../index";
import Logo from "../../assets/Logo.svg";
import Vector from "../../assets/Vector.svg";
import { Link } from "../../library/Router/Router";

const Header = () => {
  return (
    <header className="animate-[fadeInDown_0.8s_ease-out]">
      <nav class="bg- red-500 pt-[73px]">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link
            to="/"
            class="flex items-center hover:scale-105 transition-transform duration-300">
            <img src={Logo} class="h-[50px] w-[188px]" alt="Pongrush Logo" />
          </Link>
          <div class="flex items-center hover:rotate-12 transition-transform duration-300">
            <img src={Vector} class="h-[50px] w-auto" alt="Vector" />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
