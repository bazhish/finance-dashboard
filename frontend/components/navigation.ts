import type { TrevoIcon } from "@/components/icons";
import { CalendarDays, FileText, Home, Layers3, PiggyBank, ReceiptText, Settings, Upload, UserRound } from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: TrevoIcon;
};

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Resumo", icon: Home },
  { href: "/transacoes", label: "Movimentacoes", icon: ReceiptText },
  { href: "/metas", label: "Metas", icon: CalendarDays },
  { href: "/orcamento", label: "Orcamento", icon: PiggyBank },
  { href: "/parcelas", label: "Parcelas", icon: Layers3 },
  { href: "/importar", label: "Importar", icon: Upload },
  { href: "/relatorios", label: "Relatorios", icon: FileText },
  { href: "/perfil", label: "Perfil", icon: UserRound },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings }
];

export function isActiveNavItem(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname.startsWith("/dashboard");
  return pathname.startsWith(href);
}
