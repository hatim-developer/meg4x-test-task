export interface IHero {
  readonly id: string;
  readonly name: string;
  description: string;
  cost: number;
  summonCoolDown: number;
  type: string;
  rank: string;
}

export interface IBuildingInfo {
  readonly id: string;
  readonly name: string;
  description: string;
  hireSlots: number;
}

export type Nullable<T> = T | null;
