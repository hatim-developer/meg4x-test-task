import { _decorator, Button, Component, instantiate, Label, Layout, Prefab, Sprite, UIOpacity, warn, Node, Input, log, EventTouch, input } from "cc";
import { TowerViewModel } from "../viewmodels/TowerViewModel";
import { Subscription } from "rxjs";
import { IBuildingInfo, IHero, Nullable } from "../common/types";
import { HeroViewModel } from "../viewmodels/HeroViewModel";
import { HeroView } from "./HeroView";
import { SummonHeroView } from "./SummonHeroView";
import { SummonHeroViewModel } from "../viewmodels/SummonHeroViewModel";
const { ccclass, property } = _decorator;

@ccclass("TowerView")
export class TowerView extends Component {
  private _towerViewModel?: TowerViewModel;
  private _subscription: Subscription[] = [];

  @property({
    type: Label
  })
  public labelPanelTitle: Nullable<Label> = null;

  @property({
    type: Label
  })
  public labelPanelDesc: Nullable<Label> = null;

  @property({
    type: Layout
  })
  public layoutSummonQueue: Nullable<Layout> = null;

  @property({
    type: Layout
  })
  public layoutHeroesList: Nullable<Layout> = null;

  @property({
    type: Prefab
  })
  public prefabHero: Nullable<Prefab> = null;

  @property({
    type: Prefab
  })
  public prefabSummonHero: Nullable<Prefab> = null;

  @property({
    type: Button
  })
  public buttonHire: Nullable<Button> = null;

  @property({
    type: Label
  })
  public labelHireCost: Nullable<Label> = null;

  @property({
    type: Sprite
  })
  public spriteHireCurrency: Nullable<Sprite> = null;

  get towerViewModel() {
    return this._towerViewModel!;
  }

  /// Lifecycle Methods
  protected onLoad(): void {
    // * init TowerVM
    this._towerViewModel = new TowerViewModel();
    this._subscription = [];

    this.resetUI();
  }

  start() {
    this.subscribeEvents();

    // * Global touch event to handle to deselect hero & close panel ui
    input.on(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription.forEach((sub) => sub.unsubscribe);

    // * Touch listeners cleanup
    input.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
    this.enableHireButtonTouchListener(false);
  }

  private subscribeEvents(): void {
    const buildingInfoSub = this.towerViewModel.getBuildingInfoObservable().subscribe((info) => {
      this.onNewBuildingInfo(info);
    });

    const heroesListSub = this.towerViewModel.getHeroesListObservable().subscribe((heroes) => {
      this.onNewHeroes(heroes);
    });

    const selectedHeroSub = this.towerViewModel.getSelectedHeroObservable().subscribe((selectedHero) => {
      this.onHeroSelect(selectedHero);
    });

    // * save subscriptions for cleaning
    this._subscription.push(buildingInfoSub, heroesListSub, selectedHeroSub);
  }

  /// Subscriber Methods
  private onNewBuildingInfo(building: Nullable<IBuildingInfo>) {
    if (building === null) {
      // TODO: _HANDLE_CASE_ : show loading state
      console.warn("TowerView building info is null");
      return;
    }
    this.updateBuildingDetails(building);
    this.renderSummonQueue();
  }

  private onNewHeroes(heroes: IHero[]) {
    if (!heroes?.length) {
      console.warn("TowerView no heroes to show");
      return;
    }

    this.updateHeroesList(heroes);
  }

  private onHeroSelect(hero: Nullable<IHero>) {
    log("TowerView onHeroSelect", hero); // !__DEBUG__

    if (hero === null) {
      this.updateHireButton();
      return;
    }
    // enable hire button
    this.updateHireButton(true, hero.cost);
  }

  /// UI Methods
  private updateBuildingDetails(building: IBuildingInfo): void {
    console.log("TowerView updatingBuildingInfo() : info", building); // _DEBUG_
    this.labelPanelTitle!.string = building.name;
    this.labelPanelDesc!.string = building.description;
  }

  private renderSummonQueue(): void {
    this.layoutSummonQueue!.node.removeAllChildren();

    const queueSize = this._towerViewModel?.geSummonQueueSize() || 0;

    for (let i = 0; i < queueSize; i++) {
      this.instantiateSummonHero();
    }
  }

  private instantiateSummonHero() {
    if (!this.prefabSummonHero) {
      warn("TowerView instantiateSummonHero(): prefabSummonHero is null");
      return;
    }

    const summonHeroNode: Node = instantiate(this.prefabSummonHero);
    this.layoutSummonQueue!.node.addChild(summonHeroNode);
  }

  private updateSummonHeroDetails(summonHeroNode: Node, hero: IHero): void {
    const summonHeroView = summonHeroNode.getComponent(SummonHeroView);

    if (summonHeroView) {
      const summonHeroViewModel = new SummonHeroViewModel(hero);
      summonHeroView.setViewModel(summonHeroViewModel);
    }
  }

  private updateHeroesList(heroes: IHero[]) {
    heroes.forEach(this.instantiateHero, this);
  }

  private instantiateHero(hero: IHero) {
    if (!this.prefabHero) {
      warn("TowerView instantiateHero(): prefabHero is null");
      return;
    }

    const heroNode: Node = instantiate(this.prefabHero);
    const heroView = heroNode.getComponent(HeroView);

    if (heroView) {
      const heroViewModel = new HeroViewModel(hero);
      heroView.setViewModel(heroViewModel);
    }
    this.layoutHeroesList!.node.addChild(heroNode);
  }

  private resetUI(): void {
    this.labelPanelTitle!.string = "";
    this.labelPanelDesc!.string = "";
    this.layoutSummonQueue!.node.removeAllChildren();
    this.layoutHeroesList!.node.removeAllChildren();

    this.resetHireButton();
  }

  private resetHireButton(): void {
    this.updateHireButton();
  }

  private updateHireButton(enable: boolean = false, cost: number = 0): void {
    // TODO: __HANDLE_CASE__ currency check
    if (this.buttonHire) {
      this.buttonHire.interactable = enable;

      const opacityComp = this.buttonHire.getComponent(UIOpacity);
      if (opacityComp) {
        opacityComp.opacity = enable ? 255 : 100;
      }

      this.labelHireCost!.string = cost ? cost.toString() : "";
      this.spriteHireCurrency!.node.active = enable;

      this.enableHireButtonTouchListener(enable);
    }
  }

  /// Event Listeners
  private enableHireButtonTouchListener(enable: boolean) {
    if (enable) {
      this.buttonHire?.node.on(Input.EventType.TOUCH_END, this.onHireButtonClicked, this);
    } else {
      this.buttonHire?.node.off(Input.EventType.TOUCH_END, this.onHireButtonClicked, this);
    }
  }

  private onHireButtonClicked(event: EventTouch): void {
    event.propagationStopped = true;
    log("TowerView onHireButtonClicked()", event, this); // !_DEBUG_
  }

  private onTouchEndEvent(event: EventTouch): void {
    event.propagationStopped = true;
    log("TowerView onTouchEndEvent()", event, this); // !_DEBUG_

    // deselect hero on click outside of hero | hire button
    if (this._towerViewModel) {
      this._towerViewModel.deselectHero();
    }
    // TODO: __HANDLE_CASE__ close TowerUi panel on click outside
  }
}
