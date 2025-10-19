const GoogleAuth = () => {
  const handleGoogleLogin = () => {
    window.open(
      "http://localhost:3000/v1/auth/google",
      "Google Login",
      "width=500,height=600"
    );
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-green-500 w-[215px] py-3 rounded-[30px] text-light hover:bg-white/10">
      Google
    </button>
  );
};

export default GoogleAuth;
