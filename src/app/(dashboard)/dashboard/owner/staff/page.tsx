import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStaff } from "@/actions/owner/staff";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  MapPin,
  Shield,
  Briefcase,
  Edit,
  AlertCircle,
} from "lucide-react";
import DeleteStaffButton from "./DeleteStaffButton";
import ResetPasswordButton from "./ResetPasswordButton";

export default async function StaffPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const { staff, locations, restaurant } = await getStaff();

  const activeSub = (restaurant as any).subscriptions?.[0];
  const maxStaff = activeSub?.plan?.maxStaffAccounts ?? 5;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">Zespół</h1>
              <p className="mt-1 text-sm text-[#8C8C8C]">
                {staff.length} / {maxStaff} kont pracowniczych w planie
              </p>
            </div>
            {staff.length < maxStaff ? (
              <Link href="/dashboard/owner/staff/new">
                <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                  <Plus className="h-4 w-4" />
                  Dodaj pracownika
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
                <AlertCircle className="h-4 w-4" />
                Osiągnięto limit planu
              </div>
            )}
          </div>

          {/* Limit bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
              <span>Limit kont pracowniczych</span>
              <span>
                {staff.length}/{maxStaff}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#EEEEEE]">
              <div
                className={`h-2 rounded-full transition-all ${staff.length >= maxStaff ? "bg-[#FF4D4F]" : "bg-[#4CAF50]"}`}
                style={{
                  width: `${Math.min((staff.length / maxStaff) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#EEEEEE] bg-white px-8 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1]">
                <MapPin className="h-8 w-8 text-[#FF4D4F]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F1F1F]">
                Brak lokalizacji
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#8C8C8C]">
                Najpierw dodaj lokalizację, aby móc przypisywać do niej
                pracowników.
              </p>
              <Link href="/dashboard/owner/locations/new" className="mt-6">
                <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                  <Plus className="h-4 w-4" />
                  Dodaj lokalizację
                </Button>
              </Link>
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#EEEEEE] bg-white px-8 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1]">
                <User className="h-8 w-8 text-[#FF4D4F]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F1F1F]">
                Brak pracowników
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#8C8C8C]">
                Dodaj pierwszego pracownika lub menadżera do swojej restauracji.
              </p>
              <Link href="/dashboard/owner/staff/new" className="mt-6">
                <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                  <Plus className="h-4 w-4" />
                  Dodaj pracownika
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#8C8C8C]">
                      Pracownik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#8C8C8C]">
                      Rola
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#8C8C8C]">
                      Lokalizacja
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#8C8C8C]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#8C8C8C]">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-[#FAFAFA]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${member.role === "MANAGER" ? "bg-purple-100" : "bg-blue-100"}`}
                          >
                            {member.role === "MANAGER" ? (
                              <Shield className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Briefcase className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1F1F1F]">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-[#8C8C8C]">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.role === "MANAGER"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {member.role === "MANAGER" ? "Menadżer" : "Pracownik"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#1F1F1F]">
                          <MapPin className="h-3.5 w-3.5 text-[#8C8C8C]" />
                          {member.workingAt?.name ?? "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            member.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-green-500" : "bg-red-500"}`}
                          />
                          {member.isActive ? "Aktywny" : "Nieaktywny"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <ResetPasswordButton
                            staffId={member.id}
                            staffName={`${member.firstName} ${member.lastName}`}
                          />
                          <Link href={`/dashboard/owner/staff/${member.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-[#FFF1F1] hover:text-[#FF4D4F]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteStaffButton
                            id={member.id}
                            name={`${member.firstName} ${member.lastName}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
