import { Link } from "../../../../library/Router/Router";
import Fuego from "../../../../index";

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
