import { useState } from 'react';
import type { Deal, DealInfo } from '../Utils/types.ts';


type AddStatus = 'idle' | 'loading' | 'added' | 'duplicate' | 'error';

interface Props {
    deals: Deal[];
    expandedIdx: number | null;
    dealInfo: DealInfo | null;
    onAdd: (deal: Deal) => Promise<'added' | 'duplicate' | 'error'>;
    onToggleExpand: (idx: number, gameID: string) => void;
}

function DealList({ deals, expandedIdx, dealInfo, onAdd, onToggleExpand }: Props) {
    const [addStatuses, setAddStatuses] = useState<Record<string, AddStatus>>({});

    async function handleAdd(deal: Deal) {
        const key = deal.gameID;
        if (addStatuses[key] === 'loading') return;

        setAddStatuses(s => ({ ...s, [key]: 'loading' }));
        const result = await onAdd(deal);
        setAddStatuses(s => ({ ...s, [key]: result }));

        // Reset back to idle after a moment (keep 'added' a bit longer)
        setTimeout(() => {
            setAddStatuses(s => ({ ...s, [key]: 'idle' }));
        }, result === 'added' ? 2500 : 1800);
    }

    function getButtonContent(status: AddStatus) {
        switch (status) {
            case 'loading':
                return (
                    <span className="add-spinner" aria-hidden="true" />
                );
            case 'added':
                return '✓';
            case 'duplicate':
                return 'Add';
            case 'error':
                return '✗ Failed';
            default:
                return 'Add';
        }
    }

    function getButtonClass(status: AddStatus) {
        const base = 'add ml-2 px-3 py-1 text-white rounded transition-all duration-300';
        switch (status) {
            case 'loading': return `${base} bg-green-600 opacity-80 cursor-not-allowed scale-95`;
            case 'added': return `${base} bg-green-500 scale-105`;
            case 'duplicate': return `${base} bg-yellow-500`;
            case 'error': return `${base} bg-red-500`;
            default: return `${base} bg-green-600 hover:bg-green-700 hover:scale-105`;
        }
    }

    return (
        <ul className="list">
            {deals.map((deal, idx) => {
                const status = addStatuses[deal.gameID] ?? 'idle';
                return (
                    <li key={idx} className="list-item relative">
                        <img className="deal-img" src={deal.thumb} alt={deal.external} />
                        <span className="list-item-values">{deal.external ?? 'Untitled Deal'}</span>
                        <div className="actions">
                            <span
                                className="list-item-deal"
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: '#2563eb' }}
                                onClick={() => window.open(`https://www.cheapshark.com/redirect?dealID=${deal.cheapestDealID}`, '_blank')}
                            >
                                Best deal today: ${deal.cheapest ?? 'No deal found'}
                            </span>
                            <button
                                className={getButtonClass(status)}
                                onClick={() => handleAdd(deal)}
                                disabled={status === 'loading'}
                                aria-label={`Add ${deal.external} to wishlist`}
                            >
                                {getButtonContent(status)}
                            </button>
                            <button
                                className="drop-down"
                                onClick={() => onToggleExpand(idx, deal.gameID)}
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
                );
            })}
        </ul>
    );
}

export default DealList;