export interface Retailer {
    id?: number;      // Supabase-generated ID
    name: string;     // Retailer name (unique)
}

export interface Product {
    id?: number;
    name: string;     // Product name
    size: string;     // e.g., "12oz", "1L"
    category: string; // e.g., "beverage", "snack"
}

export interface Deal {
    id?: number;
    retailer_id: number; // FK → retailers.id
    product_id: number;  // FK → products.id
    price: number;
    start_date: string;
    end_date: string;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    preferred_retailers: string[]; // List of retailer names
}

export interface DealJSON {
    retailer: string;
    product: string;
    size: string;
    price: number;
    start: string;
    end: string;
    category: string;
}