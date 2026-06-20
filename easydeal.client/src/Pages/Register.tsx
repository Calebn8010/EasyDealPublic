import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameBackground from "../Components/GameBackground";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");  

    const handleLoginClick = () => {
        navigate("/login");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        if (name === "password") setPassword(value);
        if (name === "confirmPassword") setConfirmPassword(value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
        } else if (password !== confirmPassword) {
            setError("Passwords do not match.");
        } else {
            setError("");
            setSuccess("");

            // Only change: URL, body, and response handling
            fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    clientBaseUrl: window.location.origin,  // e.g. https://localhost:5173
                }),
            })
                .then(async (response) => {
                    const data = await response.json();
                    if (response.ok) {
                        setSuccess("Registration successful! Please check your email to confirm your account.");
                    } else {
                        setError(data.message ?? "Error registering.");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setError("Network Error registering.");
                });
        }
    };

    return (
        <>
            <GameBackground />
            <div className="containerbox" style={{ position: "relative", zIndex: 1 }}>
                <h3>Register</h3>

                {/* Hide form after successful registration */}
                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">Email:</label>
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
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                        </div>
                        <div>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <button type="submit">Register</button>
                        </div>
                        <div>
                            <button type="button" onClick={handleLoginClick}>Go to Login</button>
                        </div>
                    </form>
                ) : (
                    // Shown after successful registration
                    <div>
                        <p style={{ color: "green" }}>{success}</p>
                        <button onClick={handleLoginClick}>Go to Login</button>
                    </div>
                )}

                {error && <p className="error">{error}</p>}
            </div>
        </>
    );
}

export default Register;