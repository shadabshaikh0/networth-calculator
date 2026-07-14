export type Kind = "asset" | "liability";
export type View = "dashboard" | "category" | "history";
export type Metal = "gold" | "silver";

export interface Item {
  id: string;
  name: string;
  cat: string;
  value: number;
  owner: string;
  hidden?: boolean;
  note?: string;
  ref?: string;
  grams?: number;
  metal?: Metal;
}

export interface Member {
  id: string;
  name: string;
  relation: string;
  color: string;
}

export interface CategoryDef {
  key: string;
  label: string;
  color: string;
  iconPath: string;
}

export interface CatSel {
  kind: Kind;
  key: string;
  owner?: string;
}

export type Rates = Record<string, number>;
export type Included = Record<string, boolean>;

export interface ModalDraft {
  kind: Kind;
  id: string | null;
  name: string;
  cat: string;
  valueStr: string;
  owner: string;
  note: string;
  ref: string;
  grams: string;
  metal: Metal;
  entryMode: "value" | "weight";
}

export interface MemberModalDraft {
  mode: "list" | "add" | "edit";
  id?: string;
  name?: string;
  relation?: string;
  color?: string;
}
