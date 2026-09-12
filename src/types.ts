export type TaskType = 'exterior' | 'on_circle' | 'interior';

export interface Point2D {
  x: number;
  y: number;
  label?: string;
}

export interface CircleTask {
  id: string;
  title: string;
  center: Point2D;
  radius: number;
  pointM: Point2D;
  taskType: TaskType;
  expectedTangents: number;
  description: string;
}

export type HintLevel = 0 | 1 | 2 | 3;

export interface DidacticResponse {
  correctItem: string;
  mainMistake: string;
  hint: string;
  studentQuestion: string;
  nextActionableStep: string;
}

export interface GeometricObjectInfo {
  name: string;
  type: 'point' | 'line' | 'segment' | 'circle' | 'ray' | 'conic' | 'other';
  definition?: string;
  coords?: { x: number; y: number };
  lineCoeffs?: { a: number; b: number; c: number }; // ax + by + c = 0
  circleData?: { centerX: number; centerY: number; radius: number };
}

export interface ValidationReport {
  timestamp: number;
  status: 'correct' | 'partially_correct' | 'incorrect' | 'no_solution_correct' | 'no_solution_incorrect' | 'empty' | 'missing_thales_method';
  taskType: TaskType;
  expectedTangentsCount: number;
  foundTangentsCount: number;
  tangentNames: string[];
  hasMidpointSM: boolean;
  hasThalesCircle: boolean;
  hasContactPoints: boolean;
  hasPerpendicularLine: boolean;
  claimNoSolution: boolean;
  distanceSM: number;
  radius: number;
  objectsSummary: {
    pointsCount: number;
    linesCount: number;
    circlesCount: number;
    segmentsCount: number;
  };
  didacticFeedback: DidacticResponse;
}
