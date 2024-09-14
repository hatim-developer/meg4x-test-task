import { BehaviorSubject } from "rxjs";
import HeroModel from "./HeroModel";
import { BuildingInfo } from "./BuildingInfo";

export class TowerModel {
  private buildingInfo$: BehaviorSubject<BuildingInfo | null>;
  private heroList$: BehaviorSubject<HeroModel[]>;

  constructor() {
    // * building info data
    this.buildingInfo$ = new BehaviorSubject<BuildingInfo | null>(null);

    // * list of heroes available to hire
    this.heroList$ = new BehaviorSubject<HeroModel[]>([]);
  }
}
