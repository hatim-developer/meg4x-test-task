import { _decorator, Component, Node } from "cc";
import { TowerViewModel } from "../viewmodels/TowerViewModel";
const { ccclass, property } = _decorator;

@ccclass("TowerView")
export class TowerView extends Component {
  private towerViewModel?: TowerViewModel;

  protected onLoad(): void {
    // * init TowerVM
    this.towerViewModel = new TowerViewModel();
  }

  start() {}

  update(deltaTime: number) {}
}
