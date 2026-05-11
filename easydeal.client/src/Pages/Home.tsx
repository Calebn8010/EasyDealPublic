import { useState } from 'react';
import AuthorizeView from "../Components/AuthorizeView.tsx";
import Navbar from "../Components/Navbar.tsx";
import WishlistPanel from "../Components/WishlistPanel.tsx";
import MainContent from "../Components/MainContent.tsx";
import type { WishlistItem } from "../Components/WishlistPanel.tsx";
import type { Deal } from "../Components/MainContent.tsx"

function Home() {
    const [deals, setDeals] = useState<any[]>([]);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [dealInfo, setInfo] = useState<any | null>(null);
    const [showWishlist, setShowWishlist] = useState(false);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
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

    async function handleAdd(deal: Deal) {
        const response = await fetch('wishlistupdates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deal)
        });
        if (response.status === 409) {
            showNotification('Game already in your Wishlist ✓', '#facc15', 6000);
        } else if (response.status === 200) {
            showNotification(`Added to Wishlist ✓ ${deal?.external}`, '#22c55e', 3500);
        } else {
            showNotification('Add to Wishlist unsuccessful, please try again later.', '#ef4444', 3500);
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

    async function handleDeleteWishlistItem(item: WishlistItem, index: number) {
        try {
            const response = await fetch('wishlistupdates', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: item.gameID, external: item.external }),
            });
            if (response.ok) {
                setWishlistItems(prev => prev.filter((_item, i) => i !== index));
                showNotification(`Removed from Wishlist: ${item.external}`, '#64748b', 2500);
            } else {
                showNotification('Could not remove item, please try again.', '#ef4444', 3500);
            }
        } catch {
            showNotification('Could not remove item, please try again.', '#ef4444', 3500);
        }
    }

    async function handleSetPriceAlert(item: WishlistItem, index: number, amount: string) {
        void index;
        try {
            const response = await fetch('wishlistpricealert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: item.gameID,
                    title: item.external,
                    targetPrice: parseFloat(amount),
                }),
            });
            if (response.ok) {
                showNotification(`Price alert set at $${amount} for ${item.external ?? item.title}`, '#22c55e', 3500);
            } else {
                showNotification('Could not set price alert, please try again.', '#ef4444', 3500);
            }
        } catch {
            showNotification('Could not set price alert, please try again.', '#ef4444', 3500);
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
                    onDelete={handleDeleteWishlistItem}
                    onSetAlert={handleSetPriceAlert}
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