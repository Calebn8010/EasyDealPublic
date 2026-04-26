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
        Object.assign(notification.style, {
            position: 'fixed',
            top: '70px', // below the navbar
            right: '20px',
            backgroundColor: color,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: '9999',
            maxWidth: '90vw',
        });
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
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            }}>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    <LogoutLink>Logout <AuthorizedUser value="email" /></LogoutLink>
                </span>

                {/* Wishlist Button */}
                <button
                    onClick={handleOpenWishlist}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#4f46e5', color: '#fff',
                        border: 'none', borderRadius: '999px',
                        padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600,
                        cursor: 'pointer', boxShadow: '0 2px 6px rgba(79,70,229,0.4)',
                        transition: 'background 0.15s',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
                >
                    {/* Heart icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    Wishlist
                </button>
            </div>

            {/* Wishlist slide-in panel */}
            {showWishlist && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    display: 'flex', justifyContent: 'flex-end',
                }}>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowWishlist(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }}
                    />
                    {/* Panel */}
                    <div style={{
                        position: 'relative', zIndex: 1,
                        width: '100%', maxWidth: '500px',
                        height: '100%', overflowY: 'auto',
                        background: '#fff',
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                        padding: '24px 20px',
                        display: 'flex', flexDirection: 'column', gap: '16px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>❤️ My Wishlist</h2>
                            <button
                                onClick={() => setShowWishlist(false)}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.5rem',
                                    cursor: 'pointer', color: '#6b7280', lineHeight: 1,
                                }}
                                aria-label="Close wishlist"
                            >×</button>
                        </div>

                        {wishlistLoading ? (
                            <p style={{ color: '#9ca3af' }}>Loading your wishlist…</p>
                        ) : wishlistItems.length === 0 ? (
                            <p style={{ color: '#9ca3af' }}>No games in your wishlist yet. Search and add some!</p>
                        ) : (
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {wishlistItems.map((item, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: '#f9fafb', borderRadius: '10px', padding: '10px',
                                    }}>
                                        {item.thumb && (
                                            <img src={item.thumb} alt={item.external} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.external ?? item.title ?? 'Game'}</div>
                                            {item.cheapest && (
                                                <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 500 }}>
                                                    Best: ${item.cheapest}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Main search (offset for fixed navbar) */}
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100" style={{ paddingTop: '64px' }}>
                <h4>Search for PC games to add into your EasyDeal list</h4>
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