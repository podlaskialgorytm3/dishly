"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetStaffPassword } from "@/actions/owner/staff";
import { Key, Copy, CheckCircle } from "lucide-react";

export default function ResetPasswordButton({
  staffId,
  staffName,
}: {
  staffId: string;
  staffName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const result = await resetStaffPassword(staffId);
      setNewPassword(result.generatedPassword);
      setShowDialog(true);
      toast.success("Hasło zostało zresetowane");
    } catch (error: any) {
      toast.error(error.message || "Wystąpił błąd podczas resetowania hasła");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success("Hasło skopiowane do schowka");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Nie udało się skopiować hasła");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg hover:bg-[#FFF1F1] hover:text-[#FF4D4F]"
        onClick={handleResetPassword}
        disabled={loading}
        title="Wygeneruj nowe hasło"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF4D4F] border-t-transparent" />
        ) : (
          <Key className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-4xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Hasło zresetowane!
            </DialogTitle>
            <DialogDescription>
              Nowe hasło zostało wygenerowane dla {staffName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
              <p className="mb-2 text-xs font-medium text-[#8C8C8C]">
                Nowe hasło:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-base font-bold text-[#1F1F1F]">
                  {newPassword}
                </code>
                <Button
                  type="button"
                  onClick={handleCopyPassword}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-2 border-green-300"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Ważne:</strong> To hasło zostanie wyświetlone tylko
                raz. Skopiuj je teraz i przekaż pracownikowi w bezpieczny
                sposób.
              </p>
            </div>
            <Button
              onClick={() => setShowDialog(false)}
              className="w-full rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
            >
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
