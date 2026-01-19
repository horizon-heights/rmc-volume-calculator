
export enum DimensionUnit {
  INCHES = 'inches',
  METERS = 'meters',
  FEET = 'feet',
}

export interface DimensionValue {
  main: string;
  sub: string;
}

export interface Dimensions {
  length: DimensionValue;
  width: DimensionValue;
  depth: DimensionValue;
}
