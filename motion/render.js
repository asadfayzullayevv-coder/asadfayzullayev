// Usage: node render.js            -> renders out.mp4 (with music.wav)
//        node render.js stills 1 2.6 5.5  -> PNG stills at given seconds
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30, DUR = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.logoReady);
  await page.waitForTimeout(300);

  const args = process.argv.slice(2);
  if (args[0] === 'stills') {
    for (const s of args.slice(1)) {
      await page.evaluate(t => window.renderFrame(t), parseFloat(s));
      await page.screenshot({ path: path.join(__dirname, `still_${s}.png`) });
    }
    await browser.close();
    return;
  }

  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-i', path.join(__dirname, 'music.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    path.join(__dirname, 'out.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = FPS * DUR;
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.renderFrame(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done');
})();
