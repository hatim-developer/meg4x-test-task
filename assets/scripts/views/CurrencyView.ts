import { _decorator, Component, Label, Node } from "cc";
import { Nullable } from "../common/types";
import { CurrencyViewModel } from "../viewmodels/CurrencyViewModel";
import { Subscription } from "rxjs";
const { ccclass, property } = _decorator;

@ccclass("CurrencyView")
export class CurrencyView extends Component {
  private _currencyViewModel?: CurrencyViewModel;
  private _subscription?: Subscription;

  @property({
    type: Label
  })
  public labelCurrency: Nullable<Label> = null;

  /// Lifecycle Methods
  protected onLoad(): void {
    // * instantiate CurrencyVM
    this._currencyViewModel = new CurrencyViewModel();
  }

  start() {
    this.subscribeEvents();
  }

  update(deltaTime: number) {}

  protected onDestroy(): void {
    // * subscription cleanup
    this._subscription?.unsubscribe();
  }

  /// Subscriptions
  private subscribeEvents(): void {
    this._subscription = this._currencyViewModel?.getCurrencyObservable().subscribe((currency) => {
      this.onCurrencyChange(currency);
    });
  }

  /// UI Methods
  private onCurrencyChange(newCurrency: number) {
    if (this.labelCurrency) {
      this.labelCurrency.string = newCurrency.toString();
    }
  }
}
