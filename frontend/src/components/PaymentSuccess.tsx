import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddTransaction } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import type { Status } from "../hooks/useQueries";

function PaymentSuccess() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("checkout_session_id");
  const { mutateAsync, isPending } = useAddTransaction();
  const { actor, isFetching } = useActor();

  const [transactionStatus, setTransactionStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processTransaction = async () => {
      if (!sessionId || !actor || isFetching) return;
      try {
        setIsProcessing(true);
        const result = await mutateAsync(sessionId);
        if (result) {
          setTransactionStatus(result);
          if ("completed" in result) {
            setIsProcessing(false);
          } else if ("failed" in result) {
            setIsProcessing(false);
            setError(result.failed.error);
          } else if ("checking" in result) {
            setTimeout(() => processTransaction(), 3000);
          } else {
            setIsProcessing(false);
            setError("Unknown payment status");
          }
        } else {
          setIsProcessing(false);
          setError("No transaction record found");
        }
      } catch (err: any) {
        setIsProcessing(false);
        setError(err?.message ?? "Error processing transaction");
      }
    };
    processTransaction();
  }, [sessionId, actor, isFetching]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing || isPending) {
        e.preventDefault();
        e.returnValue = "Your payment is still being processed. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing, isPending]);

  const renderContent = () => {
    if (isProcessing || isPending) {
      return (
        <>
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-b-2 border-gold" />
          <h2 className="mb-4 font-serif text-3xl text-charcoal">Processing Payment...</h2>
          <div className="mb-6 rounded bg-ivory p-4 flex items-center justify-center gap-2 text-charcoal">
            <Clock className="h-4 w-4 text-gold" />
            <p className="font-sans text-sm">We're verifying your payment. Please wait...</p>
          </div>
        </>
      );
    }

    if (error || (transactionStatus && "failed" in transactionStatus)) {
      const errorMessage = error ?? (transactionStatus && "failed" in transactionStatus ? transactionStatus.failed.error : "Payment verification failed");
      return (
        <>
          <XCircle className="mx-auto mb-6 h-16 w-16 text-red-500" />
          <h2 className="mb-4 font-serif text-3xl text-charcoal">Payment Issue</h2>
          <div className="mb-6 rounded bg-red-50 p-4">
            <div className="flex items-center justify-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-sans text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => window.location.reload()}
              className="w-full bg-red-600 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700 transition-colors">
              Try Again
            </button>
            <button onClick={() => navigate({ to: "/" })}
              className="w-full border border-border px-6 py-3 font-sans text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-ivory transition-colors">
              Back to Shop
            </button>
          </div>
        </>
      );
    }

    if (transactionStatus && "completed" in transactionStatus) {
      return (
        <>
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
          <h2 className="mb-4 font-serif text-3xl text-charcoal">Thank You!</h2>
          <div className="mb-6 rounded bg-green-50 p-4">
            <p className="font-sans text-sm font-medium text-green-800">
              Your payment has been processed successfully. We appreciate your purchase!
            </p>
          </div>
          <button onClick={() => navigate({ to: "/" })}
            className="w-full bg-gold text-charcoal px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-gold-dark transition-colors">
            Continue Shopping
          </button>
        </>
      );
    }

    return (
      <>
        <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-gold" />
        <h2 className="mb-4 font-serif text-3xl text-charcoal">Processing...</h2>
        <div className="mb-6 rounded bg-ivory p-4">
          <p className="font-sans text-sm text-muted-foreground">We're still processing your payment. Please wait a moment.</p>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/assets/generated/loboda-logo.png" alt="LOBODA Jewelry" className="h-14 mx-auto object-contain mb-2"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <h1 className="font-serif text-2xl text-charcoal tracking-wider">LOBODA Jewelry</h1>
        </div>
        <div className="bg-white p-8 text-center shadow-luxury">
          {renderContent()}
        </div>
        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-muted-foreground">Need help? <button onClick={() => navigate({ to: "/contact" })} className="text-gold hover:text-gold-dark underline">Contact us</button></p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
