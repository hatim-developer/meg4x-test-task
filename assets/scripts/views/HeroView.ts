import { _decorator, Component, log, Sprite, UIOpacity } from "cc";
import { EHeroSprite, Nullable, TSpriteFrameDict } from "../common/types";
import { HeroViewModel } from "../viewmodels/HeroViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("HeroView")
export class HeroView extends Component {
  @property({
    type: Sprite
  })
  public spriteHeroFace: Nullable<Sprite | null> = null;

  @property({
    type: Sprite
  })
  public spriteHeroRank: Nullable<Sprite | null> = null;

  public heroViewModel: Nullable<HeroViewModel> = null;

  public setViewModel(heroVM: HeroViewModel) {
    this.heroViewModel = heroVM;
  }

  private _subscription: Nullable<Subscription> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    if (this.heroViewModel) {
      this._subscription = this.heroViewModel.getSpriteFramesObservable().subscribe((value) => {
        if (value === null) {
          return;
        }
        this.onFramesLoad(value);
      });
    }
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    this._subscription?.unsubscribe();
  }

  /// Subscriber Methods
  private onFramesLoad(spriteFramesDict: TSpriteFrameDict): void {
    log("HeroView: Frames loaded", spriteFramesDict); // __DEBUG__

    this.updateSpriteFrames(spriteFramesDict);
    this.activate();
  }

  /// UI Methods
  private updateSpriteFrames(spriteFramesDict: TSpriteFrameDict): void {
    if (this.spriteHeroFace) {
      this.spriteHeroFace.spriteFrame = spriteFramesDict[EHeroSprite.face];
    }

    if (this.spriteHeroRank) {
      this.spriteHeroRank.spriteFrame = spriteFramesDict[EHeroSprite.rank];
    }
  }

  private activate(): void {
    const opacityComp = this.node.getComponent(UIOpacity);

    if (opacityComp) {
      opacityComp.opacity = 255;
    }
  }
}
