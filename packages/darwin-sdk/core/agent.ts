import { chromium, Browser, Page } from 'playwright';

export class Agent {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async start(url: string) {
        this.browser = await chromium.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.goto(url);
        console.log(`Agent started on ${url}`);
    }

    async getSnapshot(): Promise<string> {
        if (!this.page) return '';
        // Placeholder for Accessibility Tree or Snapshot String logic
        return await (this.page as any).accessibility.snapshot().then(JSON.stringify);
    }

    async stop() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
