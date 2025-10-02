import type { Browser, Page } from "puppeteer"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath, URL } from "node:url"
import * as cheerio from "cheerio"
import pLimit from "p-limit"
import puppeteer from "puppeteer"
import {
  ATTACK_TYPES,
  ATTRIBUTES,
  SPECIALTIES,
} from "../../src/constants/shared"
import { FACTIONS_MAP } from "./constants"
import { PagePool } from "./page-pool"
import { toCamelCase } from "./utils"

const HAKUSH_URL = "https://zzz3.hakush.in"
const AGENTS_PAGE_URL = `${HAKUSH_URL}/character`
const BANGBOOS_PAGE_URL = `${HAKUSH_URL}/bangboo`
const W_ENGINES_PAGE_URL = `${HAKUSH_URL}/weapon`
const DRIVE_DISCS_PAGE_URL = `${HAKUSH_URL}/equipment`

const NAVIGATION_OPTIONS = {
  timeout: 60000,
  waitUntil: "networkidle2" as const,
}

const _dirname = fileURLToPath(new URL(".", import.meta.url))
const commonDataPath = resolve(_dirname, "../../src/data/hakush/common.json")
const agentsDataPath = resolve(_dirname, "../../src/data/hakush/agents.json")
const bangboosDataPath = resolve(
  _dirname,
  "../../src/data/hakush/bangboos.json",
)
const wEnginesDataPath = resolve(
  _dirname,
  "../../src/data/hakush/w-engines.json",
)
const driveDiscsDataPath = resolve(
  _dirname,
  "../../src/data/hakush/drive-discs.json",
)

async function scrape() {
  console.log("Starting scraper...")
  const browser = await puppeteer.launch()
  const limit = pLimit(5)

  const commonImages: Record<string, Record<string, string>> = {
    factions: {},
    attributes: {},
    ranks: {},
    specialties: {},
    attackTypes: {},
  }

  console.log(
    "Fetching listing pages for agents, bangboos, W-Engines, and Drive Discs...",
  )
  const [
    { agents, agentIds },
    { bangboos, bangbooIds },
    { wEngines, wEngineIds },
    { driveDiscs, driveDiscIds },
  ] = await Promise.all([
    scrapeAgents(browser, commonImages),
    scrapeBangboos(browser),
    scrapeWEngines(browser),
    scrapeDriveDiscs(browser),
  ])

  processCommonImages(commonImages)
  console.log(`Found ${agentIds.length} agents`)
  console.log(`Found ${bangbooIds.length} bangboos`)
  console.log(`Found ${wEngineIds.length} W-Engines`)
  console.log(`Found ${driveDiscIds.length} Drive Discs`)

  console.log("Preparing page pool for detail scraping...")
  const pages = await Promise.all(
    Array.from({ length: 5 }, () => browser.newPage()),
  )
  const pagePool = new PagePool(pages)

  console.log(
    "Scraping detail pages for agents, bangboos, W-Engines, and Drive Discs...",
  )

  const detailTasks: Array<Promise<DetailResult>> = [
    ...agentIds.map((agentId) =>
      limit(async () => {
        const page = await pagePool.acquire()
        try {
          const result = await scrapeAgentDetail(page, agentId)
          return { type: "agent" as const, result }
        } finally {
          pagePool.release(page)
        }
      }),
    ),
    ...bangbooIds.map((bangbooId) =>
      limit(async () => {
        const page = await pagePool.acquire()
        try {
          const result = await scrapeBangbooDetail(page, bangbooId)
          return { type: "bangboo" as const, result }
        } finally {
          pagePool.release(page)
        }
      }),
    ),
    ...wEngineIds.map((wEngineId) =>
      limit(async () => {
        const page = await pagePool.acquire()
        try {
          const result = await scrapeWEngineDetail(page, wEngineId)
          return { type: "wEngine" as const, result }
        } finally {
          pagePool.release(page)
        }
      }),
    ),
    ...driveDiscIds.map((driveDiscId) =>
      limit(async () => {
        const page = await pagePool.acquire()
        try {
          const result = await scrapeDriveDiscDetail(page, driveDiscId)
          return { type: "driveDisc" as const, result }
        } finally {
          pagePool.release(page)
        }
      }),
    ),
  ]

  let mergedAgentDetails = 0
  let mergedBangbooDetails = 0
  let mergedWEngineDetails = 0
  let mergedDriveDiscDetails = 0

  try {
    const detailResults = await Promise.all(detailTasks)

    for (const detail of detailResults) {
      if (detail.type === "agent") {
        const { result } = detail
        if (result && result.agentId) {
          mergedAgentDetails += 1
          agents[result.agentId] = {
            ...agents[result.agentId],
            ...result.data,
          }
        }
      } else if (detail.type === "bangboo") {
        const { result } = detail
        if (result && result.bangbooId) {
          mergedBangbooDetails += 1
          bangboos[result.bangbooId] = {
            ...bangboos[result.bangbooId],
            ...result.data,
          }
        }
      } else if (detail.type === "wEngine") {
        const { result } = detail
        if (result && result.wEngineId) {
          mergedWEngineDetails += 1
          wEngines[result.wEngineId] = {
            ...wEngines[result.wEngineId],
            ...result.data,
          }
        }
      } else {
        const { result } = detail
        if (result && result.driveDiscId) {
          mergedDriveDiscDetails += 1
          driveDiscs[result.driveDiscId] = {
            ...driveDiscs[result.driveDiscId],
            ...result.data,
          }
        }
      }
    }
  } finally {
    await pagePool.closeAll()
  }

  console.log(
    `Scraped detail pages: ${mergedAgentDetails} agents, ${mergedBangbooDetails} bangboos, ${mergedWEngineDetails} W-Engines, ${mergedDriveDiscDetails} Drive Discs`,
  )

  await mkdir(dirname(commonDataPath), { recursive: true })
  await writeFile(commonDataPath, `${JSON.stringify(commonImages, null, 2)}\n`)

  await mkdir(dirname(agentsDataPath), { recursive: true })
  await writeFile(agentsDataPath, `${JSON.stringify(agents, null, 2)}\n`)

  await mkdir(dirname(bangboosDataPath), { recursive: true })
  await writeFile(bangboosDataPath, `${JSON.stringify(bangboos, null, 2)}\n`)

  await mkdir(dirname(wEnginesDataPath), { recursive: true })
  await writeFile(wEnginesDataPath, `${JSON.stringify(wEngines, null, 2)}\n`)

  await mkdir(dirname(driveDiscsDataPath), { recursive: true })
  await writeFile(
    driveDiscsDataPath,
    `${JSON.stringify(driveDiscs, null, 2)}\n`,
  )

  await browser.close()
  console.log("Done!")
}

function processCommonImages(
  commonImages: Record<string, Record<string, string>>,
) {
  const factionImages = {
    [FACTIONS_MAP.SilverSquad]:
      "https://api.hakush.in/zzz/UI/IconCampSilvers.webp",
  }

  const rankImages = {
    agentRankS:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/d/d0/Icon_AgentRank_S.png",
    agentRankA:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/5/5c/Icon_AgentRank_A.png",
    bangbooRankS:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/7/7d/Icon_Bangboo_Rank_S.png",
    bangbooRankA:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/9/9a/Icon_Bangboo_Rank_A.png",
    itemRankS:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/b/bf/Icon_Item_Rank_S.png",
    itemRankA:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/4/45/Icon_Item_Rank_A.png",
    itemRankB:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/4/47/Icon_Item_Rank_B.png",
    itemRankC:
      "https://static.wikia.nocookie.net/zenless-zone-zero/images/3/37/Icon_Item_Rank_C.png",
  }

  commonImages.factions = {
    ...commonImages.factions,
    ...factionImages,
  }
  commonImages.ranks = rankImages

  const attributeKeys = new Set<string>(Object.values(ATTRIBUTES))
  const specialtyKeys = new Set<string>(Object.values(SPECIALTIES))
  const attackTypeKeys = new Set<string>(Object.values(ATTACK_TYPES))

  const specialtyEntries: Record<string, string> = {}
  const attackTypeEntries: Record<string, string> = {}

  for (const [key, value] of Object.entries(commonImages.attributes)) {
    if (attributeKeys.has(key)) {
      continue
    }

    delete commonImages.attributes[key]

    if (key === "attackType") {
      specialtyEntries[SPECIALTIES.ATTACK] = value
      continue
    }

    if (specialtyKeys.has(key)) {
      specialtyEntries[key] = value
      continue
    }

    if (attackTypeKeys.has(key)) {
      attackTypeEntries[key] = value
      continue
    }

    specialtyEntries[key] = value
  }

  if (Object.keys(specialtyEntries).length > 0) {
    commonImages.specialties = {
      ...commonImages.specialties,
      ...specialtyEntries,
    }
  }

  if (Object.keys(attackTypeEntries).length > 0) {
    commonImages.attackTypes = {
      ...commonImages.attackTypes,
      ...attackTypeEntries,
    }
  }
}

async function scrapeAgents(
  browser: Browser,
  commonImages: Record<string, Record<string, string>>,
) {
  const page = await browser.newPage()
  await page.goto(AGENTS_PAGE_URL, NAVIGATION_OPTIONS)
  const html = await page.content()

  const $ = cheerio.load(html)

  const filtersDiv = $("div#search-input-cont").next().next()

  filtersDiv.children().each((_, elem) => {
    const originId = $(elem).attr("id")
    if (originId) {
      const _id = originId.replace("filter-", "")
      const isFaction = _id.includes("IconCamp")
      const id = _id.replace("IconCamp", "")
      const imageUrl = $(elem).find("img").attr("src")
      if (imageUrl) {
        const key = id in FACTIONS_MAP ? FACTIONS_MAP[id] : toCamelCase(id)
        if (isFaction) {
          commonImages.factions[key] = imageUrl
        } else {
          commonImages.attributes[key] = imageUrl
        }
      }
    }
  })

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
          commonImages.attributes[key] = attributeImageUrl
        }
      }
    }
  })

  await page.close()

  return { agents, agentIds }
}

async function scrapeBangboos(browser: Browser) {
  const page = await browser.newPage()
  await page.goto(BANGBOOS_PAGE_URL, NAVIGATION_OPTIONS)

  const html = await page.content()
  const $ = cheerio.load(html)

  const bangboos: Record<number, Record<string, any>> = {}
  const bangbooIds: number[] = []
  const bangboosDiv = $("div#search-input-cont").next().next()

  bangboosDiv.children().each((_, elem) => {
    const href = $(elem).attr("href")

    if (!href) {
      return
    }

    const idSegment = href.split("/").pop()
    const bangbooId = idSegment ? Number.parseInt(idSegment, 10) : Number.NaN

    if (!Number.isFinite(bangbooId)) {
      return
    }

    bangbooIds.push(bangbooId)

    bangboos[bangbooId] = bangboos[bangbooId] || {}

    const imageUrl = $(elem).find("img.avatar-icon-front").attr("src")

    if (imageUrl) {
      bangboos[bangbooId].avatar = imageUrl
    }
  })

  await page.close()

  return { bangboos, bangbooIds }
}

async function scrapeWEngines(browser: Browser) {
  const page = await browser.newPage()
  await page.goto(W_ENGINES_PAGE_URL, NAVIGATION_OPTIONS)

  const html = await page.content()
  const $ = cheerio.load(html)

  const wEngines: Record<number, Record<string, any>> = {}
  const wEngineIds: number[] = []
  const wEnginesDiv = $("div#search-input-cont").next().next().next()

  wEnginesDiv.children().each((_, elem) => {
    const href = $(elem).attr("href")

    if (!href) {
      return
    }

    const idSegment = href.split("/").pop()
    const wEngineId = idSegment ? Number.parseInt(idSegment, 10) : Number.NaN

    if (!Number.isFinite(wEngineId)) {
      return
    }

    wEngineIds.push(wEngineId)
    wEngines[wEngineId] = wEngines[wEngineId] || {}

    const imageUrl = $(elem).find("img.avatar-icon-front").attr("src")

    if (imageUrl) {
      wEngines[wEngineId].avatar = imageUrl
    }
  })

  await page.close()

  return { wEngines, wEngineIds }
}

async function scrapeDriveDiscs(browser: Browser) {
  const page = await browser.newPage()
  await page.goto(DRIVE_DISCS_PAGE_URL, NAVIGATION_OPTIONS)

  const html = await page.content()
  const $ = cheerio.load(html)

  const driveDiscs: Record<number, Record<string, any>> = {}
  const driveDiscIds: number[] = []
  const driveDiscsDiv = $("div#search-input-cont").next()

  driveDiscsDiv.children().each((_, elem) => {
    const href = $(elem).children("a").attr("href")

    if (!href) {
      return
    }

    const idSegment = href.split("/").pop()
    const driveDiscId = idSegment ? Number.parseInt(idSegment, 10) : Number.NaN

    if (!Number.isFinite(driveDiscId)) {
      return
    }

    driveDiscIds.push(driveDiscId)
    driveDiscs[driveDiscId] = driveDiscs[driveDiscId] || {}

    const imageUrl = $(elem).find("img.avatar-icon-front").attr("src")

    if (imageUrl) {
      driveDiscs[driveDiscId].avatar = imageUrl
    }
  })

  await page.close()

  return { driveDiscs, driveDiscIds }
}

async function scrapeAgentDetail(page: Page, agentId: number) {
  const agentUrl = `${AGENTS_PAGE_URL}/${agentId}`

  await page.goto(agentUrl, NAVIGATION_OPTIONS)
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

async function scrapeBangbooDetail(page: Page, bangbooId: number) {
  const bangbooUrl = `${BANGBOOS_PAGE_URL}/${bangbooId}`

  await page.goto(bangbooUrl, NAVIGATION_OPTIONS)

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
    bangbooId,
    data: {
      sprite: backgroundImageUrl,
    },
  }
}

async function scrapeWEngineDetail(page: Page, wEngineId: number) {
  const wEngineUrl = `${W_ENGINES_PAGE_URL}/${wEngineId}`

  await page.goto(wEngineUrl, NAVIGATION_OPTIONS)

  const html = await page.content()
  const $ = cheerio.load(html)

  const backgroundImageDiv = $("div.wep-background-image")
  const style = backgroundImageDiv.attr("style")

  let backgroundImageUrl: string | null = null
  if (style) {
    const match = style.match(/background-image:\s*url\(['"]?([^'"()]+)['"]?\)/)
    backgroundImageUrl = match ? match[1] : null
  }

  return {
    wEngineId,
    data: {
      sprite: backgroundImageUrl,
    },
  }
}

async function scrapeDriveDiscDetail(page: Page, driveDiscId: number) {
  const driveDiscUrl = `${DRIVE_DISCS_PAGE_URL}/${driveDiscId}`

  await page.goto(driveDiscUrl, NAVIGATION_OPTIONS)

  const html = await page.content()
  const $ = cheerio.load(html)

  const backgroundImageDiv = $("div.wep-background-image")
  const style = backgroundImageDiv.attr("style")

  let backgroundImageUrl: string | null = null
  if (style) {
    const match = style.match(/background-image:\s*url\(['"]?([^'"()]+)['"]?\)/)
    backgroundImageUrl = match ? match[1] : null
  }

  return {
    driveDiscId,
    data: {
      sprite: backgroundImageUrl,
    },
  }
}

scrape()

type DetailResult =
  | {
      type: "agent"
      result: Awaited<ReturnType<typeof scrapeAgentDetail>>
    }
  | {
      type: "bangboo"
      result: Awaited<ReturnType<typeof scrapeBangbooDetail>>
    }
  | {
      type: "wEngine"
      result: Awaited<ReturnType<typeof scrapeWEngineDetail>>
    }
  | {
      type: "driveDisc"
      result: Awaited<ReturnType<typeof scrapeDriveDiscDetail>>
    }
