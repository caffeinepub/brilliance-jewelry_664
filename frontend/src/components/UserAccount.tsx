import React, { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  User,
  LogOut,
  LogIn,
  Save,
  Package,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useUser, useSetUser, useUserTransactions } from "../hooks/useQueries";
import type { Status } from "../hooks/useQueries";

const getTotalInvoice = (status: Status): string => {
  if ("completed" in status && "response" in status.completed) {
    try {
      const json = JSON.parse(status.completed.response);
      return Number(json.amount_total / 100).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0";
    }
  }
  return "0";
};

function UserAccount() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: userName } = useUser();
  const { mutate: setUser, isPending: isSavingUser } = useSetUser();
  const { data: transactions } = useUserTransactions();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const isLoggedIn = loginStatus === "success" && !!identity;

  const handleSaveName = () => {
    setSaveError(null);
    setUser(nameInput.trim(), {
      onSuccess: () => setEditingName(false),
      onError: (e: any) => setSaveError(e?.message ?? "Failed to save name"),
    });
  };

  const getStatusIcon = (status: Status) => {
    if ("completed" in status) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if ("failed" in status) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (status: Status) => {
    if ("completed" in status) return "Completed";
    if ("failed" in status) return "Failed";
    return "Processing";
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <User size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-charcoal mb-3">My Account</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Sign in to view your account and order history.
          </p>
          <button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="bg-gold text-charcoal px-8 py-3 text-xs font-sans font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loginStatus === "logging-in" ? (
              <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
            ) : (
              <LogIn size={14} />
            )}
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-charcoal py-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-gold mb-1">Account</p>
            <h1 className="font-serif text-4xl text-ivory">
              {userName ?? "My Account"}
            </h1>
          </div>
          <button
            onClick={() => clear()}
            className="flex items-center gap-2 text-ivory/60 hover:text-gold transition-colors text-sm font-sans"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Profile Section */}
        <div className="bg-white border border-ivory-dark p-6">
          <h2 className="font-serif text-2xl text-charcoal mb-5">Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground mb-1">
                Principal ID
              </p>
              <p className="font-sans text-sm text-charcoal break-all">
                {identity?.getPrincipal().toString()}
              </p>
            </div>
            <div>
              <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground mb-2">
                Display Name
              </p>
              {editingName ? (
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-gold transition-colors bg-ivory"
                      placeholder="Enter your name"
                      maxLength={255}
                    />
                    {saveError && (
                      <p className="text-xs text-destructive mt-1">{saveError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingUser || !nameInput.trim()}
                    className="bg-gold text-charcoal px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isSavingUser ? (
                      <div className="w-3 h-3 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setSaveError(null); }}
                    className="px-4 py-2 text-xs font-sans text-muted-foreground hover:text-charcoal transition-colors border border-border"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="font-sans text-sm text-charcoal">
                    {userName ?? <span className="text-muted-foreground italic">Not set</span>}
                  </p>
                  <button
                    onClick={() => { setEditingName(true); setNameInput(userName ?? ""); }}
                    className="text-xs text-gold hover:text-gold-dark transition-colors font-sans underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white border border-ivory-dark p-6">
          <h2 className="font-serif text-2xl text-charcoal mb-5 flex items-center gap-2">
            <Package size={20} className="text-gold" />
            Order History
          </h2>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-10">
              <Package size={36} className="text-gold/30 mx-auto mb-3" />
              <p className="font-serif text-lg text-charcoal mb-1">No Orders Yet</p>
              <p className="font-sans text-sm text-muted-foreground">
                Your order history will appear here once our store opens.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(([sessionId, status]) => (
                <div
                  key={sessionId}
                  className="flex items-center justify-between p-4 border border-ivory-dark"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="font-sans text-sm font-medium text-charcoal">
                        {sessionId.slice(0, 20)}...
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">
                        {getStatusText(status)}
                      </p>
                    </div>
                  </div>
                  {"completed" in status && (
                    <p className="font-serif text-lg text-charcoal">
                      ${getTotalInvoice(status)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserAccount;
