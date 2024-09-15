import { TowerModel } from "../models/TowerModel";

export class TowerViewModel {
  private towerModel: TowerModel;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    this.loadData();
  }

  private loadData(): void {
    const buildingId = "hire_tower"; // TODO: get from initial_state.json

    this.towerModel.loadBuildingData(buildingId);
  }

  public getBuildingInfoObservable() {
    return this.towerModel.buildingInfo$;
  }

  public getHeroesListObservable() {
    return this.towerModel.heroList$;
  }
}
