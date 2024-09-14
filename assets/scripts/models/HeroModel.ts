import { IHero } from "../common/types";

export default class HeroModel implements IHero {
  public id: string;
  public name: string;
  public description: string;
  public cost: number;
  public summonCoolDown: number;
  public type: string;
  public rank: string;

  constructor(data: IHero) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.cost = data.cost;
    this.summonCoolDown = data.summonCoolDown;
    this.type = data.type;
    this.rank = data.rank;
  }
}
