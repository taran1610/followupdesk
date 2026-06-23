import { chromium } from "playwright";

const base = "http://localhost:3000";
const outDir = "/Users/sonal/followupdesk/preview";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/01-login.png`, fullPage: true });

  await page.getByRole("button", { name: "Continue in demo mode" }).click();
  await page.waitForURL("**/dashboard**");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outDir}/02-dashboard.png`, fullPage: true });

  await page.goto(`${base}/leads`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/03-leads.png`, fullPage: true });

  await page.goto(`${base}/leads/lead-coach-amara`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/04-lead-detail.png`, fullPage: true });

  await browser.close();
  console.log("Screenshots saved to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
