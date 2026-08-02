/**
 * Design QA harness.
 *   node tools/shoot.mjs [--url=http://localhost:5188] [--out=.shots] [--theme=light|dark]
 * Captures every stage at desktop / tablet / mobile using the locally
 * installed Chrome, and reports any console errors it sees along the way.
 */
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const URL = arg('url', 'http://localhost:5188');
const OUT = arg('out', '.shots');
const THEME = arg('theme', 'light');
const ONLY = arg('only', '');

const VIEWPORTS = [
  { name: 'desktop', width: 1512, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

const STAGES = ['home', 'work', 'founder', 'contact'];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Chrome occasionally stalls a capture on this page; one retry clears it. */
async function shoot(page, path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.screenshot({ path, timeout: 12000, caret: 'hide' });
      return;
    } catch {
      await wait(800);
    }
  }
  console.log('  ! could not capture', path);
}

const browser = await chromium.launch({ channel: 'chrome' });
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const problems = [];

for (const vp of VIEWPORTS) {
  if (ONLY && !ONLY.split(',').includes(vp.name)) continue;

  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile' || vp.name === 'tablet',
    colorScheme: THEME === 'dark' ? 'dark' : 'light',
  });

  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[${vp.name}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${vp.name}] pageerror: ${e.message}`));

  await page.addInitScript((theme) => {
    try {
      localStorage.setItem('eben-theme', theme);
    } catch {}
  }, THEME);

  // 'load', not 'networkidle': the page never goes idle — canvas, HMR socket
  // and font requests keep trickling — so we settle on a fixed wait instead.
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('header', { timeout: 15000 });
  await wait(2600); // let entrance springs settle

  for (let i = 0; i < STAGES.length; i++) {
    if (i > 0) {
      await page.keyboard.press('ArrowDown');
      await wait(1500);
    }
    await shoot(page, `${OUT}/${vp.name}-${i}-${STAGES[i]}.png`);
  }

  // Services overlay, desktop only — that's where it has the most to show.
  if (vp.name === 'desktop') {
    await page.keyboard.press('Home');
    await wait(1200);
    const services = page
      .locator('header')
      .getByRole('button', { name: /services/i })
      .first();
    if (await services.count()) {
      await services.click();
      await wait(1400);
      await shoot(page, `${OUT}/${vp.name}-4-services.png`);
    }
  }

  await context.close();
}

await browser.close();

if (problems.length) {
  console.log('\nISSUES FOUND:');
  for (const p of [...new Set(problems)]) console.log(' •', p);
} else {
  console.log('\nNo console errors.');
}
console.log(`\nScreenshots → ${OUT}/ (theme: ${THEME})`);
