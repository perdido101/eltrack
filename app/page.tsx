import { StickyStrip } from "@/components/StickyStrip";
import { RightNow } from "@/components/RightNow";
import { PacificMap } from "@/components/PacificMap";
import { Regions } from "@/components/Regions";
import { Compare } from "@/components/Compare";
import { Atmosphere } from "@/components/Atmosphere";
import { Subsurface } from "@/components/Subsurface";
import { ForecastPlume } from "@/components/ForecastPlume";
import { Impacts } from "@/components/Impacts";
import { NewsList } from "@/components/NewsList";
import { Glossary } from "@/components/Glossary";
import { GlobalSst } from "@/components/GlobalSst";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <StickyStrip />
      <main className="page">
        <RightNow />
        <PacificMap />
        <Regions />
        <Compare />
        <Atmosphere />
        <Subsurface />
        <ForecastPlume />
        <GlobalSst />
        <Impacts />
        <NewsList />
        <Glossary />
      </main>
      <Footer />
    </>
  );
}
