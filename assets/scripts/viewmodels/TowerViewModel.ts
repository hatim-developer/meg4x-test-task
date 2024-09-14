import { TowerModel } from "../models/TowerModel";

export class TowerViewModel {
  private towerModel: TowerModel;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    this.loadData();
    this.subscribeModelData();
  }

  private loadData(): void {
    const buildingId = "hire_tower"; // TODO: get from initial_state.json

    this.towerModel.loadBuildingData(buildingId);
  }

  private subscribeModelData(): void {
    this.towerModel.heroList$.subscribe((heroes) => {
      console.log("TowerVM new heroes  data: ", heroes); // TODO: DEBUG
    });

    this.towerModel.buildingInfo$.subscribe((buildingInfo) => {
      console.log("TowerVM new building data: ", buildingInfo); // TODO: DEBUG
    });
  }
}
