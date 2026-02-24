import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { Principal } from "@dfinity/principal";
import type { Product, Category, PaginationResult, PaginationResult_1 } from "@/backend";

// ─── Products ────────────────────────────────────────────────────────────────

export function useGetProducts(page = 1, limit = 12) {
  const { actor, isFetching } = useActor();
  return useQuery<PaginationResult>({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      if (!actor) return { items: [], total_items: 0n, total_pages: 0n, current_page: 1n, has_next_page: false, has_prev_page: false };
      return actor.getProducts(BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by old Admin.tsx
export function useProducts({ page = 1, limit = 10, category }: { page?: number; limit?: number; category?: string } = {}) {
  const { actor, isFetching } = useActor();
  return useQuery<PaginationResult>({
    queryKey: ["products", category, page, limit],
    queryFn: async () => {
      if (!actor) return { items: [], total_items: 0n, total_pages: 0n, current_page: 1n, has_next_page: false, has_prev_page: false };
      if (category && category !== "") {
        return actor.getProductsByCategory(category, BigInt(page), BigInt(limit));
      }
      return actor.getProducts(BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByCategory(category: string, page = 1, limit = 12) {
  const { actor, isFetching } = useActor();
  return useQuery<PaginationResult>({
    queryKey: ["products", "category", category, page, limit],
    queryFn: async () => {
      if (!actor || !category) return { items: [], total_items: 0n, total_pages: 0n, current_page: 1n, has_next_page: false, has_prev_page: false };
      return actor.getProductsByCategory(category, BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id?: bigint; name: string; description: string; price: bigint; category: string; image?: string | null }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addProduct(data.name, data.description, data.price, data.category, data.image ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; description: string; price: bigint; category: string; image?: string | null }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.editProduct(data.id, data.name, data.description, data.price, data.category, data.image ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Stub – backend no longer has clearAllProducts
export function useClearAllProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      throw new Error("clearAllProducts is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useGetAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by old Admin.tsx
export const useAllCategories = useGetAllCategories;

export function useGetCategories(page = 1, limit = 20) {
  const { actor, isFetching } = useActor();
  return useQuery<PaginationResult_1>({
    queryKey: ["categories", page, limit],
    queryFn: async () => {
      if (!actor) return { items: [], total_items: 0n, total_pages: 0n, current_page: 1n, has_next_page: false, has_prev_page: false };
      return actor.getCategories(BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by old Admin.tsx
export function useCategories({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
  return useGetCategories(page, limit);
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string; image?: string | null }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addCategory(data.name, data.description, data.image ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Stub – backend no longer has deleteCategory
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_name: string) => {
      throw new Error("deleteCategory is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Stub – backend no longer has clearAllCategories
export function useClearAllCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      throw new Error("clearAllCategories is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by old Admin.tsx
export const useGetIsAdmin = useIsAdmin;

export function useInitializeAuth() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.initializeAuth();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useAdmins() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      if (!actor) return [];
      const admins = await actor.getAdmins();
      return admins.map((a: Principal) => a.toString());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addAdmin(Principal.fromText(principalText));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.removeAdmin(Principal.fromText(principalText));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function useGetUser() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["user"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUser();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by old UserAccount.tsx
export const useUser = useGetUser;

export function useSetUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.setUser(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

// ─── Stubs for removed Stripe / transaction features ─────────────────────────

export type Status =
  | { checking: { userPrincipal: string | null } }
  | { failed: { error: string; userPrincipal: string | null } }
  | { completed: { response: string; userPrincipal: string | null } };

export function useTransactions() {
  return useQuery<Array<[string, Status]>>({
    queryKey: ["transactions"],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useUserTransactions() {
  return useQuery<Array<[string, Status]>>({
    queryKey: ["userTransactions"],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useTransaction(_sessionId: string) {
  return useQuery<Status | null>({
    queryKey: ["transaction", _sessionId],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useAddTransaction() {
  return useMutation({
    mutationFn: async (_sessionId: string): Promise<Status> => {
      throw new Error("Stripe transactions are not supported in this version");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_sessionId: string) => {
      throw new Error("deleteTransaction is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useClearAllTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      throw new Error("clearAllTransactions is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useSetStripeApiKey() {
  return useMutation({
    mutationFn: async (_apiKey: string) => {
      throw new Error("Stripe API key is not supported in this version");
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (_params: {
      lineItems: Array<{ product_id: bigint; quantity: bigint }>;
      successUrl: string;
      cancelUrl: string;
    }): Promise<string> => {
      throw new Error("Checkout sessions are not supported in this version");
    },
  });
}

export function useTransactionLineItems() {
  return useMutation({
    mutationFn: async (_params: { sessionId: string; startingAfter: string | null }): Promise<string> => {
      throw new Error("Transaction line items are not supported in this version");
    },
  });
}

// ─── Stubs for removed allowed-origins feature ────────────────────────────────

export function useAllowedOrigins() {
  return useQuery<string[]>({
    queryKey: ["allowedOrigins"],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddAllowedOrigin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_origin: string) => {
      throw new Error("addAllowedOrigin is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

export function useRemoveAllowedOrigin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_origin: string) => {
      throw new Error("removeAllowedOrigin is not supported in this version");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { Product, Category, PaginationResult, PaginationResult_1 };
