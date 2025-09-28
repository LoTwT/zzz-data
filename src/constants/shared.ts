// 属性
export const ATTRIBUTES = {
  ELECTRIC: "electric", // 电
  ETHER: "ether", // 以太
  FIRE: "fire", // 火
  ICE: "ice", // 冰
  PHYSICAL: "physical", // 物理
  AURIC_INK: "auric ink", // 玄墨
  FROST: "frost", // 烈霜
} as const

// 特性
export const SPECIALTIES = {
  ATTACK: "attack", // 强攻
  STUN: "stun", // 击破
  ANOMALY: "anomaly", // 异常
  SUPPORT: "support", // 支援
  DEFENSE: "defense", // 防护
  RUPTURE: "rupture", // 命破
} as const

// 进攻类型
export const ATTACK_TYPES = {
  SLASH: "slash", // 斩击
  STRIKE: "strike", // 打击
  PIERCE: "pierce", // 穿透
} as const

export const FACTIONS = {
  YUNKUI_SUMMIT: "Yunkui Summit", // 云岿山
  STARS_OF_LYRA: "Stars of Lyra", // 天琴座
  HOLLOW_SPECIAL_OPERATIONS_SECTION_6: "Hollow Special Operations Section 6", // 对空洞特别行动部第六课
  SPOOK_SHACK: "Spook Shack", // 怪啖屋
  CRIMINAL_INVESTIGATION_SPECIAL_RESPONSE_TEAM:
    "Criminal Investigation Special Response Team", // 刑侦特勤组
  DEFENSE_FORCE_OBOL_SQUAD: "Defense Force - Obol Squad", // 防卫军 · 奥波勒斯小队
  DEFENSE_FORCE_SILVER_SQUAD: "Defense Force - Silver Squad", // 防卫军 · 白银小队
  SONS_OF_CALYDON: "Sons of Calydon", // 卡吕冬之子
  VICTORIA_HOUSEKEEPING_CO: "Victoria Housekeeping Co.", // 维多利亚家政
  CUNNING_HARES: "Cunning Hares", // 狡兔雾
  BELOBOG_HEAVY_INDUSTRIES: "Belobog Heavy Industries", // 白祇重工
  MOCKINGBIRD: "Mockingbird", // 反舌鸟
} as const
