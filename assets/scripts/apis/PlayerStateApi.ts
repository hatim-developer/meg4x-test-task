import { JsonAsset, resources } from "cc";
import { Observable } from "rxjs";
import { IPlayerInitialState } from "../common/types";

export const fetchPlayerInitialState = () => {
  return new Observable<IPlayerInitialState>((subscriber) => {
    resources.load("/settings/initial_state", JsonAsset, (err, resp) => {
      const defaultState: IPlayerInitialState = {
        currency: 0,
        buildings: ["hire_tower"],
        heroes: []
      };
      subscriber.next(resp.json?.state ?? defaultState);
    });
  });
};
