import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <div className="bg-gray-900 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo - always on the left */}
          <Link
            to="/"
            className="text-white text-2xl font-bold flex items-center gap-2"
            onClick={closeMenu}
          >
            <FaTicketAlt /> Eventora
          </Link>

          {/* Desktop links - hidden below md, shown from md up */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-200 hover:text-white transition cursor-pointer"
            >
              Events
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-gray-200 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-200 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md font-semibold transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger icon - shown only below md, toggles the mobile menu */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile dropdown - only rendered when menuOpen is true, hidden on md+ */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 pb-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-gray-200 hover:text-white transition"
            >
              Events
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={closeMenu}
                  className="text-gray-200 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-md transition text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-gray-200 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md font-semibold transition text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
