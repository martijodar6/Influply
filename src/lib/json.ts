// Small, defensive helpers around the JSON-text columns in the schema —
// every read tolerates malformed/empty data instead of throwing, since
// this is user-facing content flowing through forms.

export function parseArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseObject<T extends Record<string, unknown>>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

export function toJsonArray(values: unknown[] | undefined | null): string {
  return JSON.stringify(Array.isArray(values) ? values : []);
}

export function toJsonObject(value: Record<string, unknown> | undefined | null): string {
  return JSON.stringify(value ?? {});
}

export type ContentRequestedItem = { type: string; qty: number };

export type CampaignRequirements = {
  minFollowers?: number;
  ageRange?: string;
  contentCategory?: string;
  mainPlatform?: string;
  audienceType?: string;
};
