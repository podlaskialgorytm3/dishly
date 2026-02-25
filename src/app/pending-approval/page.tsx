import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Oczekiwanie na Zatwierdzenie
          </CardTitle>
          <CardDescription>
            Twoje konto jest w trakcie weryfikacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-700">
            Twoje konto właściciela restauracji zostało utworzone i oczekuje na
            zatwierdzenie przez administratora platformy DISHLY.
          </p>
          <p className="text-center text-sm text-gray-600">
            Otrzymasz powiadomienie email gdy Twoje konto zostanie aktywowane i
            będziesz mógł rozpocząć korzystanie z platformy.
          </p>
          <div className="space-y-2 pt-4">
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Powrót do logowania
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button
                variant="ghost"
                className="w-full text-[var(--dishly-primary)]"
              >
                Strona główna
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
