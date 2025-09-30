import type { Browser, Page } from "puppeteer"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath, URL } from "node:url"
import * as cheerio from "cheerio"
import pLimit from "p-limit"
import puppeteer from "puppeteer"
import { FACTIONS_MAP } from "./constants"
import { PagePool } from "./page-pool"
import { toCamelCase } from "./utils"

const HAKUSH_URL = "https://zzz3.hakush.in"
const AGENTS_PAGE_URL = `${HAKUSH_URL}/character`

const _dirname = fileURLToPath(new URL(".", import.meta.url))
const commonDataPath = resolve(_dirname, "../../src/data/hakush/common.json")
const agentsDataPath = resolve(_dirname, "../../src/data/hakush/agents.json")

async function scrape() {
  console.log("Starting scraper...")
  const browser = await puppeteer.launch()
  const limit = pLimit(5)

  const { commonImages, agents, agentIds } = await scrapeAgents(browser)
  console.log(`Found ${agentIds.length} agents`)

  const pages = await Promise.all(
    Array.from({ length: 5 }, () => browser.newPage()),
  )
  const pagePool = new PagePool(pages)

  const agentDetailTasks = agentIds.map((agentId) =>
    limit(async () => {
      const page = await pagePool.acquire()
      try {
        return await scrapeAgentDetail(page, agentId)
      } finally {
        pagePool.release(page)
      }
    }),
  )

  const agentDetails = await Promise.all(agentDetailTasks)
  console.log("Scraped all agent details")

  await pagePool.closeAll()

  for (const detail of agentDetails) {
    if (detail && detail.agentId) {
      agents[detail.agentId] = {
        ...agents[detail.agentId],
        ...detail.data,
      }
    }
  }

  await mkdir(dirname(commonDataPath), { recursive: true })
  await writeFile(commonDataPath, `${JSON.stringify(commonImages, null, 2)}\n`)

  await mkdir(dirname(agentsDataPath), { recursive: true })
  await writeFile(agentsDataPath, `${JSON.stringify(agents, null, 2)}\n`)

  await browser.close()
  console.log("Done!")
}

async function scrapeAgents(browser: Browser) {
  const page = await browser.newPage()
  await page.goto(AGENTS_PAGE_URL, {
    timeout: 60000,
    waitUntil: "networkidle2",
  })
  const html = await page.content()

  const $ = cheerio.load(html)

  const commonImages: Record<string, string> = {}
  const filtersDiv = $("div#search-input-cont").next().next()

  filtersDiv.children().each((_, elem) => {
    const originId = $(elem).attr("id")
    if (originId) {
      const id = originId.replace("filter-", "").replace("IconCamp", "")
      const imageUrl = $(elem).find("img").attr("src")
      if (imageUrl) {
        const key = id in FACTIONS_MAP ? FACTIONS_MAP[id] : toCamelCase(id)
        commonImages[key] = imageUrl
      }
    }
  })

  commonImages[FACTIONS_MAP.SilverSquad] =
    "https://api.hakush.in/zzz/UI/IconCampSilvers.webp"

  const agents: Record<number, Record<string, any>> = {}
  const agentIds: number[] = []
  const agentsDiv = filtersDiv.next()
  agentsDiv.children().each((_, elem) => {
    const href = $(elem).attr("href")
    if (href) {
      const agentId = Number.parseInt(href.split("/").pop()!)
      agentIds.push(agentId)
      const imageUrl = $(elem).find("img.avatar-icon-front").attr("src")

      if (imageUrl) {
        agents[agentId] = {
          avatar: imageUrl,
        }
      }

      const miyabiAndYixuanIds = [1091, 1371]
      if (miyabiAndYixuanIds.includes(agentId)) {
        const attributeImageUrl = $(elem).find("img").last().attr("src")

        if (attributeImageUrl) {
          const key = agentId === 1091 ? "frost" : "auricInk"
          commonImages[key] = attributeImageUrl
        }
      }
    }
  })

  await page.close()

  return { commonImages, agents, agentIds }
}

async function scrapeAgentDetail(page: Page, agentId: number) {
  const agentUrl = `${HAKUSH_URL}/character/${agentId}`

  await page.goto(agentUrl, {
    timeout: 60000,
    waitUntil: "networkidle2",
  })
  const html = await page.content()
  const $ = cheerio.load(html)

  const backgroundImageDiv = $("div.char-background-image")
  const style = backgroundImageDiv.attr("style")

  let backgroundImageUrl: string | null = null
  if (style) {
    const match = style.match(/background-image:\s*url\(['"]?([^'"()]+)['"]?\)/)
    backgroundImageUrl = match ? match[1] : null
  }

  return {
    agentId,
    data: {
      sprite: backgroundImageUrl,
    },
  }
}

scrape()
