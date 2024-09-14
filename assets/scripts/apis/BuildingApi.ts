import { JsonAsset, resources } from "cc";
import { Observable } from "rxjs";

export const fetchBuildingData = (buildingId: string) => {
  return new Observable<{}>((subscriber) => {
    resources.load("/settings/buildings", JsonAsset, (err, resp) => {
      if (err) {
        subscriber.error(err);
        return;
      }

      const buildings = resp.json?.buildings;

      if (Array.isArray(buildings)) {
        const buildingData = buildings.find((building) => {
          return building.id === buildingId;
        });
        if (buildingData) {
          subscriber.next(buildingData);
          subscriber.complete();
        }
      }

      subscriber.error(new Error(`custom_error: ${buildingId} building data not found`));
    });
  });
};
