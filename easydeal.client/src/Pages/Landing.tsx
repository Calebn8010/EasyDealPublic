import { Link } from 'react-router-dom';
import GameBackground from "../Components/GameBackground";

function Landing() {
    return (
        <>
            <GameBackground />
            <div className="landing">
                <div className="landing-brand">
                    <i className="ti ti-tag" aria-hidden="true"></i>
                    <span>EASYDEAL</span>
                </div>
                <header className="landing-hero">
                    <h1>Your best game deals, all in one place</h1>
                    <p>
                        Powered by CheapShark API — find Steam game deals, view historical price
                        lows, and set email alerts when a game hits your target price.
                    </p>
                </header>
                <div className="landing-actions">
                    <Link to="/register" className="btn btn-primary">
                        <i className="ti ti-user-plus" aria-hidden="true"></i> Create account
                    </Link>
                    <Link to="/login" className="btn btn-outline">
                        <i className="ti ti-login" aria-hidden="true"></i> Sign in
                    </Link>
                </div>
                <div className="landing-features">
                    <div className="feature">
                        <i className="ti ti-bell" aria-hidden="true"></i>
                        <span className="feature-title">Price alerts</span>
                        <span className="feature-desc">Email when price drops</span>
                    </div>
                    <div className="feature">
                        <i className="ti ti-history" aria-hidden="true"></i>
                        <span className="feature-title">Historical lows</span>
                        <span className="feature-desc">See all-time best prices</span>
                    </div>
                    <div className="feature">
                        <i className="ti ti-heart" aria-hidden="true"></i>
                        <span className="feature-title">Wishlist</span>
                        <span className="feature-desc">Track games you want</span>
                    </div>
                </div>
                <footer className="landing-footer">
                    <small>Steam PC platform only</small>
                </footer>
            </div>
        </>
    );
}

export default Landing;