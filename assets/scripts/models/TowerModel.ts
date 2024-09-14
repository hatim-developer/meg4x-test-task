import { BehaviorSubject } from "rxjs";
import HeroModel from "./HeroModel";
import BuildingInfoModel from "./BuildingInfoModel";
import { IBuildingInfo, IHero } from "../common/types";
import { fetchHeroList } from "../apis/HeroApi";
import { fetchBuildingData } from "../apis/BuildingApi";

export class TowerModel {
  private _buildingInfo$: BehaviorSubject<BuildingInfoModel | null>;
  private _heroList$: BehaviorSubject<HeroModel[]>;

  constructor() {
    // * building info data
    this._buildingInfo$ = new BehaviorSubject<BuildingInfoModel | null>(null);

    // * list of heroes available to hire
    this._heroList$ = new BehaviorSubject<HeroModel[]>([]);

    // * loading heroes right away (no dependency)
    this.loadHeroes();
  }

  private setHeroes(heroes: HeroModel[]): void {
    if (!heroes?.length) {
      return;
    }
    this._heroList$.next(heroes);
  }

  private setBuildingInfo(info: BuildingInfoModel) {
    this._buildingInfo$.next(info);
  }

  public get heroList$() {
    return this._heroList$;
  }

  public get buildingInfo$() {
    return this._buildingInfo$;
  }

  /// API Methods
  private loadHeroes(): void {
    fetchHeroList().subscribe({
      next: (heroes) => {
        const models: HeroModel[] = heroes.map(this.createHeroModel);
        this.setHeroes(models);
      },
      error: (err) => {
        console.warn(err); // TODO: output to user
      }
    });
  }

  loadBuildingData(id: string): void {
    fetchBuildingData(id).subscribe({
      next: (data) => {
        this.setBuildingInfo(this.createBuildingModel(data));
      },
      error: (err) => {
        console.warn(err); // TODO: output to user
      }
    });
  }

  /// Helper Methods
  private createHeroModel(hero: any): HeroModel {
    const heroModelData: IHero = {
      id: hero.id,
      name: hero.name,
      description: hero.description,
      cost: hero.cost,
      summonCoolDown: hero.summonCooldown,
      type: hero.type,
      rank: hero.rank
    };
    return new HeroModel(heroModelData);
  }

  private createBuildingModel(buildingData: any): BuildingInfoModel {
    const buildingInfo: IBuildingInfo = {
      id: buildingData.id,
      name: buildingData.name,
      description: buildingData.description,
      hireSlots: buildingData.settings?.hireSlots ?? 5
    };
    return new BuildingInfoModel(buildingInfo);
  }
}
