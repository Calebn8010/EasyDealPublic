interface Deal {
    thumb: string;
    external?: string;
    cheapest?: string;
    cheapestDealID: string;
    gameID: string;
}

interface DealInfo {
    cheapestPriceEver: string;
    date: string;
}

interface Props {
    deals: Deal[];
    expandedIdx: number | null;
    dealInfo: DealInfo | null;
    onAdd: (deal: Deal) => void;
    onToggleExpand: (idx: number, gameID: string) => void;
}

function DealList({ deals, expandedIdx, dealInfo, onAdd, onToggleExpand }: Props) {
    return (
        <ul className="list">
            {deals.map((deal, idx) => (
                <li key={idx} className="list-item relative">
                    <img className="deal-img" src={deal.thumb} alt={deal.external} />
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
                            onClick={() => onAdd(deal)}
                        >
                            Add
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
            ))}
        </ul>
    );
}

export default DealList;