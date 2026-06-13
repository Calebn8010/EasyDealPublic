import { useState, useEffect } from 'react';

export interface WishlistItem {
    gameID?: string;
    thumb?: string;
    external?: string;
    title?: string;
    cheapest?: string;
    targetPrice?: string;
}

interface Props {
    items: WishlistItem[];
    loading: boolean;
    onClose: () => void;
    onDelete?: (item: WishlistItem, index: number) => void;
    onSetAlert?: (item: WishlistItem, index: number, amount: string) => void;
}

function WishlistPanel({ items, loading, onClose, onDelete, onSetAlert }: Props) {
    const [alertValues, setAlertValues] = useState<Record<string, string>>(() =>
        items.reduce((acc, item) => {
            if (item.targetPrice && item.gameID) acc[item.gameID] = parseFloat(item.targetPrice).toFixed(2);
            return acc;
        }, {} as Record<string, string>)
    );
    const [alertStatus, setAlertStatus] = useState<Record<number, 'idle' | 'saving' | 'saved' | 'error'>>({});
    const [deleteStatus, setDeleteStatus] = useState<Record<number, 'idle' | 'deleting'>>({});
    const [confirmedAlerts, setConfirmedAlerts] = useState<Record<string, string>>(() =>
        items.reduce((acc, item) => {
            if (item.targetPrice && item.gameID) acc[item.gameID] = parseFloat(item.targetPrice).toFixed(2);
            return acc;
        }, {} as Record<string, string>)
    );

    useEffect(() => {
        setAlertValues(
            items.reduce((acc, item) => {
                if (item.gameID) acc[item.gameID] = item.targetPrice ?? '';
                return acc;
            }, {} as Record<string, string>)
        );
        setConfirmedAlerts(prev => {
            const fromProps = items.reduce((acc, item) => {
                if (item.targetPrice && item.gameID) acc[item.gameID] = parseFloat(item.targetPrice).toFixed(2);
                return acc;
            }, {} as Record<string, string>);
            return { ...prev, ...fromProps };
        });
    }, [items]);

    async function handleDelete(item: WishlistItem, index: number) {
        setDeleteStatus(s => ({ ...s, [index]: 'deleting' }));
        try {
            await onDelete?.(item, index);
        } finally {
            setDeleteStatus(s => ({ ...s, [index]: 'idle' }));
        }
    }

    async function handleSetAlert(item: WishlistItem, index: number) {
        const key = item.gameID ?? index;
        const amount = alertValues[key]?.trim();
        if (!amount || isNaN(Number(amount)) || Number(amount) < 0) return;

        setAlertStatus(s => ({ ...s, [index]: 'saving' }));
        try {
            await onSetAlert?.(item, index, amount);
            if (item.gameID) {
                setConfirmedAlerts(prev => ({ ...prev, [item.gameID!]: parseFloat(amount).toFixed(2) }));
                setAlertValues(v => ({ ...v, [item.gameID!]: '' }));
            }
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
                    <div className="wishlist-title-group">
                        <h2 className="wishlist-title">❤️ My Wishlist</h2>
                        <div className="wishlist-info-tooltip">
                            <span className="wishlist-info-icon" aria-label="Wishlist info">ℹ</span>
                            <div className="wishlist-info-popup" role="tooltip">
                                <p>Once an alert price is set. Whenever a new Steam game deal is available below your set alert price, you'll receive an email with a link to the game deal</p>

                                <p>Price alerts will be sent to your EasyDeal registered email. For gmail accounts you might need to add a filter for any emails from "no-reply@cheapshark.com" as your price alert emails may end up outsite of the default main inbox.</p>
                            </div>
                        </div>
                    </div>
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
                        {items.map((item, i) => {
                            const hasAlert = !!(item.gameID && confirmedAlerts[item.gameID]);

                            return (
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
                                            <span className="wishlist-alert-label">
                                                {hasAlert ? (
                                                    <>
                                                        Email alert will send at <span className="wishlist-alert-price">${confirmedAlerts[item.gameID!]}</span>
                                                    </>
                                                ) : 'Email alert me at $'}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="wishlist-alert-input"
                                                value={alertValues[item.gameID ?? i] ?? ''}
                                                onChange={e => setAlertValues(v => ({ ...v, [item.gameID ?? i]: e.target.value }))}
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
                                                            : hasAlert ? 'Set New Price' : 'Set'}
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
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default WishlistPanel;