import type {
  Agent,
  Anomaly,
  Bangboo,
  DeadlyAssault,
  DriveDisc,
  WEngine,
} from "./types"
import agentsData from "../data/agents.json"
import anomaliesData from "../data/anomalies.json"
import bangboosData from "../data/bangboos.json"
import deadlyAssaultsData from "../data/deadly-assaults.json"
import driveDiscsData from "../data/drive-discs.json"
import wEnginesData from "../data/w-engines.json"

export * from "./constants"
export * from "./types"

export const agents: Agent[] = agentsData.agents
export const anomalies: Anomaly[] = anomaliesData.anomalies
export const bangboos: Bangboo[] = bangboosData.bangboos
export const deadlyAssaults: DeadlyAssault[] = deadlyAssaultsData.deadlyAssaults
export const driveDiscs: DriveDisc[] = driveDiscsData.driveDiscs
export const wEngines: WEngine[] = wEnginesData.wEngines
