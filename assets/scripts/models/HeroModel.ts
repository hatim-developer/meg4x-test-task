import { IHero } from "../common/types";

export default class HeroModel implements IHero {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public cost: number,
    public summonCoolDown: number,
    public type: string,
    public rank: string
  ) {}
}
