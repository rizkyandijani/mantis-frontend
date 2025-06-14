// src/AppWrapper.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import { useTokenValidationOnFocus } from "../utils/tokenValidationFocus";

const AppWrapper = () => {
  useTokenValidationOnFocus(); // ✅ Called inside component

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default AppWrapper;
