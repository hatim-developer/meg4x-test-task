import { _decorator, Component, EventTouch, Input, log, Sprite } from "cc";
import { Nullable } from "../common/types";
import { TowerBuildingViewModel } from "../viewmodels/TowerBuildingViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("TowerBuildingView")
export class TowerBuildingView extends Component {
  private _towerBuildingViewModel?: TowerBuildingViewModel;
  private _subscription?: Subscription;

  @property({
    type: Sprite
  })
  public spriteSummoningIcon: Nullable<Sprite> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._towerBuildingViewModel = new TowerBuildingViewModel();

    // * listen to building click
    this.node.on(Input.EventType.TOUCH_END, this.onTowerBuildingClick, this);
  }

  start() {
    this.subscribeEvents();
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription?.unsubscribe();

    this.node.off(Input.EventType.TOUCH_END, this.onTowerBuildingClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    this._subscription = this._towerBuildingViewModel?.getSummoningObservable().subscribe((isSummoning: boolean) => {
      this.onSummoningStateChange(isSummoning);
    });
  }

  /// UI Methods
  private onSummoningStateChange(isSummoning: boolean) {
    // TODO: Show only if TowerUI is hidden
    if (this.spriteSummoningIcon) {
      this.spriteSummoningIcon.node.active = isSummoning;
    }
  }

  // Event Listeners
  private onTowerBuildingClick(event: EventTouch): void {
    event.propagationStopped = true;
    log("TowerBuildingView onTowerBuildingClick()"); // !_DEBUG

    this._towerBuildingViewModel?.showTowerPanel();
  }
}
