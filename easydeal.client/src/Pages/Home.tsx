import { useState } from 'react';
import LogoutLink from "../Components/LogoutLink.tsx";
import AuthorizeView, { AuthorizedUser } from "../Components/AuthorizeView.tsx";
import SearchForm from "../Components/DealSearch.tsx";

function Home() {
    const [deals, setDeals] = useState<any[]>([]);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [dealInfo, setInfo] = useState<any | null>(null);

    async function handleSearch(query: string) {
        setExpandedIdx(null); //clear best deal if search /toggle has already been used
        console.log({ query })
        const response = await fetch('dealsearch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        setDeals(Array.isArray(data) ? data : []);
        //console.log(data);
        //console.log(typeof data);
        //const arrayData = Array.isArray(data) ? data : Object.values(data);
        //setDeals(arrayData);
        //console.log(arrayData);
        //console.log(typeof arrayData);
    }

    async function handleAdd(deal: object) { //instead of object - add interface in future
        console.log("Add clicked for:", deal);
        console.log(JSON.stringify(deal));
        console.log(JSON.stringify({ deal }));
        const response = await fetch('wishlistupdates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deal)
        });

        // Show a green success notification
        const notification = document.createElement('div');
        notification.textContent = 'Added! Stay tuned for new Wishlist features page';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#22c55e';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3500);

        if (response.status == 409) {
            // Show a green success notification
            const notification = document.createElement('div');
            notification.textContent = 'Game is already added for your user account. Stay tuned for new Wishlist features page!';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#facc15';
            notification.style.color = 'white';
            notification.style.padding = '12px 24px';
            notification.style.borderRadius = '8px';
            notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            notification.style.zIndex = '9999';
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 6000);
        }

        console.log(response);
        
    }

    async function toggleExpand(idx: number, gameID: string) {
        setExpandedIdx(expandedIdx === idx ? null : idx);
        setInfo(null); //clear previous info to trigger "Loading..."

        const response = await fetch('bestdealinfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameID })
        });
        const data = await response.json();
        setInfo(data);
    }

    return (
        <AuthorizeView>
            <span><LogoutLink>Logout <AuthorizedUser value="email" /></LogoutLink></span>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h4>Search for PC games to add into your EasyDeal list</h4>
                <SearchForm onSearch={handleSearch}/>
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
                                    {/* Use dealInfo[deal.gameID] if available, else fallback */}
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