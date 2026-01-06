const GoogleAuth = () => {
  const handleGoogleLogin = () => {
    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3000";
    window.open(
      `${backend}/v1/auth/google`,
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
