/** Temporary QA pass for the loading counter + reworked Works section. */
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const URL = process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://localhost:5188';
const THEME = process.argv.find((a) => a.startsWith('--theme='))?.slice(8) ?? 'light';
const OUT = `.shots-verify-${THEME}`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: 'chrome' });
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const problems = [];

for (const vp of [
  { name: 'desktop', width: 1512, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
    colorScheme: THEME === 'dark' ? 'dark' : 'light',
  });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[${vp.name}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${vp.name}] pageerror: ${e.message}`));
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('eben-theme', t);
    } catch {}
  }, THEME);

  const shot = async (name) => {
    try {
      await page.screenshot({ path: `${OUT}/${vp.name}-${name}.png`, timeout: 20000 });
    } catch (e) {
      problems.push(`[${vp.name}] shot ${name}: ${e.message.split('\n')[0]}`);
    }
  };

  // Warm the font + image cache first: page.screenshot() blocks on
  // document.fonts, which would otherwise race every loader frame.
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('header', { timeout: 20000 });
  await wait(1500);

  await page.reload({ waitUntil: 'commit' });
  for (const [label, at] of [
    ['a-350ms', 350],
    ['b-900ms', 550],
    ['c-1500ms', 600],
    ['d-2000ms', 500],
    ['e-2350ms', 350],
  ]) {
    await wait(at);
    await shot(`load-${label}`);
  }

  await page.waitForSelector('header', { timeout: 20000 });
  await wait(2200);
  await shot('0-home');

  // Work stage
  await page.keyboard.press('ArrowDown');
  await wait(1800);
  await shot('1-work');

  // Scroll the panel to see all four cards
  const scroller = page.locator('[data-scroller]').first();
  await scroller.hover();
  await page.mouse.wheel(0, 700);
  await wait(700);
  await shot('1-work-scrolled');
  await page.mouse.wheel(0, 1100);
  await wait(700);
  await shot('1-work-bottom');

  // Proof viewer — image proof sits at the bottom, so take it first
  const image = page.getByRole('button', { name: /View the screenshot/i }).first();
  if (await image.count()) {
    await image.click();
    await wait(1300);
    await shot('3-proof-image');
    await page.keyboard.press('Escape');
    await wait(700);
  } else {
    problems.push(`[${vp.name}] could not find the Kena proof button`);
  }

  await scroller.hover();
  await page.mouse.wheel(0, -3000);
  await wait(800);
  const video = page.getByRole('button', { name: /Watch the demo/i }).first();
  if (await video.count()) {
    await video.click();
    await wait(1300);
    await shot('2-proof-video');
    await page.keyboard.press('Escape');
    await wait(700);
  } else {
    problems.push(`[${vp.name}] could not find a video proof button`);
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
console.log(`\nScreenshots → ${OUT}/`);
