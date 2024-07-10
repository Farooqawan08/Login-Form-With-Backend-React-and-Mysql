import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./loginform.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("http://localhost:8081/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
        }
      }
    };
    checkAuth();
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8081/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors([data.error || "Registration failed."]);
        return;
      }

      if (response.status === 201) {
        setIsLoggedIn(true);
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setUsername("");
        setPassword("");
      } else {
        const data = await response.json();
        setErrors([data.error]);
      }
      setTimeout(() => setErrors([]), 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors(["An error occurred during registration."]);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.status !== 200) {
        setErrors([data.error || "Login failed."]);
      } else {
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors(["An error occurred during login."]);
    }
    setTimeout(() => setErrors([]), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      {isLoggedIn ? (
        <div className="success-page">
          <h1>Login Successful</h1>
          <p>Welcome</p>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <h1>{isRegistering ? "Register" : "Login"}</h1>
          <div>
            {errors.length > 0 && <div className="error">{errors[0]}</div>}
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </div>
            </div>
          </div>
          {isRegistering ? (
            <button type="button" onClick={handleRegister}>
              Register
            </button>
          ) : (
            <button type="button" onClick={handleLogin}>
              Login
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </>
      )}
    </div>
  );
};

export default LoginForm;
