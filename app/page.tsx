import { Masthead } from "@/components/Masthead";
import { CurrentState } from "@/components/CurrentState";
import { NewsTicker } from "@/components/NewsTicker";
import { PacificMap } from "@/components/PacificMap";
import { GlobalSst } from "@/components/GlobalSst";
import { SouthernOscillation } from "@/components/SouthernOscillation";
import { RegionReadouts } from "@/components/RegionReadouts";
import { OniSection } from "@/components/OniSection";
import { Subsurface } from "@/components/Subsurface";
import { ForecastPlume } from "@/components/ForecastPlume";
import { Glossary } from "@/components/Glossary";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Masthead />
      <main className="sheet">
        <CurrentState />
        <NewsTicker />
        <PacificMap />
        <RegionReadouts />
        <GlobalSst />
        <Subsurface />
        <SouthernOscillation />
        <ForecastPlume />
        <OniSection />
        <Glossary />
      </main>
      <Footer />
    </>
  );
}
