"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OrderCancelledClient({ orderId }: { orderId: string }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
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
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100"
          >
            <XCircle className="h-10 w-10 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Płatność anulowana
          </h1>
          <p className="mt-2 text-[#8C8C8C]">
            Płatność została anulowana lub odrzucona. Twoje zamówienie nie
            zostało złożone. Możesz spróbować ponownie.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              onClick={() => router.back()}
              className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-5 text-base font-semibold text-white hover:bg-[#FF3B30]"
            >
              <RefreshCw className="h-5 w-5" />
              Spróbuj ponownie
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
      </motion.div>
    </div>
  );
}
