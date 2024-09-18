import { SpriteFrame } from "cc";
export interface IPlayerInitialState {
  currency: number;
  buildings: string[];
  heroes: [];
}

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

export type TSpriteFrameDict = {
  [key in EHeroSprite]?: SpriteFrame;
};

export enum EHeroSprite {
  face,
  rank,
  type
}
