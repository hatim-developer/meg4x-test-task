import { TowerModel } from "../models/TowerModel";

export class TowerViewModel {
  private towerModel: TowerModel;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    console.log("TowerViewModel: ctor"); // TODO: __REMOVE_LOG__
  }
}
