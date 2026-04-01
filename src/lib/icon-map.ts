// Icon mapping utility for client components
// This file maps icon names to icon components to avoid passing functions to client components

import {
  LayoutDashboard,
  FileText,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  UtensilsCrossed,
  Home,
  CreditCard,
  BookOpen,
  Shield,
  MapPin,
  Users2,
  Palette,
  Eye,
  ShoppingBag,
  BarChart3,
  ClipboardList,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "LayoutDashboard"
  | "FileText"
  | "Users"
  | "Store"
  | "LogOut"
  | "ShieldCheck"
  | "UtensilsCrossed"
  | "Home"
  | "CreditCard"
  | "BookOpen"
  | "Shield"
  | "MapPin"
  | "Users2"
  | "Palette"
  | "Eye"
  | "ShoppingBag"
  | "BarChart3"
  | "ClipboardList"
  | "MessageSquare"
  | "DollarSign"
  | "TrendingUp"
  | "Calendar"
  | "Clock"
  | "RefreshCw"
  | "ChevronLeft"
  | "ChevronRight"
  | "Star"
  | "Award"
  | "CheckCircle2"
  | "AlertCircle"
  | "ArrowUpRight"
  | "ArrowDownRight"
  | "Briefcase";

export const iconMap: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  UtensilsCrossed,
  Home,
  CreditCard,
  BookOpen,
  Shield,
  MapPin,
  Users2,
  Palette,
  Eye,
  ShoppingBag,
  BarChart3,
  ClipboardList,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
};

export function getIcon(name: IconName): LucideIcon {
  return iconMap[name];
}
