import React from "react";
import { Link } from "../../../../router";

const SignUpLink = () => {
  return (
    <>
      <div className="text-center mt-6">
        <p className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#dda15e] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignUpLink;
