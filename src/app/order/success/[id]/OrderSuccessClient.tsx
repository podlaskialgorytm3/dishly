"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getOrderPaymentStatus } from "@/actions/orders";

type OrderStatus = {
  id: string;
  paymentStatus: string;
  status: string;
  orderNumber: string;
} | null;

export default function OrderSuccessClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderStatus>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkPayment = async () => {
      try {
        const data = await getOrderPaymentStatus(orderId);
        setOrderData(data);

        if (data?.paymentStatus === "PAID") {
          setLoading(false);
          clearInterval(interval);
        } else {
          setPollCount((c) => c + 1);
        }
      } catch {
        setPollCount((c) => c + 1);
      }
    };

    checkPayment();
    interval = setInterval(checkPayment, 2000);

    // Stop polling after 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId]);

  const isPaid = orderData?.paymentStatus === "PAID";
  const isPending = orderData?.paymentStatus === "PENDING";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        {loading && isPending ? (
          // Waiting for Stripe webhook
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100"
            >
              <Loader2 className="h-10 w-10 text-amber-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#1F1F1F]">
              Przetwarzanie płatności...
            </h1>
            <p className="mt-2 text-[#8C8C8C]">
              Czekamy na potwierdzenie od Stripe. Nie zamykaj tej strony.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#8C8C8C]">
              <Clock className="h-4 w-4" />
              <span>To może potrwać kilka sekund...</span>
            </div>
          </div>
        ) : isPaid ? (
          // Payment confirmed
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#1F1F1F]">
              Zamówienie złożone!
            </h1>
            <p className="mt-2 text-[#8C8C8C]">
              Płatność została potwierdzona. Twoje zamówienie trafiło do
              restauracji.
            </p>

            {orderData?.orderNumber && (
              <div className="mt-6 rounded-xl bg-[#F5F5F5] px-4 py-3">
                <p className="text-xs text-[#8C8C8C]">Numer zamówienia</p>
                <p className="mt-1 font-mono text-lg font-bold text-[#1F1F1F]">
                  {orderData.orderNumber}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push(`/order/${orderId}`)}
                className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-5 text-base font-semibold text-white hover:bg-[#FF3B30]"
              >
                <Package className="h-5 w-5" />
                Śledź zamówienie
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full gap-2 rounded-xl py-5 text-base"
              >
                Wróć do strony głównej
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          // Timeout or error
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#1F1F1F]">
              Weryfikacja płatności
            </h1>
            <p className="mt-2 text-[#8C8C8C]">
              Potwierdzenie płatności może przyjść z opóźnieniem. Jeśli płatność
              się powiodła, status zamówienia zaktualizuje się automatycznie.
            </p>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push(`/order/${orderId}`)}
                className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-5 text-base font-semibold text-white hover:bg-[#FF3B30]"
              >
                <Package className="h-5 w-5" />
                Sprawdź status zamówienia
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full gap-2 rounded-xl py-5 text-base"
              >
                Wróć do strony głównej
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
