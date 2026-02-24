import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaginationResult {
    total_pages: bigint;
    total_items: bigint;
    has_next_page: boolean;
    current_page: bigint;
    items: Array<Product>;
    has_prev_page: boolean;
}
export interface PaginationResult_1 {
    total_pages: bigint;
    total_items: bigint;
    has_next_page: boolean;
    current_page: bigint;
    items: Array<Category>;
    has_prev_page: boolean;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image?: string;
    price: bigint;
}
export interface Category {
    name: string;
    description: string;
    image?: string;
}
export interface backendInterface {
    addAdmin(newAdmin: Principal): Promise<void>;
    addCategory(name: string, description: string, image: string | null): Promise<void>;
    addProduct(name: string, description: string, price: bigint, category: string, image: string | null): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    editProduct(id: bigint, name: string, description: string, price: bigint, category: string, image: string | null): Promise<void>;
    getAdmins(): Promise<Array<Principal>>;
    getAllCategories(): Promise<Array<string>>;
    getCategories(page: bigint | null, limit: bigint | null): Promise<PaginationResult_1>;
    getProducts(page: bigint | null, limit: bigint | null): Promise<PaginationResult>;
    getProductsByCategory(category: string, page: bigint | null, limit: bigint | null): Promise<PaginationResult>;
    getUser(): Promise<string | null>;
    initializeAuth(): Promise<void>;
    isAdmin(): Promise<boolean>;
    removeAdmin(adminToRemove: Principal): Promise<void>;
    setUser(name: string): Promise<void>;
}
