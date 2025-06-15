// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/user";
import mantis_logo from "../../public/mantis_icon2.png";

const Navbar: React.FC = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();
  console.log("cek role", role);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      roles: [UserRole.ADMIN, UserRole.INSTRUCTOR],
    },
    {
      to: "/question",
      label: "Question List",
      roles: [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT],
    },
    {
      to: "/approval",
      label: "Approval",
      roles: [UserRole.ADMIN, UserRole.INSTRUCTOR],
    },
    {
      to: "/machines",
      label: "Machines",
      roles: [UserRole.ADMIN, UserRole.INSTRUCTOR],
    },
    // { to: "/schedule", label: "Schedule" },
    // { to: "/notifications", label: "Notifications" },
    // { to: "/status", label: "Status" },
  ];

  const allowedLinks = role
    ? links.filter((link) => link.roles.includes(role as UserRole))
    : [];

  const handleLogout = () => {
    logout(); // clear token & role in context
    navigate("/login"); // go back to login page
  };

  console.log("cek allowed links", allowedLinks);
  return (
    <nav className="bg-blue-700 text-white px-4 py-2 h-auto">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center">
          <img
            alt="Mantis Logo"
            className="mx-auto h-8 w-8"
            src={mantis_logo}
          />
          <span className="align-middle px-2">Mantis</span>
        </div>
        {role && (
          <button
            className="text-white focus:outline-none cursor-pointer px-3 py-2 rounded hover:bg-blue-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        )}
      </div>
      {menuOpen && (
        <div className={`sm:flex flex-col`}>
          {allowedLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block sm:inline-block px-3 py-2 rounded hover:bg-blue-500 ${
                location.pathname === link.to ? "bg-blue-500" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {role && (
            <button
              onClick={handleLogout}
              className="sm:ml-3 px-3 py-2 rounded hover:bg-blue-500 cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
