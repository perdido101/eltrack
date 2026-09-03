import { fmtStamp } from "@/lib/format";

type Props = { source: string; file: string; lastGoodAt?: string; error?: string };

/** Error state per DESIGN §6: grey, typographic, names the feed. Never red. */
export function SignalLost({ source, file, lastGoodAt, error }: Props) {
  return (
    <div className="label-sm text-ink-3" role="status" style={{ lineHeight: 1.8 }}>
      <div>Signal lost</div>
      <div>{source} · {file}</div>
      <div>{lastGoodAt ? `Last good ${fmtStamp(lastGoodAt)}` : "No good fetch yet"}</div>
      {error && <div className="meta normal-case tracking-normal">{error}</div>}
    </div>
  );
}
