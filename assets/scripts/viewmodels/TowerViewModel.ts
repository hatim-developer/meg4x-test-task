import { TowerModel } from "../models/TowerModel";
import { TowerStore } from "../stores/TowerStore";

export class TowerViewModel {
  private towerModel: TowerModel;
  private towerStore: TowerStore;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    // * shared TowerStore instance
    this.towerStore = TowerStore.getInstance();

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

  public getSelectedHeroObservable() {
    return this.towerStore.getSelectedHeroObservable();
  }

  public deselectHero(): void {
    this.towerStore.deselectHero();
  }

  public geSummonQueueSize(): number {
    return this.towerModel.getHireSlots();
  }
}
