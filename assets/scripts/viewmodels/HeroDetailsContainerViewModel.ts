import { BehaviorSubject, forkJoin } from "rxjs";
import { EHeroSprite, IHero, Nullable, TSpriteFrameDict } from "../common/types";
import { fetchSpriteFrame } from "../apis/SpriteFrameApi";
import { warn } from "cc";

export class HeroDetailsContainerViewModel {
  private _spriteFrames$: BehaviorSubject<Nullable<TSpriteFrameDict>>;
  private _heroModel: Nullable<IHero>;

  constructor(hero: IHero) {
    // * hero model data class
    this._heroModel = hero;

    // * state sprite frames
    this._spriteFrames$ = new BehaviorSubject<Nullable<TSpriteFrameDict>>(null);

    // * loading sprite frames dynamically
    this.loadSpriteFrames();
  }

  private loadSpriteFrames() {
    if (this._heroModel === null) {
      return;
    }

    const basePath = "dynamic_sprites/heroes/";
    const face$ = fetchSpriteFrame(basePath + this._heroModel.id);
    const rank$ = fetchSpriteFrame(`${basePath}ui/${this._heroModel.rank}_highlight`);
    const type$ = fetchSpriteFrame(`${basePath}ui/att_${this._heroModel.type}`);

    forkJoin({
      [EHeroSprite.face]: face$,
      [EHeroSprite.rank]: rank$,
      [EHeroSprite.type]: type$
    }).subscribe({
      next: (spriteFramesDict: TSpriteFrameDict) => {
        this._spriteFrames$.next(spriteFramesDict);
      },
      error: (err) => {
        warn("HeroDetailsContainerVM loadSpriteFrames Error: ", err);
        // TODO : __HANDLE_CASE__ optimize to ignore failed assets
      }
    });
  }

  /// Observables getters
  public getSpriteFramesObservable() {
    return this._spriteFrames$.asObservable();
  }
}
