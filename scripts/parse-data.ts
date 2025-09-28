import type { CellFormulaValue, CellValue } from "exceljs"
import type { Agent, WEngine } from "@/types"
import type { Bangboo } from "@/types/bangboos"
import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import exceljs from "exceljs"

const { Workbook } = exceljs

const _dirname = fileURLToPath(new URL(".", import.meta.url))

const workbook = new Workbook()

const agentJsonPath = resolve(_dirname, "../src/data/agents.json")
const wEngineJsonPath = resolve(_dirname, "../src/data/w-engines.json")
const bangboosJsonPath = resolve(_dirname, "../src/data/bangboos.json")

async function parseData() {
  await workbook.xlsx.readFile(resolve(_dirname, "../data.xlsx"))

  const tasks = [processAgents(), processWEngines(), processBangboos()]

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
      // 异常精通
      const anomalyProficiency = row.getCell("U").value as number
      // 60级基础生命值
      const hp = row.getCell("Z").value as number
      // 60级基础攻击力
      const atk = row.getCell("AA").value as number
      // 60级基础防御力
      const def = row.getCell("AB").value as number

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
        anomalyProficiency,
        hp,
        atk,
        def,
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
      })
    }
  })

  return bangboos
}

parseData()

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
