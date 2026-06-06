export interface Deal {
    thumb: string;
    external?: string;
    cheapest?: string;
    cheapestDealID: string;
    gameID: string;
}

export interface DealInfo {
    cheapestPriceEver: string;
    date: string;
}