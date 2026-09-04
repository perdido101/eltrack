import { chromium } from "playwright-core";
const [,, url, w = "360"] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: +w, height: 800 } });
await page.goto(url, { waitUntil: "load" });
await page.waitForFunction(() => !document.querySelector(".value-hero .dash"), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
const out = await page.evaluate((vw) => {
  const inWell = (e) => !!e.closest(".overflow-well, .map-well");
  const bad = [...document.querySelectorAll("body *")].filter((e) => !inWell(e) && e.getBoundingClientRect().right > vw + 1 && !e.querySelector(":scope > *") ).slice(0, 15)
    .map((e) => `${e.tagName.toLowerCase()}.${(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || "").toString().split(" ").slice(0, 2).join(".")} right=${Math.round(e.getBoundingClientRect().right)} text=${(e.textContent || "").slice(0, 40)}`);
  const sections = [...document.querySelectorAll("section.plate, header, footer, section.ticker")].map((s) => `${s.getAttribute("aria-labelledby") || s.tagName} sw=${s.scrollWidth}`);
  return { scrollWidth: document.documentElement.scrollWidth, sections, bad };
}, +w);
console.log(JSON.stringify(out, null, 1));
await browser.close();
