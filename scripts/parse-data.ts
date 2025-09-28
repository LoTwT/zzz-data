import type { Agent } from "@/types"
import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import exceljs from "exceljs"

const { Workbook } = exceljs

const _dirname = fileURLToPath(new URL(".", import.meta.url))

const workbook = new Workbook()

const agentJsonPath = resolve(_dirname, "../src/data/agents.json")

async function parseData() {
  await workbook.xlsx.readFile(resolve(_dirname, "../data.xlsx"))
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

  sheet?.eachRow((row) => {
    // 代理人
    const name = row.getCell("A").value as string
    const id = row.getCell("B").value as number

    if (name && id && !excludeIds.includes(id)) {
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

parseData()
