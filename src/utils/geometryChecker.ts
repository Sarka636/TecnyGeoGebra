import { CircleTask, GeometricObjectInfo, HintLevel, TaskType, ValidationReport } from '../types';
import { generateDidacticFeedback } from './didacticAgent';

/**
 * Generate a randomized task for circle tangents
 */
export function generateRandomTask(preferredType?: TaskType): CircleTask {
  const types: TaskType[] = ['exterior', 'exterior', 'exterior', 'on_circle', 'interior'];
  const taskType = preferredType || types[Math.floor(Math.random() * types.length)];

  // S is typically around center or slightly shifted
  const Sx = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
  const Sy = Math.floor(Math.random() * 3) - 1;
  const radius = Math.floor(Math.random() * 2) + 2.5; // 2.5 or 3.5 or 3.0

  let Mx: number;
  let My: number;
  let expectedTangents = 2;
  let title = 'Tečny ke kružnici z vnějšího bodu';
  let description = `Je dána kružnice k(S, r) se středem S[${Sx}, ${Sy}] a poloměrem r = ${radius}. Sestrojte všechny tečny ke kružnici k procházející bodem M.`;

  if (taskType === 'exterior') {
    expectedTangents = 2;
    // Distance between 5 and 7
    const angle = (Math.random() * 2 * Math.PI);
    const dist = radius + Math.random() * 2.5 + 2.0; // 5.0 - 7.5
    Mx = Math.round((Sx + Math.cos(angle) * dist) * 2) / 2;
    My = Math.round((Sy + Math.sin(angle) * dist) * 2) / 2;
    // Ensure not exactly equal to radius
    if (Math.hypot(Mx - Sx, My - Sy) <= radius) {
      Mx = Sx + radius + 3;
      My = Sy;
    }
    title = 'Tečny z vnějšího bodu M ke kružnici k';
    description = `Je dána kružnice k(S, r = ${radius}) se středem S[${Sx}, ${Sy}] a bod M[${Mx}, ${My}]. Bod M leží vně kružnice. Sestrojte obě tečny z bodu M ke kružnici k.`;
  } else if (taskType === 'on_circle') {
    expectedTangents = 1;
    // On the circle
    // Choose nice angles (0, 90, 180, 270 or 45, etc.)
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, Math.PI / 4, (3 * Math.PI) / 4];
    const chosenAngle = angles[Math.floor(Math.random() * angles.length)];
    Mx = Math.round((Sx + radius * Math.cos(chosenAngle)) * 10) / 10;
    My = Math.round((Sy + radius * Math.sin(chosenAngle)) * 10) / 10;
    title = 'Tečna ke kružnici v jejím bodě M';
    description = `Je dána kružnice k(S, r = ${radius}) se středem S[${Sx}, ${Sy}] a bod M[${Mx}, ${My}], který leží přímo na kružnici k. Sestrojte tečnu v tomto bodě dotyku.`;
  } else {
    expectedTangents = 0;
    // Inside the circle
    const angle = Math.random() * 2 * Math.PI;
    const dist = Math.max(0.5, radius * (0.3 + Math.random() * 0.4)); // inside
    Mx = Math.round((Sx + Math.cos(angle) * dist) * 2) / 2;
    My = Math.round((Sy + Math.sin(angle) * dist) * 2) / 2;
    title = 'Tečny z vnitřního bodu M (analýza řešitelnosti)';
    description = `Je dána kružnice k(S, r = ${radius}) se středem S[${Sx}, ${Sy}] a bod M[${Mx}, ${My}]. Určete počet řešení a sestrojte tečny, pokud existují, nebo zvolte tlačítko „Nemá řešení“.`;
  }

  return {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    center: { x: Sx, y: Sy, label: 'S' },
    radius,
    pointM: { x: Mx, y: My, label: 'M' },
    taskType,
    expectedTangents,
    description,
  };
}

/**
 * Distance from point (px, py) to general line ax + by + c = 0
 */
export function pointToLineDistance(px: number, py: number, a: number, b: number, c: number): number {
  const norm = Math.hypot(a, b);
  if (norm < 1e-7) return 999;
  return Math.abs(a * px + b * py + c) / norm;
}

/**
 * Check if a line is tangent to circle k(S, r) and passes through point M
 */
export function isLineTangentFromM(
  line: { a: number; b: number; c: number },
  S: { x: number; y: number },
  r: number,
  M: { x: number; y: number },
  tolerance = 0.22
): boolean {
  const distFromM = pointToLineDistance(M.x, M.y, line.a, line.b, line.c);
  const distFromS = pointToLineDistance(S.x, S.y, line.a, line.b, line.c);

  const passesThroughM = distFromM < tolerance;
  const isTangent = Math.abs(distFromS - r) < tolerance;

  return passesThroughM && isTangent;
}

/**
 * Check if two lines are distinct (not identical lines)
 */
export function areLinesDistinct(
  l1: { a: number; b: number; c: number },
  l2: { a: number; b: number; c: number }
): boolean {
  // Normalize coeffs
  const norm1 = Math.hypot(l1.a, l1.b);
  const norm2 = Math.hypot(l2.a, l2.b);
  if (norm1 < 1e-7 || norm2 < 1e-7) return false;

  let a1 = l1.a / norm1;
  let b1 = l1.b / norm1;
  let c1 = l1.c / norm1;

  let a2 = l2.a / norm2;
  let b2 = l2.b / norm2;
  let c2 = l2.c / norm2;

  // Make sure orientation sign is uniform
  if (a1 < 0 || (Math.abs(a1) < 1e-7 && b1 < 0)) {
    a1 = -a1; b1 = -b1; c1 = -c1;
  }
  if (a2 < 0 || (Math.abs(a2) < 1e-7 && b2 < 0)) {
    a2 = -a2; b2 = -b2; c2 = -c2;
  }

  const diffA = Math.abs(a1 - a2);
  const diffB = Math.abs(b1 - b2);
  const diffC = Math.abs(c1 - c2);

  // If difference is significant, they are distinct
  return diffA > 0.12 || diffB > 0.12 || diffC > 0.2;
}

/**
 * Comprehensive geometric validation of the GeoGebra workspace
 */
export function evaluateConstruction(
  task: CircleTask,
  objects: GeometricObjectInfo[],
  claimNoSolution: boolean = false,
  currentHintLevel: HintLevel = 1
): ValidationReport {
  const { center: S, radius: r, pointM: M } = task;
  const distanceSM = Math.hypot(M.x - S.x, M.y - S.y);

  // Theoretical Thales midpoint and radius
  const midX = (S.x + M.x) / 2;
  const midY = (S.y + M.y) / 2;
  const thalesRadius = distanceSM / 2;

  let hasMidpointSM = false;
  let hasThalesCircle = false;
  let hasContactPoints = false;
  let hasPerpendicularLine = false;

  const validTangents: { name: string; coeffs: { a: number; b: number; c: number } }[] = [];

  let pointsCount = 0;
  let linesCount = 0;
  let circlesCount = 0;
  let segmentsCount = 0;

  // Theoretical contact points T1, T2
  const theoreticalT: { x: number; y: number }[] = [];
  if (distanceSM >= r - 0.05) {
    if (Math.abs(distanceSM - r) <= 0.05) {
      // M is on circle, contact point is M
      theoreticalT.push({ x: M.x, y: M.y });
    } else {
      const alpha = Math.atan2(M.y - S.y, M.x - S.x);
      const theta = Math.acos(Math.min(1, r / distanceSM));
      theoreticalT.push({
        x: S.x + r * Math.cos(alpha + theta),
        y: S.y + r * Math.sin(alpha + theta),
      });
      theoreticalT.push({
        x: S.x + r * Math.cos(alpha - theta),
        y: S.y + r * Math.sin(alpha - theta),
      });
    }
  }

  // Iterate over student's objects
  for (const obj of objects) {
    // Ignore default task elements (center S, circle k, point M)
    if (obj.name === 'S' || obj.name === 'M' || obj.name === 'k') continue;

    if (obj.type === 'point' && obj.coords) {
      pointsCount++;
      // Check midpoint S_SM
      if (Math.hypot(obj.coords.x - midX, obj.coords.y - midY) < 0.45) {
        hasMidpointSM = true;
      }
      // Check contact points
      for (const t of theoreticalT) {
        if (Math.hypot(obj.coords.x - t.x, obj.coords.y - t.y) < 0.45) {
          hasContactPoints = true;
        }
      }
    } else if (obj.type === 'circle' && obj.circleData) {
      circlesCount++;
      // Check if this is Thales circle
      const c = obj.circleData;
      const centerMatch = Math.hypot(c.centerX - midX, c.centerY - midY) < 0.45;
      const radiusMatch = Math.abs(c.radius - thalesRadius) < 0.45;
      if (centerMatch && radiusMatch) {
        hasThalesCircle = true;
      }
    } else if (obj.type === 'segment') {
      segmentsCount++;
      // A segment can also be drawn as the tangent (e.g. Segment MT1, MT2)
      if (obj.lineCoeffs) {
        if (task.taskType === 'on_circle') {
          const isPerp = isLineTangentFromM(obj.lineCoeffs, S, r, M, 0.45);
          if (isPerp) {
            hasPerpendicularLine = true;
          }
        }

        if (isLineTangentFromM(obj.lineCoeffs, S, r, M, 0.45)) {
          const isDuplicate = validTangents.some(vt => !areLinesDistinct(vt.coeffs, obj.lineCoeffs!));
          if (!isDuplicate) {
            validTangents.push({ name: obj.name, coeffs: obj.lineCoeffs });
          }
        }
      }
    } else if ((obj.type === 'line' || obj.type === 'ray') && obj.lineCoeffs) {
      linesCount++;
      // Check perpendicular if on circle
      if (task.taskType === 'on_circle') {
        const isPerp = isLineTangentFromM(obj.lineCoeffs, S, r, M, 0.45);
        if (isPerp) {
          hasPerpendicularLine = true;
        }
      }

      // Check if it is a tangent from M
      if (isLineTangentFromM(obj.lineCoeffs, S, r, M, 0.45)) {
        // Ensure not duplicate
        const isDuplicate = validTangents.some(vt => !areLinesDistinct(vt.coeffs, obj.lineCoeffs!));
        if (!isDuplicate) {
          validTangents.push({ name: obj.name, coeffs: obj.lineCoeffs });
        }
      }
    }
  }

  // Determine overall validation status
  let status: ValidationReport['status'] = 'empty';

  if (claimNoSolution) {
    if (task.taskType === 'interior' || distanceSM < r - 0.05) {
      status = 'no_solution_correct';
    } else {
      status = 'no_solution_incorrect';
    }
  } else if (objects.length <= 3 && pointsCount === 0 && linesCount === 0 && circlesCount === 0 && segmentsCount === 0) {
    status = 'empty';
  } else {
    const foundCount = validTangents.length;
    if (task.taskType === 'interior') {
      status = 'incorrect'; // Tangents cannot exist for interior point
    } else if (task.taskType === 'exterior') {
      // For exterior point, rigorous synthetic construction requires Thales circle k_T over diameter SM
      if (foundCount === task.expectedTangents) {
        if (hasThalesCircle) {
          status = 'correct';
        } else {
          // Tangent lines drawn/guessed without Thales circle construction
          status = 'missing_thales_method';
        }
      } else if (foundCount > 0 && foundCount < task.expectedTangents) {
        status = 'partially_correct';
      } else {
        status = 'incorrect';
      }
    } else if (foundCount === task.expectedTangents) {
      status = 'correct';
    } else if (foundCount > 0 && foundCount < task.expectedTangents) {
      status = 'partially_correct';
    } else {
      status = 'incorrect';
    }
  }

  const objectsSummary = {
    pointsCount,
    linesCount,
    circlesCount,
    segmentsCount,
  };

  const initialReport: ValidationReport = {
    timestamp: Date.now(),
    status,
    taskType: task.taskType,
    expectedTangentsCount: task.expectedTangents,
    foundTangentsCount: validTangents.length,
    tangentNames: validTangents.map(t => t.name),
    hasMidpointSM,
    hasThalesCircle,
    hasContactPoints,
    hasPerpendicularLine,
    claimNoSolution,
    distanceSM,
    radius: r,
    objectsSummary,
    didacticFeedback: {
      correctItem: '',
      mainMistake: '',
      hint: '',
      studentQuestion: '',
      nextActionableStep: '',
    },
  };

  // Generate didactic feedback following the strict rules
  initialReport.didacticFeedback = generateDidacticFeedback(task, initialReport, currentHintLevel);

  return initialReport;
}
