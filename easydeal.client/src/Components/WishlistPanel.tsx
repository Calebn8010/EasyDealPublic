import { useState } from 'react';

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
    onDelete?: (item: WishlistItem, index: number) => void;
    onSetAlert?: (item: WishlistItem, index: number, amount: string) => void;
}

function WishlistPanel({ items, loading, onClose, onDelete, onSetAlert }: Props) {
    const [alertValues, setAlertValues] = useState<Record<number, string>>({});
    const [alertStatus, setAlertStatus] = useState<Record<number, 'idle' | 'saving' | 'saved' | 'error'>>({});
    const [deleteStatus, setDeleteStatus] = useState<Record<number, 'idle' | 'deleting'>>({});

    async function handleDelete(item: WishlistItem, index: number) {
        setDeleteStatus(s => ({ ...s, [index]: 'deleting' }));
        try {
            await onDelete?.(item, index);
        } finally {
            setDeleteStatus(s => ({ ...s, [index]: 'idle' }));
        }
    }

    async function handleSetAlert(item: WishlistItem, index: number) {
        const amount = alertValues[index]?.trim();
        if (!amount || isNaN(Number(amount)) || Number(amount) < 0) return;

        setAlertStatus(s => ({ ...s, [index]: 'saving' }));
        try {
            await onSetAlert?.(item, index, amount);
            setAlertStatus(s => ({ ...s, [index]: 'saved' }));
            setTimeout(() => setAlertStatus(s => ({ ...s, [index]: 'idle' })), 2000);
        } catch {
            setAlertStatus(s => ({ ...s, [index]: 'error' }));
            setTimeout(() => setAlertStatus(s => ({ ...s, [index]: 'idle' })), 2000);
        }
    }

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

                                <div className="wishlist-item-info">
                                    <div className="wishlist-item-title">
                                        {item.external ?? item.title ?? 'Game'}
                                    </div>
                                    {item.cheapest && (
                                        <div className="wishlist-item-price">Best: ${item.cheapest}</div>
                                    )}

                                    <div className="wishlist-item-alert-row">
                                        <span className="wishlist-alert-label">Email alert me at $</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="wishlist-alert-input"
                                            value={alertValues[i] ?? ''}
                                            onChange={e => setAlertValues(v => ({ ...v, [i]: e.target.value }))}
                                            onKeyDown={e => e.key === 'Enter' && handleSetAlert(item, i)}
                                            aria-label={`Set price alert for ${item.external ?? item.title}`}
                                        />
                                        <button
                                            className={[
                                                'wishlist-alert-btn',
                                                alertStatus[i] === 'saved' ? 'saved' : '',
                                                alertStatus[i] === 'error' ? 'error' : '',
                                            ].join(' ').trim()}
                                            onClick={() => handleSetAlert(item, i)}
                                            disabled={alertStatus[i] === 'saving'}
                                            aria-label="Set price alert"
                                        >
                                            {alertStatus[i] === 'saving' ? '…'
                                                : alertStatus[i] === 'saved' ? '✓'
                                                    : alertStatus[i] === 'error' ? '!'
                                                        : 'Set'}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="wishlist-delete-btn"
                                    onClick={() => handleDelete(item, i)}
                                    disabled={deleteStatus[i] === 'deleting'}
                                    aria-label={`Remove ${item.external ?? item.title} from wishlist`}
                                >
                                    {deleteStatus[i] === 'deleting' ? '…' : '🗑'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default WishlistPanel;