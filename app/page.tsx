import { Masthead } from "@/components/Masthead";
import { CurrentState } from "@/components/CurrentState";
import { NewsTicker } from "@/components/NewsTicker";
import { RegionReadouts } from "@/components/RegionReadouts";
import { OniHistory } from "@/components/OniHistory";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Masthead />
      <main className="sheet">
        <CurrentState />
        <NewsTicker />
        <RegionReadouts />
        <OniHistory />
      </main>
      <Footer />
    </>
  );
}
