import { MyReact } from "../../lib/core";
import { Link } from "../../lib/router";

function Home() {
  return (
    <div className="bg-[#141517] min-h-screen w-full overflow-hidden relative">
      <main className="px-[153px] pt-[118px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <div className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-xl">
              Master The Game With Just One Swing
            </div>

            <h1 className="[font-family:'Questrial',Helvetica] font-normal text-white text-5xl leading-[87px] max-w-[686px]">
              One Swing To Rule The Table <br />a Power Move To Conquer Every
              Rally.
            </h1>

            <div className="space-y-4">
              <Link
                to="/login"
                className="px-3 py-2 text-gray-700 hover:text-gray-900">
                <button className="bg-red-500 w-[215px] py-3 rounded-[30px] text-white hover:bg-white/10">
                  Login
                </button>
              </Link>
            </div>
          </div>

          <div className="pt-[200px]">
            <p className="text-white text-base leading-[35px] max-w-[444px]">
              Step Up, Take Aim, And Unleash Your Winning Swing. Every Shot Is
              Your Chance To Dominate The Table, Outplay Your Rivals, And Claim
              Victory In Style.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
