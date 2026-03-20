// Calculator categories
export const categories = {
    cardiovascular: 'Cardiovascular',
    renal: 'Renal',
    'critical-care': 'Critical Care',
    pediatric: 'Pediatric',
    'drug-conversion': 'Drug Conversion',
    infection: 'Infection',
    neurology: 'Neurology',
    respiratory: 'Respiratory',
    metabolic: 'Metabolic',
    hematology: 'Hematology',
    gastroenterology: 'Gastroenterology',
    obstetrics: 'Obstetrics',
    psychiatry: 'Psychiatry',
    general: 'General Medicine'
};
export const calculatorModules = [
    { id: '2helps2b', title: '2HELPS2B Score for Seizure Risk', category: 'neurology' },
    { id: '4as-delirium', title: "4 A's Test for Delirium", category: 'neurology' },
    { id: '4c-mortality-covid', title: '4C Mortality Score for COVID-19', category: 'infection' },
    {
        id: '4peps',
        title: '4-Level Pulmonary Embolism Clinical Probability Score (4PEPS)',
        category: 'cardiovascular'
    },
    {
        id: '4ts-hit',
        title: '4Ts Score for Heparin-Induced Thrombocytopenia (HIT)',
        category: 'hematology'
    },
    { id: '6mwd', title: '6-Minute Walk Distance (6MWD) Calculator', category: 'respiratory' },
    { id: 'abl', title: 'ABL90 FLEX Analyzer Calculator', category: 'general' },
    { id: 'abg-analyzer', title: 'ABG Analyzer', category: 'respiratory' },
    {
        id: 'action-icu',
        title: 'ACTION-ICU Risk Score for Intensive Care in NSTEMI',
        category: 'cardiovascular'
    },
    {
        id: 'af-risk',
        title: 'Atrial Fibrillation (AF) Risk Score (CHADVAS&HASBLED)',
        category: 'cardiovascular'
    },
    { id: 'apache-ii', title: 'APACHE II Score', category: 'critical-care' },
    { id: 'apgar', title: 'APGAR Score', category: 'pediatric' },
    {
        id: 'ariscat',
        title: 'ARISCAT Score for Postoperative Pulmonary Complications',
        category: 'respiratory'
    },
    { id: 'ascvd', title: 'ASCVD Risk Score (10-Year)', category: 'cardiovascular' },
    {
        id: 'bacterial-meningitis-score',
        title: 'Bacterial Meningitis Score for Children',
        category: 'pediatric'
    },
    {
        id: 'benzo-conversion',
        title: 'Benzodiazepine Conversion Calculator',
        category: 'drug-conversion'
    },
    { id: 'bmi-bsa', title: 'BMI and BSA Calculator', category: 'general' },
    { id: 'bwps', title: 'BWPS for Thyrotoxicosis', category: 'metabolic' },
    {
        id: 'calcium-correction',
        title: 'Corrected Calcium for Hypoalbuminemia',
        category: 'metabolic'
    },
    { id: 'caprini', title: 'Caprini Score for VTE Risk', category: 'cardiovascular' },
    { id: 'centor', title: 'Centor Score for Strep Pharyngitis', category: 'infection' },
    { id: 'charlson', title: 'Charlson Comorbidity Index (CCI)', category: 'general' },
    {
        id: 'child-pugh',
        title: 'Child-Pugh Score for Cirrhosis Mortality',
        category: 'gastroenterology'
    },
    { id: 'ciwa-ar', title: 'CIWA-Ar for Alcohol Withdrawal', category: 'psychiatry' },
    { id: 'ckd-epi', title: 'CKD-EPI GFR (2021)', category: 'renal' },
    {
        id: 'cpis',
        title: 'Clinical Pulmonary Infection Score (CPIS) for VAP',
        category: 'respiratory'
    },
    { id: 'crcl', title: 'Cockcroft-Gault Creatinine Clearance', category: 'renal' },
    { id: 'curb-65', title: 'CURB-65 Score for Pneumonia Severity', category: 'respiratory' },
    { id: 'dasi', title: 'Duke Activity Status Index (DASI)', category: 'cardiovascular' },
    { id: 'due-date', title: 'Due Date Calculator', category: 'obstetrics' },
    {
        id: 'ethanol-concentration',
        title: 'Ethanol Concentration Conversion',
        category: 'metabolic'
    },
    { id: 'ett', title: 'ETT Depth and Tidal Volume Calculator', category: 'respiratory' },
    {
        id: 'euroscore-ii',
        title: 'EuroSCORE II for Cardiac Surgery Mortality',
        category: 'cardiovascular'
    },
    { id: 'fena', title: 'Fractional Excretion of Sodium (FENa)', category: 'renal' },
    { id: 'feurea', title: 'Fractional Excretion of Urea (FEUrea)', category: 'renal' },
    { id: 'fib-4', title: 'FIB-4 Score for Liver Fibrosis', category: 'gastroenterology' },
    {
        id: 'free-water-deficit',
        title: 'Free Water Deficit in Hypernatremia',
        category: 'metabolic'
    },
    { id: 'gad-7', title: 'GAD-7 for Anxiety', category: 'psychiatry' },
    { id: 'gcs', title: 'Glasgow Coma Scale (GCS)', category: 'neurology' },
    {
        id: 'geneva-score',
        title: 'Geneva Score (Revised) for Pulmonary Embolism',
        category: 'cardiovascular'
    },
    { id: 'growth-chart', title: 'Pediatric Growth Chart', category: 'pediatric' },
    { id: 'grace-acs', title: 'GRACE ACS Risk Score', category: 'cardiovascular' },
    {
        id: 'gupta-mica',
        title: 'Gupta Perioperative Cardiac Risk (MICA)',
        category: 'cardiovascular'
    },
    { id: 'gwtg-hf', title: 'GWTG-HF Risk Score', category: 'cardiovascular' },
    { id: 'has-bled', title: 'HAS-BLED Score for Major Bleeding Risk', category: 'cardiovascular' },
    {
        id: 'heart-score',
        title: 'HEART Score for Major Cardiac Events',
        category: 'cardiovascular'
    },
    { id: 'homa-ir', title: 'HOMA-IR for Insulin Resistance', category: 'metabolic' },
    {
        id: 'hscore',
        title: 'HScore for Hemophagocytic Lymphohistiocytosis (HLH)',
        category: 'hematology'
    },
    { id: 'ibw', title: 'Ideal Body Weight (IBW) Calculator', category: 'general' },
    { id: 'intraop-fluid', title: 'Intraoperative Fluid Dosing Calculator', category: 'general' },
    { id: 'isth-dic', title: 'ISTH Criteria for DIC', category: 'hematology' },
    { id: 'kawasaki', title: 'Kawasaki Disease Diagnostic Criteria', category: 'pediatric' },
    { id: 'ldl', title: 'Friedewald Equation for LDL Cholesterol', category: 'cardiovascular' },
    { id: 'maintenance-fluids', title: 'Maintenance Fluids Calculator', category: 'pediatric' },
    { id: 'maggic', title: 'MAGGIC Risk Calculator for Heart Failure', category: 'cardiovascular' },
    { id: 'map', title: 'Mean Arterial Pressure (MAP)', category: 'general' },
    { id: 'mdrd-gfr', title: 'MDRD GFR Equation', category: 'renal' },
    {
        id: 'meld-na',
        title: 'MELD-Na Score for Liver Disease Severity',
        category: 'gastroenterology'
    },
    { id: 'mews', title: 'Modified Early Warning Score (MEWS)', category: 'critical-care' },
    {
        id: 'mme',
        title: 'Morphine Milligram Equivalent (MME) Calculator',
        category: 'drug-conversion'
    },
    { id: 'nafld-fibrosis-score', title: 'NAFLD Fibrosis Score', category: 'gastroenterology' },
    { id: 'nihss', title: 'NIH Stroke Scale (NIHSS)', category: 'neurology' },
    { id: 'padua-vte', title: 'Padua Prediction Score for VTE Risk', category: 'cardiovascular' },
    { id: 'pecarn', title: 'PECARN Head Trauma Rule for Children', category: 'pediatric' },
    {
        id: 'pediatric-bp',
        title: 'Pediatric Blood Pressure Percentile',
        category: 'pediatric'
    },
    { id: 'perc', title: 'PERC Rule for Pulmonary Embolism', category: 'cardiovascular' },
    {
        id: 'phenytoin-correction',
        title: 'Corrected Phenytoin for Hypoalbuminemia',
        category: 'neurology'
    },
    { id: 'phq-9', title: 'PHQ-9 for Depression', category: 'psychiatry' },
    { id: 'precise-hbr', title: 'PRECISE-HBR Score', category: 'cardiovascular' },
    { id: 'prevent-cvd', title: 'QRISK3-Based CVD Risk (UK)', category: 'cardiovascular' },
    { id: 'qsofa', title: 'qSOFA Score for Sepsis', category: 'critical-care' },
    { id: 'qtc', title: 'Corrected QT Interval (QTc)', category: 'cardiovascular' },
    {
        id: 'ranson',
        title: 'Ranson Criteria for Pancreatitis Mortality',
        category: 'gastroenterology'
    },
    { id: 'rcri', title: 'Revised Cardiac Risk Index (RCRI)', category: 'cardiovascular' },
    { id: 'regiscar', title: 'RegiSCAR Score for DRESS', category: 'general' },
    {
        id: 'score2-diabetes',
        title: 'SCORE2-Diabetes for 10-Year CVD Risk',
        category: 'cardiovascular'
    },
    { id: 'serum-anion-gap', title: 'Serum Anion Gap', category: 'metabolic' },
    { id: 'serum-osmolality', title: 'Serum Osmolality', category: 'metabolic' },
    {
        id: 'sex-shock',
        title: 'SEX-SHOCK Risk Score for Cardiogenic Shock',
        category: 'cardiovascular'
    },
    {
        id: 'sirs',
        title: 'SIRS Criteria for Systemic Inflammatory Response',
        category: 'critical-care'
    },
    { id: 'sodium-correction', title: 'Corrected Sodium for Hyperglycemia', category: 'metabolic' },
    { id: 'sofa', title: 'SOFA Score for Sepsis Organ Failure', category: 'critical-care' },
    {
        id: 'steroid-conversion',
        title: 'Corticosteroid Conversion Calculator',
        category: 'drug-conversion'
    },
    { id: 'stop-bang', title: 'STOP-BANG for Obstructive Sleep Apnea', category: 'respiratory' },
    { id: 'timi-nstemi', title: 'TIMI Risk Score for UA/NSTEMI', category: 'cardiovascular' },
    { id: 'tpa-dosing-stroke', title: 'tPA Dosing for Acute Stroke', category: 'neurology' },
    { id: 'tpa-dosing', title: 'tPA Dosing for PE and MI', category: 'cardiovascular' },
    { id: 'ttkg', title: 'Transtubular Potassium Gradient (TTKG)', category: 'renal' },
    {
        id: 'trade-off-analysis',
        title: 'Risk Trade-off Analysis (Bleeding vs. Ischemic)',
        category: 'cardiovascular'
    },
    { id: 'wells-dvt', title: 'Wells Criteria for DVT', category: 'cardiovascular' },
    { id: 'wells-pe', title: 'Wells Criteria for PE', category: 'cardiovascular' }
].sort((a, b) => a.title.localeCompare(b.title));
/**
 * Dynamically load a calculator module
 * @param calculatorId - The calculator ID
 * @returns The calculator module
 */
export async function loadCalculator(calculatorId) {
    try {
        const version = Date.now();
        // 修正：因為 index.js 已經在 js/calculators 裡了
        // 直接指向子資料夾即可，不要再寫一次 js/calculators
        const module = await import(`./${calculatorId}/index.js?v=${version}`);
        if (module.default)
            return module.default;
        const calculator = Object.values(module).find((val) => val && typeof val.generateHTML === 'function');
        if (!calculator)
            throw new Error(`Invalid structure: ${calculatorId}`);
        return calculator;
    }
    catch (error) {
        console.error(`載入計算器失敗: ${calculatorId}`, error);
        throw error;
    }
}
/**
 * Check if a calculator module exists
 * @param calculatorId - The calculator ID
 * @returns Whether the calculator exists
 */
export function calculatorExists(calculatorId) {
    return calculatorModules.some(calc => calc.id === calculatorId);
}
/**
 * Get calculator metadata by ID
 * @param calculatorId - The calculator ID
 * @returns Calculator metadata or null
 */
export function getCalculatorMetadata(calculatorId) {
    return calculatorModules.find(calc => calc.id === calculatorId) || null;
}
/**
 * Get calculators by category
 * @param category - The category name
 * @returns Array of calculator metadata
 */
export function getCalculatorsByCategory(category) {
    if (category === 'all' || !category) {
        return calculatorModules;
    }
    return calculatorModules.filter(calc => calc.category === category);
}
