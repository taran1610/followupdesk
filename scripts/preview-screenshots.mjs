import { chromium } from "playwright";

const base = "http://localhost:3000";
const outDir = "/Users/sonal/followupdesk/preview";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/01-landing.png`, fullPage: true });

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/02-login.png`, fullPage: true });

  await page.goto(`${base}/signup`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/03-signup.png`, fullPage: true });

  await browser.close();
  console.log("Screenshots saved to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
