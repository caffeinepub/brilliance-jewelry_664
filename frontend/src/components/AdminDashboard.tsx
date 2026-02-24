import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Loader2, ShieldAlert, Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useIsAdmin,
  useInitializeAuth,
  useGetProducts,
  useGetCategories,
  useAddProduct,
  useEditProduct,
  useDeleteProduct,
  useAddCategory,
} from "@/hooks/useQueries";
import type { Product, Category } from "@/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ProductForm({
  categories,
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  categories: string[];
  initial?: Product;
  onSubmit: (data: { name: string; description: string; price: bigint; category: string; image: string | null }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(Number(initial.price) / 100) : "");
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "");
  const [image, setImage] = useState(initial?.image ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    onSubmit({ name, description, price: BigInt(priceInCents), category, image: image || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="font-sans text-xs tracking-wider uppercase">Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label className="font-sans text-xs tracking-wider uppercase">Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full mt-1 border border-border px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-sans text-xs tracking-wider uppercase">Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label className="font-sans text-xs tracking-wider uppercase">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 border border-border px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label className="font-sans text-xs tracking-wider uppercase">Image URL (optional)</Label>
        <Input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1" placeholder="https://..." />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-gold text-charcoal hover:bg-gold-dark">
          {isLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
          {initial ? "Save Changes" : "Add Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const initAuth = useInitializeAuth();
  const { data: productsData, isLoading: productsLoading } = useGetProducts(1, 50);
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories(1, 50);
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();
  const addCategory = useAddCategory();

  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "", image: "" });

  const products = productsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const categoryNames = categories.map((c) => c.name);

  const isLoggedIn = loginStatus === "success" && !!identity;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <ShieldAlert size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-charcoal mb-3">Admin Access</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="bg-gold text-charcoal hover:bg-gold-dark w-full"
          >
            {loginStatus === "logging-in" && <Loader2 size={14} className="mr-2 animate-spin" />}
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <ShieldAlert size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-charcoal mb-3">Not Authorized</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            You don't have admin access. Initialize auth if you're the first admin.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => initAuth.mutate(undefined, { onSuccess: () => toast.success("Admin initialized!") })}
              disabled={initAuth.isPending}
              className="bg-gold text-charcoal hover:bg-gold-dark"
            >
              {initAuth.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
              Initialize Admin
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-charcoal py-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-sans text-xs tracking-widest uppercase text-gold mb-2">Dashboard</p>
          <h1 className="font-serif text-4xl text-ivory">Admin Panel</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <Tabs defaultValue="products">
          <TabsList className="mb-8 bg-white border border-border">
            <TabsTrigger value="products" className="font-sans text-xs tracking-wider uppercase data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              <Package size={14} className="mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="font-sans text-xs tracking-wider uppercase data-[state=active]:bg-gold data-[state=active]:text-charcoal">
              <Tag size={14} className="mr-2" /> Categories
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">Products ({products.length})</h2>
              <Button
                onClick={() => setProductDialog({ open: true })}
                className="bg-gold text-charcoal hover:bg-gold-dark text-xs tracking-wider uppercase"
              >
                <Plus size={14} className="mr-2" /> Add Product
              </Button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="text-gold animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white border border-ivory-dark">
                <Package size={40} className="text-gold/30 mx-auto mb-4" />
                <p className="font-serif text-xl text-charcoal mb-2">No Products Yet</p>
                <p className="font-sans text-sm text-muted-foreground">Add your first product to get started.</p>
              </div>
            ) : (
              <div className="bg-white border border-ivory-dark overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ivory">
                      <TableHead className="font-sans text-xs tracking-wider uppercase">Name</TableHead>
                      <TableHead className="font-sans text-xs tracking-wider uppercase">Category</TableHead>
                      <TableHead className="font-sans text-xs tracking-wider uppercase">Price</TableHead>
                      <TableHead className="font-sans text-xs tracking-wider uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id.toString()}>
                        <TableCell className="font-sans text-sm font-medium">{product.name}</TableCell>
                        <TableCell className="font-sans text-sm text-muted-foreground">{product.category}</TableCell>
                        <TableCell className="font-serif text-sm">${(Number(product.price) / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setProductDialog({ open: true, product })}
                              className="h-8 w-8 hover:text-gold"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                deleteProduct.mutate(product.id, {
                                  onSuccess: () => toast.success("Product deleted"),
                                  onError: () => toast.error("Failed to delete product"),
                                })
                              }
                              disabled={deleteProduct.isPending}
                              className="h-8 w-8 hover:text-destructive"
                            >
                              {deleteProduct.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-charcoal">Categories ({categories.length})</h2>
              <Button
                onClick={() => setCategoryDialog(true)}
                className="bg-gold text-charcoal hover:bg-gold-dark text-xs tracking-wider uppercase"
              >
                <Plus size={14} className="mr-2" /> Add Category
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="text-gold animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="bg-white border border-ivory-dark p-5">
                    <h3 className="font-serif text-lg text-charcoal mb-1">{cat.name}</h3>
                    <p className="font-sans text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialog.open} onOpenChange={(open) => setProductDialog({ open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {productDialog.product ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categoryNames}
            initial={productDialog.product}
            isLoading={addProduct.isPending || editProduct.isPending}
            onCancel={() => setProductDialog({ open: false })}
            onSubmit={(data) => {
              if (productDialog.product) {
                editProduct.mutate(
                  { id: productDialog.product.id, ...data },
                  {
                    onSuccess: () => {
                      toast.success("Product updated");
                      setProductDialog({ open: false });
                    },
                    onError: (e) => toast.error(e.message),
                  }
                );
              } else {
                addProduct.mutate(data, {
                  onSuccess: () => {
                    toast.success("Product added");
                    setProductDialog({ open: false });
                  },
                  onError: (e) => toast.error(e.message),
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Add Category</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCategory.mutate(
                { name: catForm.name, description: catForm.description, image: catForm.image || null },
                {
                  onSuccess: () => {
                    toast.success("Category added");
                    setCategoryDialog(false);
                    setCatForm({ name: "", description: "", image: "" });
                  },
                  onError: (e) => toast.error(e.message),
                }
              );
            }}
            className="space-y-4"
          >
            <div>
              <Label className="font-sans text-xs tracking-wider uppercase">Name</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="font-sans text-xs tracking-wider uppercase">Description</Label>
              <textarea
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                required
                rows={3}
                className="w-full mt-1 border border-border px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold resize-none"
              />
            </div>
            <div>
              <Label className="font-sans text-xs tracking-wider uppercase">Image URL (optional)</Label>
              <Input
                value={catForm.image}
                onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCategoryDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addCategory.isPending}
                className="bg-gold text-charcoal hover:bg-gold-dark"
              >
                {addCategory.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
