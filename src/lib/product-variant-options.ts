import type { ProductVariant } from "@/integrations/shopify/types";

export type OptionGroup = {
  name: string;
  values: string[];
};

const SIZE_ORDER = [
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "2xl",
  "3xl",
  "xxxl",
  "4xl",
  "5xl",
];

function sortOptionNames(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const rank = (n: string) => {
      const l = n.toLowerCase();
      if (l === "size") return 0;
      if (l === "color" || l === "colour") return 1;
      if (l === "style" || l === "material") return 2;
      return 3;
    };
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

function sortValuesForOption(optionName: string, values: string[]): string[] {
  const lower = optionName.toLowerCase();
  if (lower === "size" || lower.includes("size")) {
    return [...values].sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.toLowerCase().trim());
      const ib = SIZE_ORDER.indexOf(b.toLowerCase().trim());
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });
  }
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

/**
 * Build option name → values map from all variants (Shopify `selectedOptions`).
 */
export function getOptionGroups(variants: ProductVariant[]): OptionGroup[] {
  const map = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const so of v.selectedOptions) {
      if (!map.has(so.name)) map.set(so.name, new Set());
      map.get(so.name)!.add(so.value);
    }
  }
  if (map.size === 0) return [];

  return sortOptionNames([...map.keys()]).map((name) => ({
    name,
    values: sortValuesForOption(name, [...map.get(name)!]),
  }));
}

export function selectionRecordFromVariant(variant: ProductVariant): Record<string, string> {
  return Object.fromEntries(variant.selectedOptions.map((o) => [o.name, o.value]));
}

function variantMatchesSelection(variant: ProductVariant, selection: Record<string, string>): boolean {
  if (variant.selectedOptions.length !== Object.keys(selection).length) return false;
  return variant.selectedOptions.every((so) => selection[so.name] === so.value);
}

export function findVariantByOptionSelection(
  variants: ProductVariant[],
  selection: Record<string, string>
): ProductVariant | undefined {
  return variants.find((v) => variantMatchesSelection(v, selection));
}

/** Human-friendly label: Shopify option name as title text. */
export function formatOptionLabel(name: string): string {
  const t = name.trim();
  if (!t) return name;
  const lower = t.toLowerCase();
  if (lower === "colour") return "Color";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export type OptionValueState = "selected" | "available" | "soldout" | "invalid";

export function getOptionValueState(
  variants: ProductVariant[],
  selection: Record<string, string>,
  optionName: string,
  value: string
): OptionValueState {
  const next = { ...selection, [optionName]: value };
  const variant = findVariantByOptionSelection(variants, next);
  if (!variant) return "invalid";
  const selected = selection[optionName] === value;
  if (selected) return "selected";
  if (!variant.availableForSale) return "soldout";
  return "available";
}
