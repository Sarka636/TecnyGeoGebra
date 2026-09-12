import { CircleTask, DidacticResponse, HintLevel, ValidationReport } from '../types';

/**
 * Generate didactic feedback strictly formatted into 5 components:
 * 1. jedna konkrétní správnou věc
 * 2. nejdůležitější chyba
 * 3. jedna nápověda (podle úrovně 1, 2 nebo 3)
 * 4. jedna otázka pro žáka
 * 5. jeden další proveditelný krok
 */
export function generateDidacticFeedback(
  task: CircleTask,
  report: ValidationReport,
  hintLevel: HintLevel
): DidacticResponse {
  const { taskType, radius } = task;
  const {
    status,
    foundTangentsCount,
    expectedTangentsCount,
    hasMidpointSM,
    hasThalesCircle,
    hasContactPoints,
    hasPerpendicularLine,
    claimNoSolution,
    distanceSM,
    objectsSummary,
  } = report;

  // Case 1: Student clicked "Nemá řešení"
  if (claimNoSolution) {
    if (status === 'no_solution_correct') {
      return {
        correctItem: `Správně jsi vyhodnotil polohu bodu M: vzdálenost |SM| = ${distanceSM.toFixed(2)} je menší než poloměr r = ${radius}, bod leží uvnitř kružnice.`,
        mainMistake: `Žádná chyba zde není, tvůj závěr o neexistenci reálných tečen je matematicky přesný.`,
        hint: getHintContent(taskType, hintLevel, report),
        studentQuestion: `Proč z vnitřního bodu kružnice nelze vést žádnou přímku, která by měla s kružnicí právě jeden společný bod?`,
        nextActionableStep: `Můžeš si vygenerovat novou úlohu tlačítkem „Nová úloha“ a vyzkoušet konstrukci pro vnější bod.`,
      };
    } else {
      // no_solution_incorrect
      const positionText = taskType === 'exterior' 
        ? `vně kružnice (|SM| = ${distanceSM.toFixed(2)} > r = ${radius}), existují tedy 2 tečny`
        : `přímo na kružnici (|SM| = r = ${radius}), existuje právě 1 tečna`;

      return {
        correctItem: `Ověřil jsi polohu bodu M vůči středu S a kružnici k.`,
        mainMistake: `Zvolil jsi možnost „nemá řešení“, ale bod M leží ${positionText}.`,
        hint: getHintContent(taskType, hintLevel, report),
        studentQuestion: taskType === 'exterior'
          ? `Jakou polohu má bod M vůči kružnici k, když je jeho vzdálenost od středu větší než poloměr?`
          : `Jak sestrojíš tečnu v bodě, který leží přímo na kružnici?`,
        nextActionableStep: taskType === 'exterior'
          ? `Spoj body S a M úsečkou a najdi její střed.`
          : `Sestroj poloměr SM a v bodě M vztyč kolmici na tento poloměr.`,
      };
    }
  }

  // Case 2: Complete and correct construction!
  if (status === 'correct') {
    const tangentWord = expectedTangentsCount === 1 ? 'tečnu' : 'obě tečny';
    return {
      correctItem: `Výborně, úspěšně jsi sestrojil ${tangentWord} ke kružnici k procházející bodem M s přesnými body dotyku a pomocí Thaletovy kružnice.`,
      mainMistake: `V konstrukci není žádná chyba, všechny geometrické podmínky i správný postup jsou splněny.`,
      hint: `Tvá konstrukce je kompletní. Můžeš si zopakovat zdůvodnění pomocí Thaletovy věty.`,
      studentQuestion: `Proč je úhel mezi poloměrem vedeným do bodu dotyku a tečnou vždy pravý (90°)?`,
      nextActionableStep: `Vyzkoušej další úlohu tlačítkem „Nová úloha“ nebo prozkoumej dynamické chování posunem bodů.`,
    };
  }

  // Case 2b: Tangents drawn/estimated without Thales circle
  if (status === 'missing_thales_method') {
    return {
      correctItem: `Sestrojené přímky směřují přibližně do směru tečen z bodu M.`,
      mainMistake: `Chybí geometrické sestrojení bodů dotyku pomocí Thaletovy kružnice. Tečny nelze jen odhadnout nebo umístit od oka.`,
      hint: getHintContent(taskType, hintLevel, report),
      studentQuestion: `Jaká kružnice ti zajistí, že úhel $|\sphericalangle STM|$ bude přesně 90° (pravý úhel)?`,
      nextActionableStep: `Sestroj střed úsečky SM a Thaletovu kružnici nad průměrem SM pro přesné nalezení bodů dotyku.`,
    };
  }

  // Case 3: Partially correct (e.g. 1 tangent constructed when 2 were expected)
  if (status === 'partially_correct') {
    return {
      correctItem: `Jedna tečna je sestrojena zcela správně a prochází bodem M i přesným bodem dotyku.`,
      mainMistake: `Chybí druhá tečna. Z vnějšího bodu ke kružnici vedou vždy dvě různé tečny.`,
      hint: getHintContent(taskType, hintLevel, report),
      studentQuestion: `Kde leží druhý průsečík Thaletovy kružnice s původní kružnicí k?`,
      nextActionableStep: `Označ druhý průsečík jako T₂ a veď jím přímku procházející bodem M.`,
    };
  }

  // Case 4: Nothing or minimal objects drawn yet
  if (status === 'empty') {
    return {
      correctItem: `Máš zadanou kružnici k se středem S a bod M.`,
      mainMistake: `Zatím jsi na pracovní plochu nevložil žádné konstrukční prvky pro sestrojení tečen.`,
      hint: getHintContent(taskType, hintLevel, report),
      studentQuestion: taskType === 'exterior'
        ? `Co víš o úhlu, který svírá tečna s poloměrem kružnice v bodě dotyku?`
        : taskType === 'on_circle'
        ? `Jaký je vztah mezi tečnou v bodě M a poloměrem SM?`
        : `Porovnej vzdálenost |SM| a poloměr kružnice r. Co z toho plyne?`,
      nextActionableStep: taskType === 'interior'
        ? `Porovnej polohu bodu M s poloměrem r a zvol tlačítko „Nemá řešení“.`
        : taskType === 'on_circle'
        ? `Sestroj úsečku SM a v bodě M na ni vytvoř kolmici.`
        : `Začni sestrojením úsečky SM a najdi její střed.`,
    };
  }

  // Case 5: Incorrect or in-progress construction
  // Check intermediate milestones
  let correctItem = `Začal jsi s rýsováním v GeoGebře a propojil body v rovině.`;
  let mainMistake = `Sestrojené přímky nesplňují podmínku tečny (buď neprocházejí bodem M, nebo nejsou tečnami ke kružnici k).`;
  let nextStep = `Sestroj střed úsečky SM a Thaletovu kružnici nad průměrem SM.`;

  if (hasThalesCircle && !hasContactPoints) {
    correctItem = `Správně jsi sestrojil Thaletovu kružnici nad průměrem SM.`;
    mainMistake = `Zatím jsi neurčil body dotyku jako průsečíky Thaletovy kružnice s původní kružnicí k.`;
    nextStep = `Použij nástroj „Průsečík“ a klikni na obě kružnice pro získání bodů dotyku T₁ a T₂.`;
  } else if (hasMidpointSM && !hasThalesCircle) {
    correctItem = `Správně jsi nalezl střed úsečky SM.`;
    mainMistake = `Chybí pomocná Thaletova kružnice, která ti pomůže najít body dotyku pod pravým úhlem.`;
    nextStep = `Sestroj kružnici se středem ve středu úsečky SM procházející bodem S (nebo M).`;
  } else if (hasContactPoints && foundTangentsCount === 0) {
    correctItem = `Správně jsi našel body dotyku T na kružnici k.`;
    mainMistake = `Ještě jsi nesestrojil přímky spojující bod M s nalezenými body dotyku.`;
    nextStep = `Sestroj přímky procházející bodem M a body dotyku T₁ a T₂.`;
  } else if (taskType === 'on_circle' && !hasPerpendicularLine) {
    correctItem = `Bod M leží na kružnici k, bod dotyku je tedy přímo bod M.`;
    mainMistake = `Sestrojená přímka není kolmá k poloměru SM v bodě dotyku M.`;
    nextStep = `Sestroj přímku SM a v bodě M vztyč kolmici.`;
  } else if (taskType === 'interior') {
    correctItem = `Správně jsi zobrazil body S a M.`;
    mainMistake = `Bod M leží uvnitř kružnice (|SM| < r), proto z něj nelze vést reálnou tečnu.`;
    nextStep = `Klikni na tlačítko „Nemá řešení“.`;
  }

  return {
    correctItem,
    mainMistake,
    hint: getHintContent(taskType, hintLevel, report),
    studentQuestion: taskType === 'exterior'
      ? `Jaká věta nám pomůže najít všechny body v rovině, ze kterých je úsečka SM vidět pod pravým úhlem 90°?`
      : `Jaká je definice tečny ke kružnici v jejím bodě?`,
    nextActionableStep: nextStep,
  };
}

/**
 * Generates didactic hint according to progressive levels:
 * Level 1: Only geometric property or thought-provoking question
 * Level 2: Suggest suitable helper object (e.g. Thales circle, midpoint)
 * Level 3: Complete step-by-step procedure
 */
function getHintContent(taskType: string, level: HintLevel, report: ValidationReport): string {
  if (taskType === 'interior') {
    if (level <= 1) {
      return `Zamysli se nad definicí tečny: tečna má s kružnicí právě jeden společný bod. Může přímka procházející vnitřkem kružnice protnout kružnici jen v jednom bodě?`;
    }
    if (level === 2) {
      return `Porovnej vzdálenost bodu M od středu S s poloměrem r. Každá přímka procházející vnitřním bodem je sečnou.`;
    }
    return `Úplné řešení: Protože |SM| < r, bod M leží uvnitř kružnice. V rovině neexistuje žádná tečna ke kružnici procházející vnitřním bodem. Úloha nemá řešení – použij tlačítko „Nemá řešení“.`;
  }

  if (taskType === 'on_circle') {
    if (level <= 1) {
      return `Úroveň 1: Bod M leží přímo na kružnici k. Jaký úhel musí svírat tečna s poloměrem SM v bodě dotyku?`;
    }
    if (level === 2) {
      return `Úroveň 2: Pomocným objektem je poloměr (úsečka SM). Tečna v bodě dotyku je kolmicí k tomuto poloměru.`;
    }
    return `Úroveň 3 (Úplný postup): 1. Sestroj poloměr / přímku SM. 2. V bodě M sestroj kolmici k přímce SM. Tato kolmice je hledaná tečna t.`;
  }

  // Exterior point (standard Thales construction)
  if (level <= 1) {
    return `Úroveň 1 (Vlastnost): Tečna se dotýká kružnice v bodě T tak, že poloměr ST je kolmý na tečnu MT (úhel ∠STM = 90°). Hledáme tedy body T, ze kterých vidíme úsečku SM pod pravým úhlem.`;
  }

  if (level === 2) {
    return `Úroveň 2 (Pomocný objekt): Využij Thaletovu kružnici. Sestroj střed úsečky SM (označ ho S_SM) a načrtni kružnici τ se středem v tomto bodě a poloměrem |S_SM S|. Body dotyku T₁, T₂ vzniknou jako průsečíky této pomocné kružnice s původní kružnicí k.`;
  }

  // Level 3
  return `Úroveň 3 (Úplný postup konstrukce):
1. Sestroj úsečku SM a najdi její střed S_SM (např. pomocí osy úsečky).
2. Sestroj Thaletovu kružnici τ = k(S_SM, r = |S_SM S|).
3. Urči průsečíky kružnic: {T₁, T₂} = k ∩ τ.
4. Sestroj hledané tečny: přímku t₁ = MT₁ a přímku t₂ = MT₂.`;
}
