import Fuego from "../../index";
import Footer from "../../components/Home/Footer";
import Header from "../../components/Home/Header";
import Main from "../../components/Home/Main";
import BackgroundBlurEffect from "../../components/ui/BlurEffect/BackgroundBlurEffect";

const Home = () => {
  return (
    <div className="bg-theme-bg-primary overflow-hidden w-full min-h-screen relative">
      <BackgroundBlurEffect />
      <div className="max-w-layout m-auto">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
