import { Link } from "../../library/Router/Router";

const AuthIntra = () => {
  return (
    <div className="space-y-4">
      <Link to="/login" className="px-3 py-2 text-gray-700 hover:text-gray-900">
        <button className="bg-blue-500 w-[215px] py-3 rounded-[30px] text-white hover:bg-white/10">
          Intra
        </button>
      </Link>
    </div>
  );
};

export default AuthIntra;
