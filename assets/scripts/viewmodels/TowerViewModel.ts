import { warn } from "cc";
import { TowerModel } from "../models/TowerModel";
import { TowerStore } from "../stores/TowerStore";
import { BehaviorSubject } from "rxjs";
import HeroModel from "../models/HeroModel";
import { Nullable } from "../common/types";

export class TowerViewModel {
  private towerModel: TowerModel;
  private towerStore: TowerStore;

  private _summonHeroesQueue$: BehaviorSubject<HeroModel[]>;

  constructor() {
    // * init TowerModel
    this.towerModel = new TowerModel();

    // * shared TowerStore instance
    this.towerStore = TowerStore.getInstance();

    // * queue of active hired heroes, only required by view
    this._summonHeroesQueue$ = new BehaviorSubject<HeroModel[]>([]);

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

  public getSummonHeroesQueueObservable() {
    return this._summonHeroesQueue$.asObservable();
  }

  public deselectHero(): void {
    this.towerStore.deselectHero();
  }

  public getMaxHireSlots(): number {
    return this.towerModel.getHireSlots();
  }

  public canHireHero(heroCost: number): boolean {
    // TODO: Get it from player store
    const globalCurrency = 200;

    return heroCost <= globalCurrency && this.getHiredQueueSize() < this.getMaxHireSlots();
  }

  public getHiredQueueSize(): number {
    return this._summonHeroesQueue$.value.length;
  }

  public hireHero(): void {
    // hire selected hero
    const selectedHero: Nullable<HeroModel> = this.towerStore.getSelectedHero();

    if (selectedHero === null) {
      warn("TowerModelView:hireHero() something is too wrong, selectedHero is null, and hireHero is called!");
      return;
    }

    const hiredHeroes = this._summonHeroesQueue$.value;

    if (hiredHeroes.length >= this.getMaxHireSlots()) {
      warn("TowerModelView:hireHero() something is too wrong, heroes queue is full, and hireHero is called!");
      return;
    }

    // push hero to queue
    hiredHeroes.push(selectedHero);
    this._summonHeroesQueue$.next(hiredHeroes);

    // deselect hero
    this.deselectHero();
  }
}
