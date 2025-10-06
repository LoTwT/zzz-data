export interface Agent {
  name: string
  id: number
  enName: string
  attribute: string
  specialty: string
  attackType: string
  faction: string
  assistType: string
  critRate: number
  critDamage: number
  impact: number
  anomalyMastery: number
  energyLimit: number
  energyRegen: number
  anomalyProficiency: number
  hp: number
  atk: number
  def: number

  avatar: string
  sprite: string
  rarity: string
  rarityIcon: string
  attributeIcon: string
  specialtyIcon: string
  attackTypeIcon: string
  factionIcon: string
}
