import React from "react";
import { Link } from "../../../../router";

const BackToHome = () => {
  return (
    <div>
      <div className="text-center mt-6">
        <Link
          to="/"
          className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff60] text-sm hover:text-light transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BackToHome;
