export interface Tax {
  total: number;
  name: string; // Ej: "IVA"
  rate: number;
  type: "transferred" | "retained";
  isLocal?: boolean;
}