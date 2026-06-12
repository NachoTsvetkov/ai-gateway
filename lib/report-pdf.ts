/**
 * Render report HTML to PDF (attachment for Gmail delivery).
 */

export async function renderReportPdf(html: string): Promise<Buffer> {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    const chromium = await import('@sparticuz/chromium-min');
    const puppeteer = await import('puppeteer-core');
    const executablePath = await chromium.default.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar',
    );
    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      executablePath,
      headless: true,
    });
    try {
      return await htmlToPdfBuffer(browser, html);
    } finally {
      await browser.close();
    }
  }

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    return await htmlToPdfBuffer(browser, html);
  } finally {
    await browser.close();
  }
}

async function htmlToPdfBuffer(browser: { newPage(): Promise<PuppeteerPage> }, html: string): Promise<Buffer> {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '16mm', bottom: '20mm', left: '16mm' },
  });
  return Buffer.from(pdf);
}

type PuppeteerPage = {
  setContent(html: string, opts: { waitUntil: 'load' | 'domcontentloaded' }): Promise<void>;
  pdf(opts: {
    format: 'A4';
    printBackground: boolean;
    margin: { top: string; right: string; bottom: string; left: string };
  }): Promise<Uint8Array>;
};
