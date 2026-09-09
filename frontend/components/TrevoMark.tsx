"use client";

import { useId } from "react";

/**
 * Trevo de quatro folhas — a marca.
 *
 * As quatro folhas são o mesmo path em forma de coração, girado de 90° em 90°
 * em torno do centro. Elas alternam entre dois tons do verde da marca, que é o
 * mesmo princípio duotone usado nos ícones (ver components/icons.tsx): duas
 * tonalidades derivadas de uma cor só, então a marca continua legível sobre
 * qualquer fundo e nos dois temas.
 */

const LEAF =
  "M32 31.5 C32 31.5 20.4 26.6 18.2 18.4 C16.6 11.4 22.2 6.2 27.2 8.2 C30 9.3 31.6 11.8 32 14 C32.4 11.8 34 9.3 36.8 8.2 C41.8 6.2 47.4 11.4 45.8 18.4 C43.6 26.6 32 31.5 32 31.5 Z";

type TrevoMarkProps = {
  className?: string;
  /** Usa os verdes da marca; com `false` herda a cor do contexto (currentColor). */
  branded?: boolean;
  title?: string;
};

export function TrevoMark({ className = "h-8 w-8", branded = true, title }: TrevoMarkProps) {
  const id = useId();
  const deep = branded ? "var(--brand-leaf-deep, #1F8049)" : "currentColor";
  const light = branded ? "var(--brand-leaf-light, #4FB877)" : "currentColor";
  const stem = branded ? "var(--brand-stem, #19653B)" : "currentColor";

  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      role={title ? "img" : undefined}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {/* Haste desenhada primeiro (fica atrás) e longa o bastante para escapar do
          contorno das folhas, que são reduzidas para abrir esse espaço. */}
      <path
        d="M32 36 C32.6 44 33.8 51.4 40.5 58.5"
        fill="none"
        opacity={branded ? 1 : 0.55}
        stroke={stem}
        strokeLinecap="round"
        strokeWidth="4"
      />
      <g transform="translate(32 29) scale(0.86) translate(-32 -32)">
        <path d={LEAF} fill={deep} transform="rotate(0 32 32)" />
        <path d={LEAF} fill={light} opacity={branded ? 1 : 0.62} transform="rotate(90 32 32)" />
        <path d={LEAF} fill={deep} transform="rotate(180 32 32)" />
        <path d={LEAF} fill={light} opacity={branded ? 1 : 0.62} transform="rotate(270 32 32)" />
      </g>
      <circle cx="32" cy="29" fill={stem} opacity="0.9" r="2.2" />
      <desc id={`${id}-desc`}>Trevo de quatro folhas</desc>
    </svg>
  );
}

/** Marca completa: símbolo + nome + assinatura. */
export function TrevoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <TrevoMark className="h-10 w-10 shrink-0" title="Trevo" />
      {compact ? null : (
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold tracking-tight text-ink">Trevo</p>
          <p className="text-sm font-semibold text-leaf-600">suas finanças com sorte e método</p>
        </div>
      )}
    </div>
  );
}
