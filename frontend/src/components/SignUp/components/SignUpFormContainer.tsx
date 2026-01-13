import Fuego from "../../../index";
import { Link } from "../../../library/Router/Router";

const SignUpFormContainer = ({
  name,
  email,
  password,
  confirmPassword,
  setName,
  setEmail,
  setPassword,
  setConfirmPassword,
  onSubmit,
  error,
  loading,
}) => {
  return (
    <>
      <div className="relative z-10 w-full max-w-[500px] mx-auto px-6">
        <div className="bg-[#1a1c1e] border border-[#333] rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="[font-family:'Questrial',Helvetica] font-normal text-light text-3xl mb-2">
              Create Account
            </h1>
            <p className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
              Join us and start your ping pong journey
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-500 text-sm [font-family:'Questrial',Helvetica]">
                {error}
              </p>
            </div>
          )}

          {/* Sign up form */}
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Name fields */}
            <div className="">
              <div className="space-y-2">
                <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica] disabled:opacity-50"
                  placeholder="First name"
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica] disabled:opacity-50"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica] disabled:opacity-50"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label className="[font-family:'Questrial',Helvetica] font-normal text-light text-sm block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full h-12 px-4 bg-[#2a2c2e] border border-[#444] rounded-lg text-light placeholder-[#ffffff60] focus:outline-none focus:border-[#dda15e] transition-colors [font-family:'Questrial',Helvetica] disabled:opacity-50"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 rounded border-[#444] bg-[#2a2c2e] text-[#dda15e] focus:ring-[#dda15e] focus:ring-2"
              />
              <span className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
                I agree to the{" "}
                <a href="#" className="text-[#dda15e] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#dda15e] hover:underline">
                  Privacy Policy
                </a>
              </span>
            </div>

            {/* Sign up button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#dda15e] hover:bg-[#cc9455] text-[#141517] rounded-lg [font-family:'Questrial',Helvetica] font-normal text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6">
            <p className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff80] text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-[#dda15e] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="[font-family:'Questrial',Helvetica] font-normal text-[#ffffff60] text-sm hover:text-light transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default SignUpFormContainer;
