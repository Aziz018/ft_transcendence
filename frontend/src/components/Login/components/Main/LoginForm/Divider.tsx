
import React from "react";
const Divider = () => {
  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#444]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#1a1c1e] text-[#ffffff60] [font-family:'Questrial',Helvetica]">
            Or continue with
          </span>
        </div>
      </div>
    </>
  );
};

export default Divider;
