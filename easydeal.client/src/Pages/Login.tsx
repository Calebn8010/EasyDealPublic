import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GameBackground from "../Components/GameBackground";
import ErrorPopup from "../Components/ErrorPopup";

function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rememberme, setRememberme] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showResend, setShowResend] = useState<boolean>(false);  
    const [resendStatus, setResendStatus] = useState<string>("");  
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

    const handleResendConfirmation = () => {
        setResendStatus("Sending...");
        fetch("/api/auth/resend-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                clientBaseUrl: window.location.origin
            }),
        })
            .then(() => {
                setResendStatus("");
                setError(`Confirmation email sent to ${email}. Check your inbox and spam folder.`);
                setShowResend(false);
            })
            .catch(() => setResendStatus("Failed to resend. Please try again."));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setError("");
        setShowResend(false); 
        setResendStatus(""); 

        fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    setError(data.message ?? "Error Logging In.");
                    // Show resend button only for unconfirmed email error
                    if (data.message?.includes("confirm your email")) {
                        setShowResend(true);
                    }
                    return;
                }

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

                {/*Resend confirmation banner — only shows after unconfirmed email error */}
                {showResend && (
                    <div className="resend-banner">
                        <span className="resend-icon">ℹ️</span>
                        <span className="resend-text">Didn't get the confirmation email?</span>
                        <button
                            className="resend-button"
                            onClick={handleResendConfirmation}
                            type="button"
                        >
                            {resendStatus === "Sending..." ? "Sending..." : "Resend Email"}
                        </button>
                    </div>
                )}

                {error && <ErrorPopup message={error} onClose={() => setError("")} />}
            </div>
        </>
    );
}

export default Login;