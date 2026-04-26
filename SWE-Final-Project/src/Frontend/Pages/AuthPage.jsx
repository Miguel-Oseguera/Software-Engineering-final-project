import React, { useState } from "react";
import "../Css/AuthPage.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            is_admin: Number(data.is_admin || 0),
          })
        );

        window.location.href = "/";
      } else {
        alert("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !email) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("User created!");
        setIsLogin(true);
      } else {
        alert("Error creating user");
      }
    } catch (err) {
      console.error(err);
      alert("Register error");
    }
  };

  return (
    <div className="container">
      <div className="card full">
        <div className="card-header">
          <h2>
            fake<span className="amazon">amazon</span>
          </h2>
          <p>NOT THE REAL ONE</p>
        </div>

        <div className="card-body">
          <div className="form-box">
            <h1 className="title">
              {isLogin ? "Login Screen" : "Create User Screen"}
            </h1>

            <label>USERNAME</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />

            <label>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {!isLogin && (
              <>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </>
            )}

            {isLogin && (
              <p className="link" onClick={() => setIsLogin(false)}>
                Create User
              </p>
            )}

            <button onClick={isLogin ? handleLogin : handleRegister}>
              {isLogin ? "Login" : "Create User"}
            </button>

            {!isLogin && (
              <p className="link center" onClick={() => setIsLogin(true)}>
                Back to Login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}