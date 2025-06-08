// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/checklist", label: "Checklist" },
    { to: "/approval", label: "Approval" },
    { to: "/machines", label: "Machines" },
    // { to: "/schedule", label: "Schedule" },
    // { to: "/notifications", label: "Notifications" },
    // { to: "/status", label: "Status" },
  ];

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
        {links.map((link) => (
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
    </nav>
  );
};

export default Navbar;
