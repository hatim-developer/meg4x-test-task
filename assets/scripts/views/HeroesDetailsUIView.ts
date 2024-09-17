import { _decorator, Button, Component, EventTouch, Input, Label, Layout, log } from "cc";
import { IHero, Nullable } from "../common/types";
import { HeroesDetailsUIViewModel } from "../viewmodels/HeroesDetailsUIViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("HeroesDetailsUIView")
export class HeroesDetailsUIView extends Component {
  private _heroesDetailsUIViewModel?: HeroesDetailsUIViewModel;
  private _subscription?: Subscription;

  @property({
    type: Button
  })
  public buttonClose: Nullable<Button> = null;

  @property({
    type: Layout
  })
  public layoutContent: Nullable<Layout> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._heroesDetailsUIViewModel = new HeroesDetailsUIViewModel();
  }

  start() {
    this.subscribeEvents();

    this.buttonClose?.node.on(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription?.unsubscribe();

    this.buttonClose?.node.off(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    this._subscription = this._heroesDetailsUIViewModel?.getPlayerHeroesObservable().subscribe((heroes) => {
      this.onHeroesStateChange(heroes);
    });
  }

  /// UI Methods
  private onHeroesStateChange(heroes: IHero[]) {
    log("HeroesDetailsUIView onHeroesStateChange()", heroes); // !_DEBUG
  }

  /// Event Listeners
  private onCloseButtonClick(event: EventTouch): void {
    event.propagationStopped = true;
    log("HeroesDetailsUIView onCloseButtonClick()"); // !_DEBUG

    // TODO: CLOSE POPUP
  }
}
