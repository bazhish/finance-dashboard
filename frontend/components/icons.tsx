"use client";

import type React from "react";
import { useId } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRight,
  faArrowTrendDown,
  faArrowTrendUp,
  faAward,
  faBullseye,
  faCalculator,
  faCalendarDay,
  faCalendarDays,
  faCamera,
  faChartColumn,
  faChartLine,
  faChartPie,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleArrowDown,
  faCircleArrowUp,
  faCircleCheck,
  faCircleDollarToSlot,
  faCircleExclamation,
  faCircleInfo,
  faCirclePlus,
  faCircleQuestion,
  faCopy,
  faDisplay,
  faDownload,
  faEnvelope,
  faFileArrowUp,
  faFileCsv,
  faFileLines,
  faGear,
  faHouse,
  faIndent,
  faLayerGroup,
  faListCheck,
  faMagnifyingGlass,
  faMoon,
  faOutdent,
  faPencil,
  faPiggyBank,
  faPlus,
  faReceipt,
  faRepeat,
  faRightFromBracket,
  faShieldHalved,
  faSliders,
  faSpinner,
  faSun,
  faTrash,
  faTriangleExclamation,
  faUpload,
  faUser,
  faWallet,
  faWandMagicSparkles,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

/**
 * Ícones do Trevo — Font Awesome Free renderizado em duotone.
 *
 * O duotone de fábrica é exclusivo do Font Awesome Pro (licença paga), então
 * aqui ele é reconstruído: o glifo é pintado com um gradiente de corte seco
 * (hard stop) entre duas opacidades de `currentColor`. O resultado tem as duas
 * tonalidades características do duotone e, por derivar de `currentColor`,
 * funciona em qualquer contexto — botão verde, alerta vermelho, tema escuro —
 * sem precisar declarar cor por ícone.
 *
 * Ícones funcionais pequenos (chevron, x, check, spinner) ficam sólidos: em
 * 16px o corte de tonalidade só atrapalharia a leitura da forma.
 */

export type IconProps = {
  className?: string;
  title?: string;
  /** Força cor chapada, ignorando o duotone. */
  solid?: boolean;
  /** Lado do ícone em px. Sem ele o tamanho vem das classes utilitárias. */
  size?: number;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
  /** Aceita por compatibilidade com a API anterior; sem efeito em glifo sólido. */
  strokeWidth?: number;
};

export type TrevoIcon = (props: IconProps) => React.ReactElement;

function pathOf(def: IconDefinition): string {
  const raw = def.icon[4];
  return Array.isArray(raw) ? raw.join(" ") : raw;
}

function createIcon(def: IconDefinition, alwaysSolid = false): TrevoIcon {
  function Icon({ className, title, solid, size, style, "aria-hidden": ariaHidden }: IconProps) {
    const gradientId = useId();
    const [width, height] = def.icon;
    const flat = alwaysSolid || solid;
    // `size` (px) tem prioridade; sem ele o tamanho vem das classes utilitárias.
    const sizing = size ? undefined : className ?? "h-5 w-5";

    return (
      <svg
        aria-hidden={ariaHidden ?? (title ? undefined : true)}
        className={size ? className : sizing}
        height={size}
        role={title ? "img" : undefined}
        style={style}
        viewBox={`0 0 ${width} ${height}`}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title ? <title>{title}</title> : null}
        {flat ? null : (
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
              <stop offset="52%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="52%" stopColor="currentColor" stopOpacity="0.45" />
            </linearGradient>
          </defs>
        )}
        <path d={pathOf(def)} fill={flat ? "currentColor" : `url(#${gradientId})`} />
      </svg>
    );
  }
  Icon.displayName = def.iconName;
  return Icon;
}

const FLAT = true;

// Expressivos — ganham o duotone.
export const AlertCircle = createIcon(faCircleExclamation);
export const AlertTriangle = createIcon(faTriangleExclamation);
export const ArrowDownCircle = createIcon(faCircleArrowDown);
export const ArrowUpCircle = createIcon(faCircleArrowUp);
export const BadgeCheck = createIcon(faAward);
export const BarChart3 = createIcon(faChartColumn);
export const Calculator = createIcon(faCalculator);
export const CalendarClock = createIcon(faCalendarDay);
export const CalendarDays = createIcon(faCalendarDays);
export const Camera = createIcon(faCamera);
export const CheckCircle2 = createIcon(faCircleCheck);
export const CircleDollarSign = createIcon(faCircleDollarToSlot);
export const CircleHelp = createIcon(faCircleQuestion);
export const Copy = createIcon(faCopy);
export const Download = createIcon(faDownload);
export const FileSpreadsheet = createIcon(faFileCsv);
export const FileText = createIcon(faFileLines);
export const FileUp = createIcon(faFileArrowUp);
export const HelpCircle = createIcon(faCircleQuestion);
export const Home = createIcon(faHouse);
export const Info = createIcon(faCircleInfo);
export const Layers3 = createIcon(faLayerGroup);
export const LineChart = createIcon(faChartLine);
export const ListChecks = createIcon(faListCheck);
export const LogOut = createIcon(faRightFromBracket);
export const Mail = createIcon(faEnvelope);
export const Monitor = createIcon(faDisplay);
export const Moon = createIcon(faMoon);
export const Pencil = createIcon(faPencil);
export const PieChart = createIcon(faChartPie);
export const PiggyBank = createIcon(faPiggyBank);
export const PlusCircle = createIcon(faCirclePlus);
export const ReceiptText = createIcon(faReceipt);
export const Repeat = createIcon(faRepeat);
export const Settings = createIcon(faGear);
export const Shield = createIcon(faShieldHalved);
export const ShieldAlert = createIcon(faShieldHalved);
export const ShieldCheck = createIcon(faShieldHalved);
export const SlidersHorizontal = createIcon(faSliders);
export const Sparkles = createIcon(faWandMagicSparkles);
export const Sun = createIcon(faSun);
export const Target = createIcon(faBullseye);
export const Trash2 = createIcon(faTrash);
export const TrendingDown = createIcon(faArrowTrendDown);
export const TrendingUp = createIcon(faArrowTrendUp);
export const Upload = createIcon(faUpload);
export const UserRound = createIcon(faUser);
export const Wallet = createIcon(faWallet);
export const WalletCards = createIcon(faWallet);
export const Wand2 = createIcon(faWandMagicSparkles);
export const Github = createIcon(faGithub);

// Funcionais — sólidos, para não perder nitidez em tamanho pequeno.
export const ArrowRight = createIcon(faArrowRight, FLAT);
export const Check = createIcon(faCheck, FLAT);
export const ChevronDown = createIcon(faChevronDown, FLAT);
export const ChevronLeft = createIcon(faChevronLeft, FLAT);
export const ChevronRight = createIcon(faChevronRight, FLAT);
export const LoaderCircle = createIcon(faSpinner, FLAT);
export const PanelLeftClose = createIcon(faOutdent, FLAT);
export const PanelLeftOpen = createIcon(faIndent, FLAT);
export const Plus = createIcon(faPlus, FLAT);
export const Search = createIcon(faMagnifyingGlass, FLAT);
export const X = createIcon(faXmark, FLAT);
