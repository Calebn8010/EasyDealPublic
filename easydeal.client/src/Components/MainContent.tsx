import SearchForm from "./DealSearch.tsx";
import DealList from "./DealList.tsx";

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
    onSearch: (query: string) => void;
    onAdd: (deal: Deal) => void;
    onToggleExpand: (idx: number, gameID: string) => void;
}

function MainContent({ deals, expandedIdx, dealInfo, onSearch, onAdd, onToggleExpand }: Props) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 main-content">
            <h4>Search for Steam games to add into your EasyDeal Wishlist</h4>
            <SearchForm onSearch={onSearch} />
            <DealList
                deals={deals}
                expandedIdx={expandedIdx}
                dealInfo={dealInfo}
                onAdd={onAdd}
                onToggleExpand={onToggleExpand}
            />
        </div>
    );
}

export default MainContent;