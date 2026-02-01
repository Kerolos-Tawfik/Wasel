import Hero from "../../../Wasel/src/components/home/Hero";
import Features from "../../../Wasel/src/components/home/Features";
import Categories from "../../../Wasel/src/components/home/Categories";
import FeaturedServices from "../../../Wasel/src/components/home/FeaturedServices";
import FAQ from "../../../Wasel/src/components/home/FAQ";
import ContactUs from "../../../Wasel/src/components/home/ContactUs";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Home = ({ user, selectedRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      if (selectedRole === "client") {
        navigate("/addwork");
      } else if (selectedRole === "provider") {
        navigate("/findwork");
      } else {
        navigate("/findwork");
      }
      return;
    }

    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, user, selectedRole, navigate]);

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedServices />
      <Features />
      <FAQ />
      <ContactUs />
    </>
  );
};

export default Home;
