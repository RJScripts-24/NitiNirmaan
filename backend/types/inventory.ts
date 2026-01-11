// --- GLOBAL ENUMS ---

export type DomainTheme = 'FLN' | 'CAREER' | 'STEM' | 'GENERAL';

export type InventoryItemType = 
  | 'stakeholder' 
  | 'intervention' 
  | 'indicator' 
  | 'outcome' 
  | 'risk';

export type ComplexityLevel = 1 | 2 | 3 | 4 | 5; // 1 = Simple, 5 = Highly Complex
export type CostLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// --- SHARED BASE INTERFACE ---

export interface BaseInventoryItem {
  id: string;
  label: string; // Display Name
  description?: string; // Tooltip text
  theme: DomainTheme; // For filtering (e.g., Show only FLN items)
  icon?: string; // Path to SVG (e.g., '/icons/teacher.svg')
}

// --- SPECIFIC ITEM SHAPES ---
// (These match the structures in lib/inventory/*.ts but are defined here for global access)

export interface StakeholderItem extends BaseInventoryItem {
  type: 'stakeholder';
  level: 'SCHOOL' | 'CLUSTER' | 'BLOCK' | 'DISTRICT';
  bandwidth: number; // Max concurrent tasks
  influence: number; // 1-10
}

export interface InterventionItem extends BaseInventoryItem {
  type: 'intervention';
  category: 'TRAINING' | 'MATERIAL' | 'TECH' | 'PROCESS';
  cost_level: CostLevel;
  complexity: ComplexityLevel;
  recommended_role?: string; // e.g. "Teacher"
}

export interface IndicatorItem extends BaseInventoryItem {
  type: 'indicator';
  measureType: 'process' | 'output' | 'outcome';
  unit: string; // '%', 'Count', 'Score'
}

// --- THE MASTER UNION TYPE ---
// This is what the "Draggable Palette" component uses
export type InventoryItem = StakeholderItem | InterventionItem | IndicatorItem;

// --- UTILITY TYPES FOR FRONTEND ---

export interface GroupedInventory {
  stakeholders: Record<string, StakeholderItem[]>; // Grouped by Level (School, Block...)
  interventions: Record<string, InterventionItem[]>; // Grouped by Category
  indicators: Record<string, IndicatorItem[]>; // Grouped by MeasureType
}