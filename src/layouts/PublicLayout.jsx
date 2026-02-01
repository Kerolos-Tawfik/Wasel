import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const PublicLayout = ({ user, userProfile }) => {
  return (
    <>
      <Header user={user} userProfile={userProfile} />
      <main style={{ minHeight: "calc(100vh - 200px)" }}>
        <Outlet />
      </main>
      <Footer user={user} />
    </>
  );
};

export default PublicLayout;
