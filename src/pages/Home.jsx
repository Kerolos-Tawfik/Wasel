import Hero from "../../../Wasel/src/components/home/Hero";
import Features from "../../../Wasel/src/components/home/Features";
import Categories from "../../../Wasel/src/components/home/Categories";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = ({ user, selectedRole }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (user && !selectedRole) {
      navigate(`/findwork`);
    } else if (user && selectedRole) {
      navigate(`/profile`);
    } else {
      navigate(`/`);
    }
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <Categories />
    </>
  );
};

export default Home;
