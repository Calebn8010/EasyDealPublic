import { useState } from 'react';
import AuthorizeView from "../Components/AuthorizeView.tsx";
import Navbar from "../Components/Navbar.tsx";
import WishlistPanel from "../Components/WishlistPanel.tsx";
import MainContent from "../Components/MainContent.tsx";

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
            <Navbar onOpenWishlist={handleOpenWishlist} />

            {showWishlist && (
                <WishlistPanel
                    items={wishlistItems}
                    loading={wishlistLoading}
                    onClose={() => setShowWishlist(false)}
                />
            )}

            <MainContent
                deals={deals}
                expandedIdx={expandedIdx}
                dealInfo={dealInfo}
                onSearch={handleSearch}
                onAdd={handleAdd}
                onToggleExpand={toggleExpand}
            />
        </AuthorizeView>
    );
}

export default Home;