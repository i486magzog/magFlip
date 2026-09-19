import { JsonObject, JsonValue } from '../common/json';
import { ISize } from '../common/geometry';

/**
 * Kinds of setting a widget can ask the author for.
 */
export enum WidgetFieldKind {
  /** One line of text. */
  Text = 'text',
  /** Several lines of text, kept as one string. */
  TextArea = 'textarea',
  /** A list of short texts, one per line in the editor. */
  Lines = 'lines',
  Number = 'number',
  Boolean = 'boolean',
  /** `#rrggbb`. */
  Color = 'color',
}
/**
 * One setting of a widget, as the editor shows it and the server checks it.
 */
export type IWidgetField =
  | IWidgetFieldBase<WidgetFieldKind.Text | WidgetFieldKind.TextArea, string> & { maxLength?: number }
  | IWidgetFieldBase<WidgetFieldKind.Lines, string[]> & { maxItems?: number }
  | IWidgetFieldBase<WidgetFieldKind.Number, number> & { min?: number, max?: number, isInteger?: boolean }
  | IWidgetFieldBase<WidgetFieldKind.Boolean, boolean>
  | IWidgetFieldBase<WidgetFieldKind.Color, string>;

interface IWidgetFieldBase<K extends WidgetFieldKind, V> {
  kind: K;
  /** Key in `IWidgetElement.props`. */
  key: string;
  /** Label shown to the author. */
  label: string;
  defaultValue: V;
  /** One line shown under the field. */
  hint?: string;
}
/**
 * A widget the server offers: what it is called, how large it starts, and the
 * settings it takes. The server owns the list; the editor reads it to build
 * the settings form, and publishing reads it to turn a widget into a URL.
 */
export interface IWidgetDefinition {
  /** `vendor.name`, the `widgetType` of the elements that use it. */
  type: string;
  /** Raised whenever the widget changes in a way old props do not fit. */
  version: number;
  name: string;
  description: string;
  defaultSize: ISize;
  fields: IWidgetField[];
}

/**
 * Returns the props a new widget starts with.
 */
export function getDefaultWidgetProps(definition: IWidgetDefinition): JsonObject {
  return Object.fromEntries(definition.fields.map(field => [field.key, structuredClone(field.defaultValue) as JsonValue]));
}
/**
 * Checks props against the fields of a widget and returns what is wrong, one
 * English sentence per problem. Props the widget does not know are allowed:
 * an older version of the widget may have written them.
 */
export function validateWidgetProps(definition: IWidgetDefinition, props: JsonObject): string[] {
  const errors: string[] = [];
  for (const field of definition.fields) {
    const value = props[field.key];
    if (value === undefined) { continue; }
    const error = checkField(field, value);
    if (error) { errors.push(`"${field.key}" ${error}.`); }
  }
  return errors;
}

function checkField(field: IWidgetField, value: JsonValue): string | undefined {
  switch (field.kind) {
    case WidgetFieldKind.Text:
    case WidgetFieldKind.TextArea:
      if (typeof value !== 'string') { return 'must be text'; }
      if (field.maxLength !== undefined && value.length > field.maxLength) { return `must stay below ${field.maxLength} characters`; }
      return undefined;
    case WidgetFieldKind.Lines:
      if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) { return 'must be a list of texts'; }
      if (field.maxItems !== undefined && value.length > field.maxItems) { return `must have at most ${field.maxItems} items`; }
      return undefined;
    case WidgetFieldKind.Number:
      if (typeof value !== 'number' || !Number.isFinite(value)) { return 'must be a number'; }
      if (field.isInteger && !Number.isInteger(value)) { return 'must be a whole number'; }
      if (field.min !== undefined && value < field.min) { return `must be at least ${field.min}`; }
      if (field.max !== undefined && value > field.max) { return `must be at most ${field.max}`; }
      return undefined;
    case WidgetFieldKind.Boolean:
      return typeof value === 'boolean' ? undefined : 'must be true or false';
    case WidgetFieldKind.Color:
      return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? undefined : 'must be a color like #1f2937';
    default:
      return undefined;
  }
}
