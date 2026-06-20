import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameBackground from "../Components/GameBackground";

function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rememberme, setRememberme] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "password") setPassword(value);
        if (name === "rememberme") setRememberme(e.target.checked);
    };

    const handleRegisterClick = () => {
        navigate("/register");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setError("");

        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    // Shows the specific message from the server e.g. "Please confirm your email..."
                    setError(data.message ?? "Error Logging In.");
                    return;
                }

                // If confirmed and password valid, cookie login
                const loginUrl = rememberme
                    ? "/login?useCookies=true"
                    : "/login?useSessionCookies=true";

                return fetch(loginUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
            })
            .then((cookieResponse) => {
                if (!cookieResponse) return; 
                if (cookieResponse.ok) {
                    window.location.href = "/home";
                } else {
                    setError("Error Logging In.");
                }
            })
            .catch((error) => {
                console.error(error);
                setError("Error Logging in.");
            });
    };

    return (
        <>
            <GameBackground />
            <div className="containerbox" style={{ position: "relative", zIndex: 1 }}>
                <h3>Login</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="forminput" htmlFor="email">Email:</label>
                    </div>
                    <div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                    </div>
                    <div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="rememberme"
                            name="rememberme"
                            checked={rememberme}
                            onChange={handleChange}
                        /><span>Remember Me</span>
                    </div>
                    <div>
                        <button type="submit">Login</button>
                    </div>
                    <div>
                        <button type="button" onClick={handleRegisterClick}>Register</button>
                    </div>
                </form>
                {error && <p className="error">{error}</p>}
            </div>
        </>
    );
}

export default Login;