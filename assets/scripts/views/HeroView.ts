import { _decorator, Component, EventTouch, Graphics, Input, input, log, Sprite, UIOpacity, UITransform } from "cc";
import { EHeroSprite, Nullable, TSpriteFrameDict } from "../common/types";
import { HeroViewModel } from "../viewmodels/HeroViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("HeroView")
export class HeroView extends Component {
  @property({
    type: Sprite
  })
  public spriteHeroFace: Nullable<Sprite> = null;

  @property({
    type: Sprite
  })
  public spriteHeroRank: Nullable<Sprite> = null;

  @property({
    type: Graphics
  })
  public graphicHeroPortrait: Nullable<Graphics> = null;

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
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
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

    this.addTouchListener();
  }

  private highlightPortrait(visible: boolean = true): void {
    const ctx = this.graphicHeroPortrait;

    if (!ctx) {
      return;
    }

    ctx.clear();

    if (visible) {
      const transformComp = this.node.getComponent(UITransform);
      const width = (transformComp?.width ?? 100) - 5;
      const height = (transformComp?.height ?? 105) - 5;

      ctx.lineWidth = 8;
      ctx.rect(-width / 2, -height / 2, width, height);
      ctx.stroke();
    }
  }

  /// Event Callbacks
  private addTouchListener(): void {
    this.node.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
    this.node.on(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
  }

  private onTouchEndEvent(event: EventTouch) {
    event.propagationStopped = true;
    this.highlightPortrait();
  }
}
