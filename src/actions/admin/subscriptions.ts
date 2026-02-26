"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function requireAdmin(role: string) {
  if (role !== "ADMIN") throw new Error("Brak uprawnień");
}

const SubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Cena nie może być ujemna"),
  interval: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  maxLocations: z.coerce.number().min(1),
  maxMeals: z.coerce.number().min(1),
  maxStaffAccounts: z.coerce.number().min(1),
  isActive: z.boolean().default(true),
});

export async function getSubscriptionPlans() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { subscriptions: true } } },
  });
}

export async function createSubscriptionPlan(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  const raw = Object.fromEntries(formData);
  const data = SubscriptionPlanSchema.parse({
    ...raw,
    isActive:
      raw.isActive !== undefined
        ? raw.isActive === "true" || raw.isActive === "on"
        : true,
  });

  await db.subscriptionPlan.create({ data });
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}

export async function updateSubscriptionPlan(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  const raw = Object.fromEntries(formData);
  const data = SubscriptionPlanSchema.parse({
    ...raw,
    isActive:
      raw.isActive !== undefined
        ? raw.isActive === "true" || raw.isActive === "on"
        : true,
  });

  await db.subscriptionPlan.update({ where: { id }, data });
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}

export async function deleteSubscriptionPlan(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  const plan = await db.subscriptionPlan.findUnique({
    where: { id },
    include: { _count: { select: { subscriptions: true } } },
  });

  if (plan?._count.subscriptions && plan._count.subscriptions > 0) {
    return {
      success: false,
      error: "Nie można usunąć planu z aktywnymi subskrypcjami",
    };
  }

  await db.subscriptionPlan.delete({ where: { id } });
  revalidatePath("/dashboard/subscriptions");
  return { success: true };
}
