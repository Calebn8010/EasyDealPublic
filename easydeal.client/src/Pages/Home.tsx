import { useState } from 'react';
import LogoutLink from "../Components/LogoutLink.tsx";
import AuthorizeView, { AuthorizedUser } from "../Components/AuthorizeView.tsx";
import SearchForm from "../Components/DealSearch.tsx";

function Home() {
    const [deals, setDeals] = useState<any[]>([]);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [dealInfo, setInfo] = useState<any | null>(null);
    const [showWishlist, setShowWishlist] = useState(false);
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    async function handleSearch(query: string) {
        setExpandedIdx(null);
        const response = await fetch('dealsearch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        setDeals(Array.isArray(data) ? data : []);
    }

    function showNotification(message: string, color: string, duration: number) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'notification';
        notification.style.backgroundColor = color;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), duration);
    }

    async function handleAdd(deal: object) {
        const response = await fetch('wishlistupdates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deal)
        });

        if (response.status === 409) {
            showNotification('Game is already in your Wishlist!', '#facc15', 6000);
        } else {
            showNotification('Added to Wishlist! ✓', '#22c55e', 3500);
        }
    }

    async function toggleExpand(idx: number, gameID: string) {
        setExpandedIdx(expandedIdx === idx ? null : idx);
        setInfo(null);

        const response = await fetch('bestdealinfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameID })
        });
        const data = await response.json();
        setInfo(data);
    }

    async function handleOpenWishlist() {
        setShowWishlist(true);
        setWishlistLoading(true);
        try {
            const response = await fetch('wishlistupdates', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setWishlistItems(Array.isArray(data) ? data : []);
        } catch {
            setWishlistItems([]);
        } finally {
            setWishlistLoading(false);
        }
    }

    return (
        <AuthorizeView>
            {/* Top navbar */}
            <div className="navbar">
                <span className="navbar-user">
                    <LogoutLink>Logout <AuthorizedUser value="email" /></LogoutLink>
                </span>

                <button className="wishlist-btn" onClick={handleOpenWishlist}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    Wishlist
                </button>
            </div>

            {/* Wishlist slide-in panel */}
            {showWishlist && (
                <div className="wishlist-overlay">
                    <div className="wishlist-backdrop" onClick={() => setShowWishlist(false)} />
                    <div className="wishlist-panel">
                        <div className="wishlist-header">
                            <h2 className="wishlist-title">❤️ My Wishlist</h2>
                            <button
                                className="wishlist-close-btn"
                                onClick={() => setShowWishlist(false)}
                                aria-label="Close wishlist"
                            >×</button>
                        </div>

                        {wishlistLoading ? (
                            <p className="wishlist-empty">Loading your wishlist…</p>
                        ) : wishlistItems.length === 0 ? (
                            <p className="wishlist-empty">No games in your wishlist yet. Search and add some!</p>
                        ) : (
                            <ul className="wishlist-list">
                                {wishlistItems.map((item, i) => (
                                    <li key={i} className="wishlist-item">
                                        {item.thumb && (
                                            <img src={item.thumb} alt={item.external} className="wishlist-item-thumb" />
                                        )}
                                        <div>
                                            <div className="wishlist-item-title">{item.external ?? item.title ?? 'Game'}</div>
                                            {item.cheapest && (
                                                <div className="wishlist-item-price">Best: ${item.cheapest}</div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 main-content">
                <h4>Search for Steam games to add into your EasyDeal Wishlist</h4>
                <SearchForm onSearch={handleSearch} />
                <ul className="list">
                    {deals.map((deal, idx) => (
                        <li key={idx} className="list-item relative">
                            <img className="deal-img" src={deal.thumb} />
                            <span className="list-item-values">{deal.external ?? "Untitled Deal"}</span>
                            <div className="actions">
                                <span
                                    className="list-item-deal"
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: '#2563eb' }}
                                    onClick={() => window.open(`https://www.cheapshark.com/redirect?dealID=${deal.cheapestDealID}`, '_blank')}
                                >
                                    Best deal today: ${deal.cheapest ?? "No deal found"}
                                </span>
                                <button
                                    className="add ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={() => handleAdd(deal)}
                                >
                                    Add
                                </button>
                                <button
                                    className="drop-down"
                                    onClick={() => toggleExpand(idx, deal.gameID)}
                                    aria-label="Expand details"
                                    style={{ visibility: expandedIdx === idx ? 'hidden' : 'visible' }}
                                >
                                    {expandedIdx === idx ? '▲' : '▼'}
                                </button>
                            </div>
                            {expandedIdx === idx && (
                                <div className="extra-info">
                                    {dealInfo ? (
                                        <>
                                            <div className="best-deal-ever">
                                                <strong>Best Deal Ever: $</strong>
                                                {dealInfo.cheapestPriceEver}
                                            </div>
                                            <div>Date: {dealInfo.date}</div>
                                        </>
                                    ) : (
                                        <div>Loading...</div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </AuthorizeView>
    );
}

export default Home;