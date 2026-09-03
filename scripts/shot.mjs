import { chromium } from "playwright-core";
const [,, url, out, w = "1280", h = "1100", rm = "", sel = ""] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, reducedMotion: rm ? "reduce" : "no-preference", deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "load" });
// Wait for the hero value to land (or a signal-lost state), then settle.
await page.waitForFunction(() => !document.querySelector(".value-hero .dash"), null, { timeout: 20000 }).catch(() => {});
await page.waitForFunction(() => document.querySelector(".ticker-item") || /Signal lost/.test(document.querySelector(".ticker")?.textContent ?? ""), null, { timeout: 25000 }).catch(() => {});
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const wide = [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > vw + 1).slice(0, 12)
    .map(e => `${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(" ").slice(0,2).join(".") : ""} right=${Math.round(e.getBoundingClientRect().right)}`);
  return { vw, scrollWidth: document.documentElement.scrollWidth, wide };
});
console.log(JSON.stringify(info, null, 1));
if (sel) await page.locator(sel).screenshot({ path: out }); else await page.screenshot({ path: out, fullPage: true });
const t = page.locator(".ticker");
if (await t.count()) await t.screenshot({ path: out.replace(/\.png$/, "-ticker.png") });
await browser.close();
