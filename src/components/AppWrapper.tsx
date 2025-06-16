// src/AppWrapper.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useTokenValidationOnFocus } from "../utils/tokenValidationFocus";

const AppWrapper = () => {
  useTokenValidationOnFocus(); // ✅ Called inside component

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 overflow-auto h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AppWrapper;
