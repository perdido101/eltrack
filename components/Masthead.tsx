import { PROJECT } from "@/config/project";

export function Masthead() {
  return (
    <header className="plate-inner" style={{ paddingTop: 14, paddingBottom: 14 }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="label-sm m-0">{PROJECT.name}</p>
        <p className="label-xs m-0 text-ink-3">{PROJECT.strapline}</p>
      </div>
    </header>
  );
}
