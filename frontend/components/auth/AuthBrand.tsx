import { TrevoMark } from "@/components/TrevoMark";

export function AuthBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-app border border-line bg-leaf-50 shadow-soft">
        <TrevoMark className="h-7 w-7" />
      </span>
      <div>
        <p className="font-display text-xl font-extrabold tracking-tight text-ink">Trevo</p>
        <p className="text-sm font-semibold text-leaf-600">suas finanças com sorte e método</p>
      </div>
    </div>
  );
}
