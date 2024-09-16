import { BehaviorSubject, forkJoin } from "rxjs";
import { EHeroSprite, IHero, Nullable, TSpriteFrameDict } from "../common/types";
import HeroModel from "../models/HeroModel";
import { fetchSpriteFrame } from "../apis/SpriteFrameApi";
import { warn } from "cc";
import { TowerStore } from "../stores/TowerStore";

export class HeroViewModel {
  private _spriteFrames$: BehaviorSubject<Nullable<TSpriteFrameDict>>;
  private _heroModel: HeroModel;
  private _towerStore: TowerStore;

  constructor(hero: IHero) {
    // * hero model data class
    this._heroModel = hero;

    // * state sprite frames
    this._spriteFrames$ = new BehaviorSubject<Nullable<TSpriteFrameDict>>(null);

    // * shared TowerStore instance
    this._towerStore = TowerStore.getInstance();

    // * loading sprite frames dynamically
    this.loadSpriteFrames();
  }

  private loadSpriteFrames() {
    const basePath = "dynamic_sprites/heroes/";

    const face$ = fetchSpriteFrame(basePath + this._heroModel.id);
    const rank$ = fetchSpriteFrame(`${basePath}ui/${this._heroModel.rank}_highlight`);

    forkJoin({
      [EHeroSprite.face]: face$,
      [EHeroSprite.rank]: rank$
    }).subscribe({
      next: (spriteFramesDict: TSpriteFrameDict) => {
        this._spriteFrames$.next(spriteFramesDict);
      },
      error: (err) => {
        warn("TowerVM loadSpriteFrames Error: ", err);
      }
    });
  }

  public getSpriteFramesObservable() {
    return this._spriteFrames$.asObservable();
  }

  public getSelectedHeroObservable() {
    return this._towerStore.getSelectedHeroObservable();
  }

  public selectHero(): void {
    this._towerStore.setSelectedHero(this._heroModel);
  }

  public canHighlightPortrait(heroId: string): boolean {
    return heroId === this._heroModel.id;
  }
}
