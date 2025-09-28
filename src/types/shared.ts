import type { ATTACK_TYPES, ATTRIBUTES, SPECIALTIES } from "../constants"

export type Attribute = (typeof ATTRIBUTES)[keyof typeof ATTRIBUTES]

export type Specialty = (typeof SPECIALTIES)[keyof typeof SPECIALTIES]

export type AttackType = (typeof ATTACK_TYPES)[keyof typeof ATTACK_TYPES]
