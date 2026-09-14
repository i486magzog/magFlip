/**
 * Fill types.
 */
export enum FillKind {
  Solid = 'solid',
  LinearGradient = 'linearGradient',
}
/**
 * A single color fill.
 */
export interface ISolidFill {
  kind: FillKind.Solid;
  /** `#rrggbb` or `#rrggbbaa`. */
  color: string;
}
/**
 * One stop of a gradient.
 */
export interface IGradientStop {
  /** Position along the gradient, 0 - 1. */
  offset: number;
  /** `#rrggbb` or `#rrggbbaa`. */
  color: string;
}
/**
 * A linear gradient fill.
 */
export interface ILinearGradientFill {
  kind: FillKind.LinearGradient;
  /** Clockwise angle in degrees; 0 points down, as in CSS `linear-gradient`. */
  angle: number;
  stops: IGradientStop[];
}
/**
 * A fill of a shape, a text background or a surface.
 */
export type IFill = ISolidFill | ILinearGradientFill;
/**
 * An outline drawn on the path of a shape.
 */
export interface IStroke {
  /** `#rrggbb` or `#rrggbbaa`. */
  color: string;
  /** Stroke width in px. */
  width: number;
  /** Dash pattern in px. An empty array draws a solid line. */
  dash: number[];
}
