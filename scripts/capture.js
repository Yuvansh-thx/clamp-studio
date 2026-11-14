import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import ffmpegPath from 'ffmpeg-static';

const BRAVE_PATH = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const URL = 'http://localhost:5175';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('--- Launching Browser for High-Res Screenshots ---');
  const browser = await chromium.launch({
    executablePath: BRAVE_PATH,
    headless: true,
  });

  // 1. DESKTOP SCREENSHOTS (Retina 2x, 1440x900)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1500);

  console.log('Capturing: 01-hero-keychain.png');
  await page.screenshot({ path: 'docs/screenshots/01-hero-keychain.png' });

  console.log('Capturing: 02-spec-dossier.png');
  await page.evaluate(() => document.getElementById('dossier')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(1000);
  await page.screenshot({ path: 'docs/screenshots/02-spec-dossier.png' });

  console.log('Capturing: 03-featured-works-tabs.png');
  await page.evaluate(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(1000);
  await page.screenshot({ path: 'docs/screenshots/03-featured-works-tabs.png' });

  console.log('Capturing: 04-spec-inspector-drawer.png');
  // Click first inspect button
  await page.click('.btn-inspect-spec');
  await sleep(1000);
  await page.screenshot({ path: 'docs/screenshots/04-spec-inspector-drawer.png' });
  // Close drawer
  await page.click('#drawerCloseBtn');
  await sleep(500);

  console.log('Capturing: 05-archival-grid.png');
  await page.evaluate(() => document.getElementById('archive')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(1000);
  await page.screenshot({ path: 'docs/screenshots/05-archival-grid.png' });

  console.log('Capturing: 06-lightbox-preview.png');
  // Click first archive card to open modal lightbox
  await page.click('.archive-card:first-child');
  await sleep(1000);
  await page.screenshot({ path: 'docs/screenshots/06-lightbox-preview.png' });
  // Close lightbox
  await page.click('#lightboxCloseBtn');
  await sleep(500);

  await context.close();

  // 2. MOBILE RESPONSIVE SCREENSHOT (iPhone 14/15 390x844, 2x)
  console.log('Capturing: 07-responsive-mobile.png');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1500);
  await mobilePage.screenshot({ path: 'docs/screenshots/07-responsive-mobile.png' });
  await mobileContext.close();

  // 3. RECORDING INTERACTIVE WALKTHROUGH VIDEO
  console.log('--- Recording Interactive Walkthrough Video ---');
  const tempVideoDir = path.resolve('docs/videos/temp');
  if (!fs.existsSync(tempVideoDir)) {
    fs.mkdirSync(tempVideoDir, { recursive: true });
  }

  const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1280, height: 720 },
    },
  });
  const videoPage = await videoContext.newPage();
  await videoPage.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1200);

  // A. Interact with the keychain charms (swing and drag)
  console.log('Video action: dragging keychain charms');
  const charm1 = await videoPage.$('#charm-motion');
  if (charm1) {
    const box = await charm1.boundingBox();
    if (box) {
      await videoPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await videoPage.mouse.down();
      // drag to the right
      await videoPage.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2 + 30, { steps: 20 });
      await sleep(400);
      await videoPage.mouse.up();
      await sleep(1000);
    }
  }

  const charm2 = await videoPage.$('#charm-3dtech');
  if (charm2) {
    const box = await charm2.boundingBox();
    if (box) {
      await videoPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await videoPage.mouse.down();
      // drag to the left and up
      await videoPage.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2 - 40, { steps: 20 });
      await sleep(400);
      await videoPage.mouse.up();
      await sleep(1200);
    }
  }

  // B. Scroll smoothly to Dossier
  console.log('Video action: Dossier section');
  await videoPage.evaluate(() => {
    document.getElementById('dossier')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(2200);

  // Hover over dossier pills
  const pills = await videoPage.$$('.d-pill');
  if (pills.length > 2) {
    await pills[1].hover();
    await sleep(600);
    await pills[2].hover();
    await sleep(600);
    await pills[0].hover();
    await sleep(600);
  }

  // C. Scroll to Featured Projects
  console.log('Video action: Featured section tabs');
  await videoPage.evaluate(() => {
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(1800);

  // Switch folder tabs
  const tabs = await videoPage.$$('.folder-tab');
  if (tabs.length >= 3) {
    await tabs[1].click();
    await sleep(1500);
    await tabs[2].click();
    await sleep(1500);
    await tabs[0].click();
    await sleep(1200);
  }

  // Switch view mode pills
  console.log('Video action: Switch view mode and thumbnails');
  const viewPills = await videoPage.$$('.view-mode-pill');
  if (viewPills.length >= 2) {
    await viewPills[1].click(); // Turntable video or wire
    await sleep(1800);
    await viewPills[0].click(); // Back to still
    await sleep(800);
  }

  // Open Spec Inspector Drawer
  console.log('Video action: Spec Drawer');
  await videoPage.click('.btn-inspect-spec');
  await sleep(1800);
  await videoPage.click('#drawerCloseBtn');
  await sleep(1000);

  // D. Scroll to Archive Section
  console.log('Video action: Archive grid and filter');
  await videoPage.evaluate(() => {
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(1800);

  // Filter clicks
  const filters = await videoPage.$$('.filter-btn');
  if (filters.length >= 3) {
    await filters[1].click(); // 3D & Motion
    await sleep(1200);
    await filters[2].click(); // Branding
    await sleep(1200);
    await filters[0].click(); // All
    await sleep(1200);
  }

  // Open Lightbox
  console.log('Video action: Open Lightbox modal');
  await videoPage.click('.archive-card:first-child');
  await sleep(1500);

  // Next image in lightbox
  const nextBtn = await videoPage.$('#lightboxNextBtn');
  if (nextBtn) {
    await nextBtn.click();
    await sleep(1200);
    await nextBtn.click();
    await sleep(1200);
  }
  await videoPage.click('#lightboxCloseBtn');
  await sleep(1500);

  // Close context to finalize video
  console.log('Closing video context to write recording...');
  const videoObj = videoPage.video();
  await videoPage.close();
  await videoContext.close();
  const recordedVideoPath = await videoObj.path();
  console.log('Raw video saved to:', recordedVideoPath);

  await browser.close();

  // 4. CONVERT RAW VIDEO WITH FFMPEG
  console.log('--- Processing Video with ffmpeg ---');
  const targetMp4 = path.resolve('docs/videos/clamp-studio-demo.mp4');
  const targetWebm = path.resolve('docs/videos/clamp-studio-demo.webm');
  const targetGif = path.resolve('docs/videos/clamp-studio-demo.gif');

  // Copy/rename to docs/videos/clamp-studio-demo.webm
  fs.copyFileSync(recordedVideoPath, targetWebm);
  console.log('Saved webm to:', targetWebm);

  // Encode to H.264 MP4 (faststart for instant web streaming)
  console.log('Encoding MP4...');
  execFileSync(ffmpegPath, [
    '-y',
    '-i', targetWebm,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    targetMp4
  ], { stdio: 'inherit' });
  console.log('MP4 created successfully:', targetMp4);

  // Generate high quality animated GIF with two-pass palettegen/paletteuse
  console.log('Generating high quality animated GIF for GitHub README...');
  // Scale to 720 width, 18 fps for smooth playback and reasonable file size
  const palettePath = path.resolve('docs/videos/palette.png');
  execFileSync(ffmpegPath, [
    '-y',
    '-i', targetMp4,
    '-vf', 'fps=15,scale=720:-1:flags=lanczos,palettegen=stats_mode=diff',
    palettePath
  ], { stdio: 'inherit' });

  execFileSync(ffmpegPath, [
    '-y',
    '-i', targetMp4,
    '-i', palettePath,
    '-lavfi', 'fps=15,scale=720:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5',
    targetGif
  ], { stdio: 'inherit' });

  if (fs.existsSync(palettePath)) fs.unlinkSync(palettePath);
  if (fs.existsSync(tempVideoDir)) fs.rmSync(tempVideoDir, { recursive: true, force: true });

  console.log('Animated GIF created successfully:', targetGif);
  console.log('ALL SCREENSHOTS AND VIDEOS PRODUCED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
