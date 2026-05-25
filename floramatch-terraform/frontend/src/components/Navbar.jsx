import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header>

      <Link
        to="/"
        className="logo"
        style={{ textDecoration: "none" }}
      >
        FloraMatch
      </Link>

      <div className="nav-buttons">

        <Link to="/login">
          <button className="secondary-btn">
            Sign In
          </button>
        </Link>

        <Link to="/register">
          <button className="primary-btn">
            Register
          </button>
        </Link>

      </div>

    </header>
  );
}

export default Navbar;