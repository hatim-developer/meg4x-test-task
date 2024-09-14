import { IBuildingInfo } from "../common/types";

export class BuildingInfo implements IBuildingInfo {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public hireSlots: number
  ) {}
}
