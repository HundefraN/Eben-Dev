/** Temporary: close-up of the counter, with and without the digit glow. */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = 'http://127.0.0.1:5188';
const OUT = '.shots-zoom';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: 'chrome' });
await mkdir(OUT, { recursive: true });

const context = await browser.newContext({
  viewport: { width: 1200, height: 760 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();
await page.addInitScript(() => {
  try {
    localStorage.setItem('eben-theme', 'dark');
  } catch {}
});

// Warm the cache so screenshots don't block on fonts.
await page.goto(URL, { waitUntil: 'load' });
await page.waitForSelector('header', { timeout: 20000 });
await wait(1500);

for (const variant of ['as-built', 'no-glow', 'no-mask']) {
  await page.reload({ waitUntil: 'commit' });
  if (variant === 'no-glow') {
    await page.addStyleTag({ content: '* { text-shadow: none !important; }' }).catch(() => {});
  }
  if (variant === 'no-mask') {
    await page
      .addStyleTag({ content: '* { -webkit-mask-image: none !important; mask-image: none !important; }' })
      .catch(() => {});
  }
  await wait(850);
  await page.screenshot({
    path: `${OUT}/${variant}.png`,
    clip: { x: 380, y: 230, width: 440, height: 300 },
    timeout: 20000,
  });
}

await browser.close();
console.log(`→ ${OUT}/`);
