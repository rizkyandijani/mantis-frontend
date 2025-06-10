// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/user";

const Navbar: React.FC = () => {
  const { role, logout } = useAuth();
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
    <nav className="bg-gray-800 text-white px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Mantis</div>
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
      <div className={`mt-2 sm:flex ${menuOpen ? "block" : "hidden"}`}>
        {allowedLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block sm:inline-block px-3 py-2 rounded hover:bg-gray-700 ${
              location.pathname === link.to ? "bg-gray-700" : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="ml-auto">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
