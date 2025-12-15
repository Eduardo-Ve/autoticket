// src/types/ticket.ts

export type TicketCategory =
  | "Access"
  | "Administrative rights"
  | "HR Support"
  | "Hardware"
  | "Internal Project"
  | "Miscellaneous"
  | "Purchase"
  | "Storage"
  | "REVIEW";

export interface TicketResult {
  category: TicketCategory;
  category_label: TicketCategory;
  confidence: number;
  threshold_used?: number;
  top3?: Array<[TicketCategory, number]>;
}
