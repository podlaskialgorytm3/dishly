"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterOwnerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    restaurantName: "",
    restaurantBio: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Walidacja
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są zgodne");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      setIsLoading(false);
      return;
    }

    if (!formData.restaurantName) {
      setError("Nazwa restauracji jest wymagana");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">
              Rejestracja Udana!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Twoje konto zostało utworzone i oczekuje na zatwierdzenie przez
              administratora. Otrzymasz powiadomienie email gdy Twoje konto
              zostanie aktywowane.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Rejestracja Właściciela Restauracji
          </CardTitle>
          <CardDescription>
            Dołącz do platformy DISHLY i zacznij przyjmować zamówienia online
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Dane osobowe */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dane osobowe</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Imię *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jan"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Nazwisko *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Kowalski"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="kontakt@restauracja.pl"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefon *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+48 123 456 789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Dane restauracji */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dane restauracji</h3>
              <div className="space-y-2">
                <label htmlFor="restaurantName" className="text-sm font-medium">
                  Nazwa restauracji *
                </label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  type="text"
                  placeholder="Moja Restauracja"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="restaurantBio" className="text-sm font-medium">
                  Opis restauracji
                </label>
                <textarea
                  id="restaurantBio"
                  name="restaurantBio"
                  placeholder="Krótki opis Twojej restauracji..."
                  value={formData.restaurantBio}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Hasło */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Zabezpieczenia</h3>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Hasło *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">Minimum 8 znaków</p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Potwierdź hasło *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <strong>Uwaga:</strong> Twoje konto wymaga zatwierdzenia przez
              administratora przed rozpoczęciem korzystania z platformy.
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Rejestracja..." : "Zarejestruj restaurację"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Masz już konto?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Zaloguj się
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
