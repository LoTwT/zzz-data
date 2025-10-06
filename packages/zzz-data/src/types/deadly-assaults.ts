export interface DeadlyAssault {
  id: number
  period: string
  enemies: DeadlyAssaultEnemy[]
  buffs: DeadlyAssaultBuff[]
}

export interface DeadlyAssaultEnemy {
  id: number
  avatar: string
  details: string[]
  hp: number
  atk: number
  def: number
  resistance: DeadlyAssaultEnemyResistance
  anomalyIds: DeadlyAssaultEnemyAnomalyIds
}

export interface DeadlyAssaultBuff {
  name: string
  effect: string
}

export interface DeadlyAssaultEnemyResistance {
  damage: DeadlyAssaultEnemyResistanceValue
  anomalyBuildup: DeadlyAssaultEnemyResistanceValue
  daze: DeadlyAssaultEnemyResistanceValue
}

export interface DeadlyAssaultEnemyResistanceValue {
  ice: number
  fire: number
  electric: number
  physical: number
  ether: number
}

export interface DeadlyAssaultEnemyAnomalyIds {
  ice: number
  fire: number
  electric: number
  physical: number
  ether: number
}
