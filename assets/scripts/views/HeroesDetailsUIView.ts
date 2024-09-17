import { _decorator, Button, Component, EventTouch, Input, instantiate, Node, Layout, log, Prefab, warn, Label } from "cc";
import { IHero, Nullable } from "../common/types";
import { HeroesDetailsUIViewModel } from "../viewmodels/HeroesDetailsUIViewModel";
import { Subscription } from "rxjs";
import { HeroDetailsContainerView } from "./HeroDetailsContainerView";
import { HeroDetailsContainerViewModel } from "../viewmodels/HeroDetailsContainerViewModel";
const { ccclass, property } = _decorator;

@ccclass("HeroesDetailsUIView")
export class HeroesDetailsUIView extends Component {
  private _heroesDetailsUIViewModel?: HeroesDetailsUIViewModel;
  private _subscription: Subscription[] = [];

  @property({
    type: Button
  })
  public buttonClose: Nullable<Button> = null;

  @property({
    type: Layout
  })
  public layoutContent: Nullable<Layout> = null;

  @property({
    type: Prefab
  })
  public prefabHeroContainer: Nullable<Prefab> = null;

  @property({
    type: Label
  })
  public labelInfo: Nullable<Label> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._heroesDetailsUIViewModel = new HeroesDetailsUIViewModel();
    this._subscription = [];

    this.resetUI();
    this.subscribeEvents();
  }

  start() {
    this.buttonClose?.node.on(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription.forEach((sub) => sub.unsubscribe);

    this.buttonClose?.node.off(Input.EventType.TOUCH_END, this.onCloseButtonClick, this);
  }

  /// Subscriptions
  private subscribeEvents(): void {
    if (!this._heroesDetailsUIViewModel) {
      return;
    }

    const activatePanelSub = this._heroesDetailsUIViewModel.getActivateHallOfHeroesObservable().subscribe((show) => {
      this.onPanelUIRequest(show);
    });

    const herosDetailsSub = this._heroesDetailsUIViewModel.getPlayerHeroesObservable().subscribe((heroes) => {
      this.onHeroesStateChange(heroes);
    });

    // * save subscriptions for cleaning
    this._subscription.push(activatePanelSub, herosDetailsSub);
  }

  /// UI Methods
  private onPanelUIRequest(show: boolean) {
    if (show) {
      this.showTowerPanel();
    } else {
      this.closeTowerPanel();
    }
  }
  private showTowerPanel(): void {
    // TODO: Add slide in animation
    this.node.active = true;
  }

  private closeTowerPanel(): void {
    // TODO: Add slide out animation
    this.node.active = false;
  }

  private onHeroesStateChange(heroes: IHero[]) {
    log("HeroesDetailsUIView onHeroesStateChange()"); // !_DEBUG
    this.updateHeroesList(heroes);
  }

  private resetUI(): void {
    this.layoutContent!.node.removeAllChildren();
  }

  private updateHeroesList(heroes: IHero[]) {
    if (this.layoutContent === null) {
      warn("HeroesDetailsUIView updateHeroesList(): layoutContent is null");
      return;
    }

    const children = this.layoutContent.node.children;
    const newHeroesCount = heroes.length - children.length;

    if (newHeroesCount < 1) {
      if (children.length === 0 && this.labelInfo) {
        this.labelInfo.node.active = true;
      }
      return;
    }

    if (this.labelInfo) {
      this.labelInfo.node.active = false;
    }

    // update only new heroes
    for (let i = heroes.length - newHeroesCount; i < heroes.length; i++) {
      this.instantiateHeroContainer(heroes[i]);
    }
  }

  private instantiateHeroContainer(hero: IHero): void {
    if (!this.prefabHeroContainer) {
      warn("HeroesDetailsUIView instantiateHeroContainer(): prefabHeroContainer is null");
      return;
    }

    const heroNode: Node = instantiate(this.prefabHeroContainer);
    const heroView = heroNode.getComponent(HeroDetailsContainerView);

    if (heroView) {
      const heroViewModel = new HeroDetailsContainerViewModel(hero);
      heroView.setViewModel(heroViewModel);
    }
    this.layoutContent!.node.addChild(heroNode);
  }

  /// Event Listeners
  private onCloseButtonClick(event: EventTouch): void {
    event.propagationStopped = true;
    log("HeroesDetailsUIView onCloseButtonClick()"); // !_DEBUG

    this._heroesDetailsUIViewModel?.closeButtonClick();
  }
}
