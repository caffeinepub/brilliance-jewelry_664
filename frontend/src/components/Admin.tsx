import React, { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCategories,
  useProducts,
  useAddCategory,
  useDeleteCategory,
  useAddProduct,
  useEditProduct,
  useDeleteProduct,
  useGetIsAdmin,
  useTransactions,
  useSetStripeApiKey,
  useAllCategories,
  useAddAdmin,
  useRemoveAdmin,
  useAdmins,
  useClearAllProducts,
  useClearAllCategories,
  useDeleteTransaction,
  useClearAllTransactions,
  useRemoveAllowedOrigin,
  useAddAllowedOrigin,
  useAllowedOrigins,
} from "../hooks/useQueries";
import type { Product } from "@/backend";
import {
  Package,
  Folder,
  Plus,
  Trash2,
  LogOut,
  X,
  Upload,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  Lock,
  Settings,
  Globe,
  UserPlus,
  UserMinus,
  Users,
  Pencil,
} from "lucide-react";
import TransactionDetailsModal from "./TransactionDetailsModal";
import Pagination from "./Pagination";

function shortenMiddle(str: string, visible = 8) {
  if (str.length <= visible * 2) return str;
  const start = str.slice(0, visible);
  const end = str.slice(-visible);
  return `${start}...${end}`;
}

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.port
      ? `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}`
      : `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    return url;
  }
}

function Admin() {
  const { login, clear, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");

  const [selectedProducts, setSelectedProducts] = useState<Set<bigint>>(new Set());
  const [editingCells, setEditingCells] = useState<{ [key: string]: any }>({});
  const [bulkEditedProducts, setBulkEditedProducts] = useState<{ [key: string]: Product }>({});
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  const [productsPage, setProductsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  const { data: categories } = useCategories({ page: categoriesPage, limit: 5 });
  const { data: products } = useProducts({ page: productsPage, limit: 5 });
  const { data: transactions } = useTransactions();
  const { data: allCategories } = useAllCategories();
  const { data: admins } = useAdmins();
  const { data: allowedOrigins } = useAllowedOrigins();

  const { mutate: addCategory } = useAddCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const { mutateAsync: addProduct, isPending: isAddingProduct } = useAddProduct();
  const { mutateAsync: editProduct, isPending: isEditingProduct } = useEditProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const { mutate: clearAllProducts, isPending: isClearingProducts } = useClearAllProducts();
  const { mutate: clearAllCategories, isPending: isClearingCategories } = useClearAllCategories();

  const { mutate: deleteTransaction, isPending: isDeletingTransaction } = useDeleteTransaction();
  const { mutate: clearAllTransactions, isPending: isClearingTransactions } = useClearAllTransactions();

  const { mutate: setStripeApiKey, isPending: isSettingApiKey } = useSetStripeApiKey();
  const { mutate: addAdmin, isPending: isAddingAdmin } = useAddAdmin();
  const { mutate: removeAdmin, isPending: isRemovingAdmin } = useRemoveAdmin();

  const { mutate: addAllowedOrigin, isPending: isAddingOrigin } = useAddAllowedOrigin();
  const { mutate: removeAllowedOrigin, isPending: isRemovingOrigin } = useRemoveAllowedOrigin();

  const [apiKeySuccess, setApiKeySuccess] = useState(false);
  const [originSuccess, setOriginSuccess] = useState(false);

  const computeMetrics = () => {
    if (!transactions) return { totalRevenue: 0, totalOrders: 0, completedOrders: 0 };
    let totalRevenue = 0;
    let completedOrders = 0;
    transactions.forEach(([_sessionId, status]) => {
      if ("completed" in status) {
        completedOrders++;
        try {
          const responseData = JSON.parse(status.completed.response);
          if (responseData.amount_total != null) {
            totalRevenue += responseData.amount_total / 100;
          }
        } catch {}
      }
    });
    return { totalRevenue, totalOrders: transactions.length, completedOrders };
  };

  const { totalRevenue, completedOrders } = computeMetrics();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = !!identity;
  const { data: isAdminData, isFetching } = useGetIsAdmin();
  const [isLoading, setIsLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", category: "", image: "" });
  const [editProductForm, setEditProductForm] = useState({ id: BigInt(0), name: "", description: "", price: "", category: "", image: "" });
  const [newCategory, setNewCategory] = useState({ name: "", description: "", image: "" });
  const [newOrigin, setNewOrigin] = useState("");
  const [settings, setSettings] = useState({ stripeApiKey: "" });
  const [isDragOver, setIsDragOver] = useState(false);

  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState(false);
  const [editProductError, setEditProductError] = useState<string | null>(null);
  const [editProductSuccess, setEditProductSuccess] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [originError, setOriginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        console.error("Login error:", error);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
  };

  const handleDeleteTransaction = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(sessionId);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);
    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: BigInt(Math.round(parseFloat(newProduct.price) * 100)),
        category: newProduct.category,
        image: newProduct.image || null,
      };
      addProduct(productData, {
        onSuccess: () => {
          setProductSuccess(true);
          setNewProduct({ name: "", description: "", price: "", category: "", image: "" });
          setTimeout(() => { setShowProductModal(false); setProductSuccess(false); }, 1500);
        },
        onError: (error: any) => {
          setProductError(error?.message ?? "Failed to add product");
        },
      });
    } catch {
      setProductError("An unexpected error occurred");
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProductError(null);
    try {
      const productData = {
        id: editProductForm.id,
        name: editProductForm.name,
        description: editProductForm.description,
        price: BigInt(Math.round(parseFloat(editProductForm.price) * 100)),
        category: editProductForm.category,
        image: editProductForm.image || null,
      };
      editProduct(productData, {
        onSuccess: () => {
          setEditProductSuccess(true);
          setTimeout(() => { setShowEditProductModal(false); setEditProductSuccess(false); setEditingProduct(null); }, 1500);
        },
        onError: (error: any) => {
          setEditProductError(error?.message ?? "Failed to edit product");
        },
      });
    } catch {
      setEditProductError("An unexpected error occurred");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addCategory({ name: newCategory.name, description: newCategory.description, image: newCategory.image || null });
      setNewCategory({ name: "", description: "", image: "" });
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!newAdminName.trim()) { setAdminError("Admin principal is required"); return; }
    try {
      addAdmin(newAdminName.trim(), {
        onSuccess: () => {
          setAdminSuccess(true);
          setNewAdminName("");
          setTimeout(() => { setShowAddAdminModal(false); setAdminSuccess(false); }, 1500);
        },
        onError: (error: any) => {
          setAdminError(error?.message ?? "Failed to add admin");
        },
      });
    } catch {
      setAdminError("An unexpected error occurred");
    }
  };

  const handleRemoveAdmin = (adminName: string) => {
    if (window.confirm(`Are you sure you want to remove admin: ${adminName}?`)) {
      removeAdmin(adminName, {
        onError: (error: any) => {
          console.error("Error removing admin:", error);
          alert("Failed to remove admin");
        },
      });
    }
  };

  const handleSelectProduct = (productId: bigint) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) { newSelected.delete(productId); } else { newSelected.add(productId); }
    setSelectedProducts(newSelected);
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked && products?.items) {
      setSelectedProducts(new Set(products.items.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.size} selected products?`)) {
      const deletePromises = Array.from(selectedProducts).map(
        (productId) => new Promise((resolve) => { deleteProduct(productId, { onSettled: () => resolve(null) }); }),
      );
      await Promise.all(deletePromises);
      setSelectedProducts(new Set());
      setIsBulkEditMode(false);
      setBulkEditedProducts({});
      setEditingCells({});
    }
  };

  const handleCellEdit = (productId: bigint, field: string, value: any) => {
    const key = `${productId.toString()}-${field}`;
    setEditingCells((prev) => ({ ...prev, [key]: value }));
    const product = products?.items?.find((p) => p.id === productId);
    if (product != null) {
      setBulkEditedProducts((prev) => ({
        ...prev,
        [productId.toString()]: {
          ...(prev[productId.toString()] ?? product),
          [field]: field === "price" ? BigInt(Math.round(parseFloat(value) * 100)) : value,
        },
      }));
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const productsToUpdate = Object.entries(bulkEditedProducts);
      if (productsToUpdate.length === 0) return;
      if (window.confirm(`Are you sure you want to update ${productsToUpdate.length} products?`)) {
        for (const [_, product] of productsToUpdate) {
          editProduct({ ...product, image: product.image ?? null });
        }
        setSelectedProducts(new Set());
        setIsBulkEditMode(false);
        setBulkEditedProducts({});
        setEditingCells({});
      }
    } catch (error) {
      console.error("Error in handleBulkUpdate:", error);
    }
  };

  const getCellValue = (product: Product, field: string) => {
    const key = `${product.id.toString()}-${field}`;
    if (key in editingCells) return editingCells[key];
    if (field === "price") return (Number(product.price) / 100).toFixed(2);
    return product[field as keyof Product];
  };

  const isProductEditable = (productId: bigint) => isBulkEditMode && selectedProducts.has(productId);
  const isProductEdited = (productId: bigint) => productId.toString() in bulkEditedProducts;

  const handleFileUpload = (file: File, isEdit = false) => {
    if (file != null) {
      if (file.size > 500 * 1024) { alert("File size must be less than 0.5MB"); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (isEdit) { setEditProductForm({ ...editProductForm, image: base64String }); }
        else { setNewProduct({ ...newProduct, image: base64String }); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadCategory = (file: File) => {
    if (file != null) {
      if (file.size > 500 * 1024) { alert("File size must be less than 0.5MB"); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setNewCategory({ ...newCategory, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent, isEdit = false) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 1024 * 1024) { alert("File size must be less than 1MB"); return; }
        handleFileUpload(file, isEdit);
      }
    }
  };

  const getTransactionStatusIcon = (status: any) => {
    if ("completed" in status) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if ("failed" in status) return <XCircle className="w-5 h-5 text-red-500" />;
    if ("checking" in status) return <Clock className="w-5 h-5 text-yellow-500" />;
    return null;
  };

  const getTransactionStatusText = (status: any) => {
    if ("completed" in status) return "Completed";
    if ("failed" in status) return "Failed";
    if ("checking" in status) return "Processing";
    return "Unknown";
  };

  const getTransactionStatusColor = (status: any) => {
    if ("completed" in status) return "text-green-600 bg-green-50";
    if ("failed" in status) return "text-red-600 bg-red-50";
    if ("checking" in status) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setEditProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      category: product.category,
      image: product.image || "",
    });
    setShowEditProductModal(true);
    setEditProductError(null);
    setEditProductSuccess(false);
  };

  useEffect(() => {
    if (activeTab === "products") setProductsPage(1);
    else if (activeTab === "categories") setCategoriesPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated || (isAuthenticated && isAdminData != null)) {
      setIsLoading(false);
      return;
    }
    if (isFetching) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsLoading(false), 5000);
    } else {
      setIsLoading(false);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isAuthenticated, isAdminData, isFetching]);

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <Shield size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-charcoal mb-3">Admin Access</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <button
            onClick={handleLogin}
            className="bg-gold text-charcoal px-8 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminData) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <Lock size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-charcoal mb-3">Not Authorized</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            You don't have admin access. If you're the first user, initialize admin below.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
                try {
                  const { actor: a } = { actor: null as any };
                  if (a) await a.initializeAuth();
                } catch {}
              }}
              className="bg-gold text-charcoal px-6 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors"
            >
              Initialize Admin
            </button>
            <button
              onClick={handleLogout}
              className="border border-border px-6 py-3 text-xs font-sans tracking-widest uppercase hover:bg-ivory-dark transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Admin UI ──────────────────────────────────────────────────────────
  const productItemCount = products?.items?.length ?? 0;

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-charcoal py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-1">Dashboard</p>
            <h1 className="font-serif text-4xl text-ivory">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-ivory/60 hover:text-gold transition-colors text-sm font-sans"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-ivory-dark sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: "products", label: "Products", icon: Package },
              { id: "categories", label: "Categories", icon: Folder },
              { id: "transactions", label: "Transactions", icon: Receipt },
              { id: "admins", label: "Admins", icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-sans font-medium tracking-wider uppercase border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-charcoal"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Products Tab ── */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">
                Products ({products?.total_items?.toString() ?? 0})
              </h2>
              <div className="flex gap-3">
                {isBulkEditMode && selectedProducts.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkUpdate}
                      disabled={isEditingProduct}
                      className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
                    >
                      Save Changes ({Object.keys(bulkEditedProducts).length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 text-white px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-red-700 transition-colors"
                    >
                      Delete ({selectedProducts.size})
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                  className="border border-border px-4 py-2 text-xs font-sans tracking-wider uppercase hover:bg-ivory-dark transition-colors"
                >
                  {isBulkEditMode ? "Exit Bulk Edit" : "Bulk Edit"}
                </button>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-ivory-dark overflow-hidden">
              <table className="w-full">
                <thead className="bg-ivory border-b border-ivory-dark">
                  <tr>
                    {isBulkEditMode && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => handleSelectAllProducts(e.target.checked)}
                          checked={productItemCount > 0 && selectedProducts.size === productItemCount}
                          className="accent-gold"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-sans text-xs tracking-wider uppercase text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-sans text-xs tracking-wider uppercase text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-sans text-xs tracking-wider uppercase text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right font-sans text-xs tracking-wider uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productItemCount === 0 ? (
                    <tr>
                      <td colSpan={isBulkEditMode ? 5 : 4} className="px-4 py-12 text-center">
                        <Package size={32} className="text-gold/30 mx-auto mb-3" />
                        <p className="font-serif text-lg text-charcoal">No products yet</p>
                        <p className="font-sans text-sm text-muted-foreground">Add your first product to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    products?.items?.map((product) => (
                      <tr key={product.id.toString()} className={`border-b border-ivory-dark last:border-0 ${isProductEdited(product.id) ? "bg-gold/5" : ""}`}>
                        {isBulkEditMode && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="accent-gold"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          {isProductEditable(product.id) ? (
                            <input
                              type="text"
                              value={getCellValue(product, "name") as string}
                              onChange={(e) => handleCellEdit(product.id, "name", e.target.value)}
                              className="w-full border border-border px-2 py-1 text-sm font-sans focus:outline-none focus:border-gold"
                            />
                          ) : (
                            <span className="font-sans text-sm text-charcoal">{product.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isProductEditable(product.id) ? (
                            <select
                              value={getCellValue(product, "category") as string}
                              onChange={(e) => handleCellEdit(product.id, "category", e.target.value)}
                              className="border border-border px-2 py-1 text-sm font-sans focus:outline-none focus:border-gold bg-white"
                            >
                              {allCategories?.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : (
                            <span className="font-sans text-sm text-muted-foreground">{product.category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isProductEditable(product.id) ? (
                            <input
                              type="number"
                              step="0.01"
                              value={getCellValue(product, "price") as string}
                              onChange={(e) => handleCellEdit(product.id, "price", e.target.value)}
                              className="w-24 border border-border px-2 py-1 text-sm font-sans focus:outline-none focus:border-gold"
                            />
                          ) : (
                            <span className="font-serif text-sm text-charcoal">${(Number(product.price) / 100).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditProductModal(product)}
                              className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => { if (window.confirm("Delete this product?")) deleteProduct(product.id); }}
                              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {products && Number(products.total_pages) > 1 && (
              <Pagination
                currentPage={productsPage}
                totalPages={Number(products.total_pages)}
                onPageChange={setProductsPage}
                totalItems={Number(products.total_items)}
                itemsPerPage={5}
              />
            )}
          </div>
        )}

        {/* ── Categories Tab ── */}
        {activeTab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">
                Categories ({categories?.total_items?.toString() ?? 0})
              </h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.items?.map((cat) => (
                <div key={cat.name} className="bg-white border border-ivory-dark p-5 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-charcoal mb-1">{cat.name}</h3>
                    <p className="font-sans text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  </div>
                  <button
                    onClick={() => { if (window.confirm(`Delete category "${cat.name}"?`)) deleteCategory(cat.name); }}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {categories && Number(categories.total_pages) > 1 && (
              <Pagination
                currentPage={categoriesPage}
                totalPages={Number(categories.total_pages)}
                onPageChange={setCategoriesPage}
                totalItems={Number(categories.total_items)}
                itemsPerPage={5}
              />
            )}
          </div>
        )}

        {/* ── Transactions Tab ── */}
        {activeTab === "transactions" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">Transactions</h2>
              <div className="flex gap-3">
                <div className="bg-white border border-ivory-dark px-4 py-2 text-sm font-sans">
                  Revenue: <span className="font-serif text-gold">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="bg-white border border-ivory-dark px-4 py-2 text-sm font-sans">
                  Completed: <span className="font-serif text-gold">{completedOrders}</span>
                </div>
              </div>
            </div>
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-16 bg-white border border-ivory-dark">
                <Receipt size={36} className="text-gold/30 mx-auto mb-3" />
                <p className="font-serif text-xl text-charcoal mb-1">No Transactions</p>
                <p className="font-sans text-sm text-muted-foreground">Transactions will appear here once the store opens.</p>
              </div>
            ) : (
              <div className="bg-white border border-ivory-dark overflow-hidden">
                <table className="w-full">
                  <thead className="bg-ivory border-b border-ivory-dark">
                    <tr>
                      <th className="px-4 py-3 text-left font-sans text-xs tracking-wider uppercase text-muted-foreground">Session ID</th>
                      <th className="px-4 py-3 text-left font-sans text-xs tracking-wider uppercase text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right font-sans text-xs tracking-wider uppercase text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(([sessionId, status]) => (
                      <tr key={sessionId} className="border-b border-ivory-dark last:border-0">
                        <td className="px-4 py-3 font-sans text-sm text-charcoal">{shortenMiddle(sessionId)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-sans rounded ${getTransactionStatusColor(status)}`}>
                            {getTransactionStatusIcon(status)}
                            {getTransactionStatusText(status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTransaction(sessionId)}
                              className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(sessionId)}
                              disabled={isDeletingTransaction}
                              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Admins Tab ── */}
        {activeTab === "admins" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">Admins</h2>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors flex items-center gap-2"
              >
                <UserPlus size={14} /> Add Admin
              </button>
            </div>
            <div className="space-y-3">
              {admins?.map((admin) => (
                <div key={admin} className="bg-white border border-ivory-dark p-4 flex items-center justify-between">
                  <span className="font-sans text-sm text-charcoal break-all">{admin}</span>
                  <button
                    onClick={() => handleRemoveAdmin(admin)}
                    disabled={isRemovingAdmin}
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Settings</h2>
            </div>

            {/* Stripe API Key */}
            <div className="bg-white border border-ivory-dark p-6">
              <h3 className="font-serif text-xl text-charcoal mb-2">Stripe API Key</h3>
              <p className="font-sans text-sm text-muted-foreground mb-4">
                Configure your Stripe secret key to enable checkout. (Not supported in current backend version.)
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={settings.stripeApiKey}
                  onChange={(e) => setSettings({ ...settings, stripeApiKey: e.target.value })}
                  placeholder="sk_live_..."
                  className="flex-1 border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory"
                />
                <button
                  onClick={() => setStripeApiKey(settings.stripeApiKey)}
                  disabled={isSettingApiKey || !settings.stripeApiKey}
                  className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Allowed Origins */}
            <div className="bg-white border border-ivory-dark p-6">
              <h3 className="font-serif text-xl text-charcoal mb-2">Allowed Origins</h3>
              <p className="font-sans text-sm text-muted-foreground mb-4">
                Manage CORS allowed origins. (Not supported in current backend version.)
              </p>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory"
                />
                <button
                  onClick={() => { addAllowedOrigin(newOrigin); setNewOrigin(""); }}
                  disabled={isAddingOrigin || !newOrigin}
                  className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Globe size={14} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {allowedOrigins?.map((origin) => (
                  <div key={origin} className="flex items-center justify-between p-3 bg-ivory border border-ivory-dark">
                    <span className="font-sans text-sm text-charcoal">{extractDomain(origin) ?? origin}</span>
                    <button
                      onClick={() => removeAllowedOrigin(origin)}
                      disabled={isRemovingOrigin}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ── */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white w-full max-w-lg p-6 shadow-luxury-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl text-charcoal">Add Product</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 text-muted-foreground hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Name *</label>
                <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Description *</label>
                <textarea required rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Price ($) *</label>
                  <input type="number" step="0.01" min="0.01" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Category *</label>
                  <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                    <option value="">Select...</option>
                    {allCategories?.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Image</label>
                <div
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, false)}
                  className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${isDragOver ? "border-gold bg-gold/5" : "border-border"}`}
                  onClick={() => document.getElementById("product-image-upload")?.click()}
                >
                  {newProduct.image ? (
                    <img src={newProduct.image} alt="Preview" className="h-24 mx-auto object-contain" />
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="font-sans text-xs">Drop image or click to upload (max 0.5MB)</p>
                    </div>
                  )}
                  <input id="product-image-upload" type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                </div>
              </div>
              {productError && <p className="text-xs text-red-600 font-sans">{productError}</p>}
              {productSuccess && <p className="text-xs text-green-600 font-sans">Product added successfully!</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)}
                  className="flex-1 border border-border py-2 text-xs font-sans tracking-wider uppercase hover:bg-ivory-dark transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isAddingProduct}
                  className="flex-1 bg-gold text-charcoal py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isAddingProduct && <div className="w-3 h-3 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />}
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ── */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditProductModal(false)} />
          <div className="relative bg-white w-full max-w-lg p-6 shadow-luxury-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl text-charcoal">Edit Product</h3>
              <button onClick={() => setShowEditProductModal(false)} className="p-1 text-muted-foreground hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Name *</label>
                <input type="text" required value={editProductForm.name} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Description *</label>
                <textarea required rows={3} value={editProductForm.description} onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Price ($) *</label>
                  <input type="number" step="0.01" min="0.01" required value={editProductForm.price} onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Category *</label>
                  <select required value={editProductForm.category} onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-white">
                    {allCategories?.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Image</label>
                <div
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, true)}
                  className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${isDragOver ? "border-gold bg-gold/5" : "border-border"}`}
                  onClick={() => document.getElementById("edit-product-image-upload")?.click()}
                >
                  {editProductForm.image ? (
                    <img src={editProductForm.image} alt="Preview" className="h-24 mx-auto object-contain" />
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="font-sans text-xs">Drop image or click to upload (max 0.5MB)</p>
                    </div>
                  )}
                  <input id="edit-product-image-upload" type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], true); }} />
                </div>
              </div>
              {editProductError && <p className="text-xs text-red-600 font-sans">{editProductError}</p>}
              {editProductSuccess && <p className="text-xs text-green-600 font-sans">Product updated successfully!</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditProductModal(false)}
                  className="flex-1 border border-border py-2 text-xs font-sans tracking-wider uppercase hover:bg-ivory-dark transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isEditingProduct}
                  className="flex-1 bg-gold text-charcoal py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isEditingProduct && <div className="w-3 h-3 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCategoryModal(false)} />
          <div className="relative bg-white w-full max-w-md p-6 shadow-luxury-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl text-charcoal">Add Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 text-muted-foreground hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Name *</label>
                <input type="text" required value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Description *</label>
                <textarea required rows={3} value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory resize-none" />
              </div>
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Image</label>
                <div
                  className="border-2 border-dashed border-border p-4 text-center cursor-pointer hover:border-gold transition-colors"
                  onClick={() => document.getElementById("category-image-upload")?.click()}
                >
                  {newCategory.image ? (
                    <img src={newCategory.image} alt="Preview" className="h-20 mx-auto object-contain" />
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload size={20} className="mx-auto mb-1" />
                      <p className="font-sans text-xs">Click to upload (max 0.5MB)</p>
                    </div>
                  )}
                  <input id="category-image-upload" type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUploadCategory(e.target.files[0]); }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)}
                  className="flex-1 border border-border py-2 text-xs font-sans tracking-wider uppercase hover:bg-ivory-dark transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-gold text-charcoal py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Admin Modal ── */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddAdminModal(false)} />
          <div className="relative bg-white w-full max-w-md p-6 shadow-luxury-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl text-charcoal">Add Admin</h3>
              <button onClick={() => setShowAddAdminModal(false)} className="p-1 text-muted-foreground hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">Principal ID *</label>
                <input type="text" required value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="aaaaa-bbbbb-ccccc-..."
                  className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold bg-ivory" />
              </div>
              {adminError && <p className="text-xs text-red-600 font-sans">{adminError}</p>}
              {adminSuccess && <p className="text-xs text-green-600 font-sans">Admin added successfully!</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 border border-border py-2 text-xs font-sans tracking-wider uppercase hover:bg-ivory-dark transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isAddingAdmin}
                  className="flex-1 bg-gold text-charcoal py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isAddingAdmin && <div className="w-3 h-3 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />}
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          sessionId={selectedTransaction}
        />
      )}
    </div>
  );
}

export default Admin;
