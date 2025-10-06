import type { Page } from "puppeteer"

export class PagePool {
  private available: Page[] = []
  private inUse = new Set<Page>()

  constructor(private pages: Page[]) {
    this.available = [...pages]
  }

  async acquire(): Promise<Page> {
    while (this.available.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    const page = this.available.pop()!
    this.inUse.add(page)
    return page
  }

  release(page: Page) {
    this.inUse.delete(page)
    this.available.push(page)
  }

  async closeAll() {
    await Promise.all(this.pages.map((p) => p.close()))
  }
}
