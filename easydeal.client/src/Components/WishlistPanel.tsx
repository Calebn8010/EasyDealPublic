interface WishlistItem {
    thumb?: string;
    external?: string;
    title?: string;
    cheapest?: string;
}

interface Props {
    items: WishlistItem[];
    loading: boolean;
    onClose: () => void;
}

function WishlistPanel({ items, loading, onClose }: Props) {
    return (
        <div className="wishlist-overlay">
            <div className="wishlist-backdrop" onClick={onClose} />
            <div className="wishlist-panel">
                <div className="wishlist-header">
                    <h2 className="wishlist-title">❤️ My Wishlist</h2>
                    <button className="wishlist-close-btn" onClick={onClose} aria-label="Close wishlist">
                        ×
                    </button>
                </div>

                {loading ? (
                    <p className="wishlist-empty">Loading your wishlist…</p>
                ) : items.length === 0 ? (
                    <p className="wishlist-empty">No games in your wishlist yet. Search and add some!</p>
                ) : (
                    <ul className="wishlist-list">
                        {items.map((item, i) => (
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
    );
}

export default WishlistPanel;