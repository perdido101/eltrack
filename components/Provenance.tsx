type Props = { source: string; obs?: string; refresh: string; stale?: boolean };

/** "NOAA CPC · OBS 26 AUG 2026 · 6H" — observation date, never fetch time. */
export function Provenance({ source, obs, refresh, stale }: Props) {
  return (
    <>
      {source}
      {obs && <> · OBS {obs}</>}
      {" · "}{refresh}
      {stale && <> · STALE</>}
    </>
  );
}
