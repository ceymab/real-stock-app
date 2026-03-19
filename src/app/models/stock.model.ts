export interface Stock {

    symbol: string;
    name: string;
    price: number;
    high: number;
    low: number;
    week52High: number;
    week52Low: number;
    isActive: boolean;
    prevPrice?: number

}