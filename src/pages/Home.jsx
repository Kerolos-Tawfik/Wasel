import Hero from "../../../Wasel/src/components/home/Hero";
import Features from "../../../Wasel/src/components/home/Features";
import Categories from "../../../Wasel/src/components/home/Categories";
import ContactUs from "../../../Wasel/src/components/home/ContactUs";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Home = ({ user, selectedRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for scroll request
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Clear state to prevent scroll on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location]);

  return (
    <>
      <Hero />
      <Features />
      <Categories />
      <ContactUs />
    </>
  );
};

export default Home;
