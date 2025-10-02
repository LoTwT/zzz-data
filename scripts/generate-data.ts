import type { CellFormulaValue, CellValue } from "exceljs"
import type { Agent, WEngine } from "@/types"
import type { Bangboo } from "@/types/bangboos"
import type { DriveDisc } from "@/types/drive-discs"
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import exceljs from "exceljs"

const { Workbook } = exceljs

const _dirname = fileURLToPath(new URL(".", import.meta.url))

const workbook = new Workbook()

const agentJsonPath = resolve(_dirname, "../src/data/agents.json")
const wEngineJsonPath = resolve(_dirname, "../src/data/w-engines.json")
const bangboosJsonPath = resolve(_dirname, "../src/data/bangboos.json")
const driveDiscsJsonPath = resolve(_dirname, "../src/data/drive-discs.json")

const hakushAgentJsonPath = resolve(_dirname, "../src/data/hakush/agents.json")
const hakushBangbooJsonPath = resolve(
  _dirname,
  "../src/data/hakush/bangboos.json",
)
const hakushCommonJsonPath = resolve(_dirname, "../src/data/hakush/common.json")

const attributeKeyMap: Record<string, string> = {
  电: "electric",
  物理: "physical",
  以太: "ether",
  火: "fire",
  冰: "ice",
  烈霜: "frost",
  玄墨: "auricInk",
}

const specialtyKeyMap: Record<string, string> = {
  强攻: "attack",
  击破: "stun",
  异常: "anomaly",
  支援: "support",
  防护: "defense",
  命破: "rupture",
}

const attackTypeKeyMap: Record<string, string> = {
  斩击: "slash",
  打击: "strike",
  穿透: "pierce",
}

const factionKeyMap: Record<string, string> = {
  狡兔屋: "cunningHares",
  维多利亚家政: "victoriaHousekeepingCo",
  白祈重工: "belobogHeavyIndustries",
  卡吕冬之子: "sonsOfCalydon",
  新艾利都防卫军: "defenseForceSilverSquad",
  对空洞特别行动部第六课: "hollowSpecialOperationsSection6",
  刑侦特勤组: "criminalInvestigationSpecialResponseTeam",
  天琴座: "starsOfLyra",
  反舌鸟: "mockingbird",
  云岿山: "yunkuiSummit",
  怪啖屋: "spookShack",
}

let hakushCommonDataCache: HakushCommonData | null = null

async function getHakushCommonData(): Promise<HakushCommonData> {
  if (hakushCommonDataCache) {
    return hakushCommonDataCache
  }

  const raw = await readFile(hakushCommonJsonPath, "utf-8")
  hakushCommonDataCache = JSON.parse(raw) as HakushCommonData

  return hakushCommonDataCache
}

async function generateData() {
  await workbook.xlsx.readFile(resolve(_dirname, "../data.xlsx"))

  const tasks = [
    processAgents(),
    processWEngines(),
    processBangboos(),
    processDriveDiscs(),
  ]

  await Promise.all(tasks)
}

async function processAgents() {
  const agents = await parseAgents()

  const agentsJson = {
    agents,
  }

  await writeFile(agentJsonPath, `${JSON.stringify(agentsJson, null, 2)}\n`)
}

async function parseAgents() {
  const sheet = workbook.getWorksheet("代理人属性")
  const excludeIds = [2011, 2021]

  const agents: Agent[] = []
  const hakushAgentsRaw = await readFile(hakushAgentJsonPath, "utf-8")
  const hakushAgents = JSON.parse(hakushAgentsRaw) as Record<
    string,
    {
      avatar: string
      sprite: string
      rarity: string
    }
  >
  const hakushCommonData = await getHakushCommonData()

  sheet?.eachRow((row, rowNumber) => {
    // 代理人
    const name = row.getCell("A").value as string
    const id = row.getCell("B").value as number

    if (name && id && !excludeIds.includes(id) && rowNumber > 1) {
      // name
      const enName = row.getCell("C").value as string
      // 属性
      const attribute = row.getCell("D").value as string
      // 特性
      const specialty = row.getCell("E").value as string
      // 进攻类型
      const attackType = row.getCell("F").value as string
      // 阵营
      const faction = row.getCell("G").value as string
      // 支援类型
      const assistType = row.getCell("H").value as string
      // 暴击率
      const critRate = row.getCell("O").value as number
      // 暴击伤害
      const critDamage = row.getCell("P").value as number
      // 冲击力
      const impact = row.getCell("Q").value as number
      // 异常掌控
      const anomalyMastery = row.getCell("R").value as number
      // 能量上限（闪能上限）
      const enegyLimit = row.getCell("S").value as number
      // 能量自动回复（闪能自动累积）
      const enegyRegen = row.getCell("T").value as number
      // 异常精通
      const anomalyProficiency = row.getCell("U").value as number
      // 60级基础生命值
      const hp = row.getCell("Z").value as number
      // 60级基础攻击力
      const atk = row.getCell("AA").value as number
      // 60级基础防御力
      const def = row.getCell("AB").value as number

      const hakushAgentData = hakushAgents[id.toString()]
      const rarity = hakushAgentData?.rarity ?? ""
      const rarityIcon = getAgentRarityIcon(hakushCommonData, rarity)
      const attributeIcon = getAttributeIcon(hakushCommonData, attribute)
      const specialtyIcon = getSpecialtyIcon(hakushCommonData, specialty)
      const attackTypeIcon = getAttackTypeIcon(hakushCommonData, attackType)
      const factionIcon = getFactionIcon(hakushCommonData, faction)

      agents.push({
        name,
        id,
        enName,
        attribute,
        specialty,
        attackType,
        faction,
        assistType,
        critRate,
        critDamage,
        impact,
        anomalyMastery,
        enegyLimit,
        enegyRegen,
        anomalyProficiency,
        hp,
        atk,
        def,
        avatar: hakushAgentData?.avatar ?? "",
        sprite: hakushAgentData?.sprite ?? "",
        rarity,
        rarityIcon,
        attributeIcon,
        specialtyIcon,
        attackTypeIcon,
        factionIcon,
      })
    }
  })

  return agents
}

async function processWEngines() {
  const wEngines = await parseWEngines()

  const wEnginesJson = {
    wEngines,
  }

  await writeFile(wEngineJsonPath, `${JSON.stringify(wEnginesJson, null, 2)}\n`)
}

async function parseWEngines() {
  const sheet = workbook.getWorksheet("音擎属性")

  const wEngines: WEngine[] = []

  sheet?.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const name = row.getCell("A").value as string
      const id = row.getCell("B").value as number
      const rank = row.getCell("C").value as string
      const specialty = row.getCell("D").value as string
      const atk = normalizeNumericValue(row.getCell("F").value)
      const advancedStat = row.getCell("G").value as string
      const advancedStatValue = normalizeNumericValue(row.getCell("I").value)

      wEngines.push({
        name,
        id,
        rank,
        specialty,
        atk,
        advancedStat,
        advancedStatValue,
      })
    }
  })

  return wEngines
}

async function processBangboos() {
  const bangboos = await parseBangboos()

  const bangboosJson = {
    bangboos,
  }

  await writeFile(
    bangboosJsonPath,
    `${JSON.stringify(bangboosJson, null, 2)}\n`,
  )
}

async function parseBangboos() {
  const sheet = workbook.getWorksheet("邦布属性")
  const excludeIds = [50001, 55001]

  const bangboos: Bangboo[] = []
  const hakushBangboosRaw = await readFile(hakushBangbooJsonPath, "utf-8")
  const hakushBangboos = JSON.parse(hakushBangboosRaw) as Record<
    string,
    {
      avatar: string
      sprite: string
      rarity: string
    }
  >
  const hakushCommonData = await getHakushCommonData()

  sheet?.eachRow((row, rowNumber) => {
    const id = row.getCell("B").value as number

    if (rowNumber > 1 && !excludeIds.includes(id)) {
      const name = row.getCell("A").value as string
      const impact = row.getCell("G").value as number
      const anomalyMastery = row.getCell("H").value as number
      const hp = normalizeNumericValue(row.getCell("P").value)
      const atk = normalizeNumericValue(row.getCell("Q").value)
      const def = normalizeNumericValue(row.getCell("R").value)
      const critRate = row.getCell("S").value as number
      const critDamage = row.getCell("T").value as number

      const hakushBangbooData = hakushBangboos[id.toString()]
      const rarity = hakushBangbooData?.rarity ?? ""
      const rarityIcon = getBangbooRarityIcon(hakushCommonData, rarity)

      bangboos.push({
        name,
        id,
        impact,
        anomalyMastery,
        hp,
        atk,
        def,
        critRate,
        critDamage,
        avatar: hakushBangbooData?.avatar ?? "",
        sprite: hakushBangbooData?.sprite ?? "",
        rarity,
        rarityIcon,
      })
    }
  })

  return bangboos
}

async function processDriveDiscs() {
  const driveDiscs = await parseDriveDiscs()

  const driveDiscsJson = {
    driveDiscs,
  }

  await writeFile(
    driveDiscsJsonPath,
    `${JSON.stringify(driveDiscsJson, null, 2)}\n`,
  )
}

async function parseDriveDiscs() {
  const sheet = workbook.getWorksheet("驱动盘描述")

  const driveDiscs: DriveDisc[] = []

  sheet?.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const id = row.getCell("A").value as number
      const name = row.getCell("B").value as string
      const twoPieceBonus = row.getCell("C").value as string
      const fourPieceBonus = row.getCell("D").value as string

      if (id && name) {
        driveDiscs.push({
          id,
          name,
          twoPieceBonus: twoPieceBonus || "",
          fourPieceBonus: fourPieceBonus || "",
        })
      }
    }
  })

  return driveDiscs
}

function getAttributeIcon(
  commonData: HakushCommonData,
  attribute: string,
): string {
  if (!attribute) {
    return ""
  }

  const key = attributeKeyMap[attribute]
  if (!key) {
    return ""
  }

  const attributes: Record<string, string> = commonData.attributes ?? {}

  return attributes[key] ?? ""
}

function getSpecialtyIcon(
  commonData: HakushCommonData,
  specialty: string,
): string {
  if (!specialty) {
    return ""
  }

  const key = specialtyKeyMap[specialty]
  if (!key) {
    return ""
  }

  const specialties: Record<string, string> = commonData.specialties ?? {}

  return specialties[key] ?? ""
}

function getAttackTypeIcon(
  commonData: HakushCommonData,
  attackType: string,
): string {
  if (!attackType) {
    return ""
  }

  const normalizedKey = normalizeAttackTypeKey(attackType)
  if (!normalizedKey) {
    return ""
  }

  const attackTypes: Record<string, string> = commonData.attackTypes ?? {}

  return attackTypes[normalizedKey] ?? ""
}

function getFactionIcon(commonData: HakushCommonData, faction: string): string {
  if (!faction) {
    return ""
  }

  const key = factionKeyMap[faction]
  if (!key) {
    return ""
  }

  const factions: Record<string, string> = commonData.factions ?? {}

  return factions[key] ?? ""
}

function getBangbooRarityIcon(
  commonData: HakushCommonData,
  rarity: string,
): string {
  if (!rarity) {
    return ""
  }

  const rarities: Record<string, string> = commonData.rarities ?? {}
  const key = `bangbooRarity${rarity.toUpperCase()}`

  return rarities[key] ?? ""
}

function getAgentRarityIcon(
  commonData: HakushCommonData,
  rarity: string,
): string {
  if (!rarity) {
    return ""
  }

  const rarities: Record<string, string> = commonData.rarities ?? {}
  const key = `agentRarity${rarity.toUpperCase()}`

  return rarities[key] ?? ""
}

function normalizeAttackTypeKey(attackType: string): string | undefined {
  const candidates = attackType
    .split(/[,，]/)
    .map((value) => value.trim())
    .filter(Boolean)

  for (const candidate of candidates) {
    const key = attackTypeKeyMap[candidate]
    if (key) {
      return key
    }
  }

  return undefined
}

generateData()

function normalizeNumericValue(value: CellValue | undefined): number {
  if (typeof value === "number") {
    return value
  }

  if (
    value &&
    typeof value === "object" &&
    "result" in value &&
    typeof (value as CellFormulaValue).result === "number"
  ) {
    const formulaValue = value as CellFormulaValue
    const { result } = formulaValue

    if (typeof result === "number") {
      return result
    }
  }

  return 0
}

interface HakushCommonData {
  rarities?: Record<string, string>
  attributes?: Record<string, string>
  specialties?: Record<string, string>
  attackTypes?: Record<string, string>
  factions?: Record<string, string>
  [key: string]: unknown
}
