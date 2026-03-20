import { LOINC_CODES } from './fhir-codes.js';
/**
 * Mapping of LOINC Code Keys to Text Names
 * This allows looking up the "Hospital Text Name" for a given LOINC code.
 * Values are primarily based on common EMR display names.
 */
export const LAB_NAME_MAPPING = {
    // Vital Signs
    SYSTOLIC_BP: { primary: 'Systolic Blood Pressure', aliases: ['SBP', 'Systolic BP'] },
    DIASTOLIC_BP: { primary: 'Diastolic Blood Pressure', aliases: ['DBP', 'Diastolic BP'] },
    BP_PANEL: { primary: 'Blood Pressure Panel', aliases: ['BP'] },
    HEART_RATE: { primary: 'Heart Rate', aliases: ['Pulse', 'HR'] },
    RESPIRATORY_RATE: { primary: 'Respiratory Rate', aliases: ['RR'] },
    TEMPERATURE: { primary: 'Temperature', aliases: ['Temp', 'Body Temp'] },
    OXYGEN_SATURATION: { primary: 'SpO2', aliases: ['O2 Sat', 'Pulse Ox'] },
    OXYGEN_SATURATION_ARTERIAL: { primary: 'SaO2', aliases: ['Arterial O2 Sat'] },
    // Body Measurements
    HEIGHT: { primary: 'Height', aliases: ['Body Height', 'Stature'] },
    WEIGHT: { primary: 'Weight', aliases: ['Body Weight'] },
    BMI: { primary: 'BMI', aliases: ['Body Mass Index'] },
    HEAD_CIRCUMFERENCE: { primary: 'Head Circumference', aliases: ['HC'] },
    // Laboratory - Hematology
    HEMOGLOBIN: { primary: 'Hemoglobin', aliases: ['Hgb', 'Hb'] },
    HEMATOCRIT: { primary: 'Hematocrit', aliases: ['Hct'] },
    WBC: { primary: 'WBC', aliases: ['White Blood Count', 'Leukocytes'] },
    PLATELETS: { primary: 'Platelets', aliases: ['Plt', 'Platelet Count'] },
    PLATELETS_ALT: { primary: 'Platelets (Blood)', aliases: ['Plt'] },
    EOSINOPHILS: { primary: 'Eosinophils', aliases: ['Eos'] },
    // Laboratory - Chemistry
    SODIUM: { primary: 'Sodium', aliases: ['Na'] },
    POTASSIUM: { primary: 'Potassium', aliases: ['K'] },
    CHLORIDE: { primary: 'Chloride', aliases: ['Cl'] },
    BICARBONATE: { primary: 'Bicarbonate', aliases: ['HCO3'] },
    CO2: { primary: 'CO2', aliases: ['Carbon Dioxide'] },
    BUN: { primary: 'BUN', aliases: ['Blood Urea Nitrogen'] },
    BUN_ALT: { primary: 'BUN', aliases: [] },
    CREATININE: { primary: 'Creatinine', aliases: ['Cr', 'Creat'] },
    GLUCOSE: { primary: 'Glucose', aliases: ['Glu', 'Blood Sugar'] },
    CALCIUM: { primary: 'Calcium', aliases: ['Ca'] },
    MAGNESIUM: { primary: 'Magnesium', aliases: ['Mg'] },
    PHOSPHATE: { primary: 'Phosphate', aliases: ['Phos', 'PO4'] },
    ALBUMIN: { primary: 'Albumin', aliases: ['Alb'] },
    // Laboratory - Liver Function
    BILIRUBIN_TOTAL: { primary: 'Total Bilirubin', aliases: ['T-Bil', 'Bili Total'] },
    BILIRUBIN_DIRECT: { primary: 'Direct Bilirubin', aliases: ['D-Bil'] },
    AST: { primary: 'AST', aliases: ['SGOT'] },
    ALT: { primary: 'ALT', aliases: ['SGPT'] },
    ALP: { primary: 'ALP', aliases: ['Alk Phos', 'Alkaline Phosphatase'] },
    GGT: { primary: 'GGT', aliases: [] },
    ALBUMIN_SERUM: { primary: 'Albumin (Serum)', aliases: [] },
    TOTAL_PROTEIN: { primary: 'Total Protein', aliases: ['TP'] },
    INR: { primary: 'INR', aliases: ['International Normalized Ratio'] },
    // Laboratory - Lipid Panel
    CHOLESTEROL_TOTAL: { primary: 'Total Cholesterol', aliases: ['Chol', 'T-Chol'] },
    HDL: { primary: 'HDL', aliases: ['HDL-C'] },
    LDL: { primary: 'LDL', aliases: ['LDL-C'] },
    TRIGLYCERIDES: { primary: 'Triglycerides', aliases: ['TG', 'Trigs'] },
    // Laboratory - Renal Function
    EGFR: { primary: 'eGFR', aliases: ['GFR'] },
    URINE_POTASSIUM: { primary: 'Urine Potassium', aliases: ['U-K'] },
    SERUM_OSMOLALITY: { primary: 'Serum Osmolality', aliases: [] },
    URINE_OSMOLALITY: { primary: 'Urine Osmolality', aliases: [] },
    URINE_SODIUM: { primary: 'Urine Sodium', aliases: ['U-Na'] },
    URINE_CREATININE: { primary: 'Urine Creatinine', aliases: ['U-Cr'] },
    // Laboratory - Inflammatory Markers
    CRP: { primary: 'CRP', aliases: ['C-Reactive Protein'] },
    ESR: { primary: 'ESR', aliases: ['Sed Rate'] },
    PROCALCITONIN: { primary: 'Procalcitonin', aliases: ['PCT'] },
    // Laboratory - Cardiac Markers
    TROPONIN_I: { primary: 'Troponin I', aliases: ['Trop I', 'TnI'] },
    TROPONIN_T: { primary: 'Troponin T', aliases: ['Trop T', 'TnT'] },
    TROPONIN_T_HIGH: { primary: 'High Sensitivity Troponin T', aliases: ['hs-TnT'] },
    TROPONIN_I_HIGH: { primary: 'High Sensitivity Troponin I', aliases: ['hs-TnI'] },
    TROPONIN_ALT: { primary: 'Troponin', aliases: [] },
    BNP: { primary: 'BNP', aliases: [] },
    NT_PRO_BNP: { primary: 'NT-proBNP', aliases: [] },
    // Laboratory - Coagulation
    PT: { primary: 'PT', aliases: ['Prothrombin Time'] },
    PTT: { primary: 'PTT', aliases: ['aPTT'] },
    INR_COAG: { primary: 'INR (Coag)', aliases: [] },
    FIBRINOGEN: { primary: 'Fibrinogen', aliases: ['Fib'] },
    D_DIMER: { primary: 'D-Dimer', aliases: [] },
    // Laboratory - Arterial Blood Gas
    PH: { primary: 'pH', aliases: [] },
    PCO2: { primary: 'pCO2', aliases: [] },
    PO2: { primary: 'pO2', aliases: [] },
    PaO2_FiO2: { primary: 'PaO2/FiO2 Ratio', aliases: ['P/F Ratio'] },
    HCO3: { primary: 'HCO3', aliases: ['Bicarb'] },
    BASE_EXCESS: { primary: 'Base Excess', aliases: ['BE'] },
    LACTATE: { primary: 'Lactate', aliases: ['Lac'] },
    FIO2: { primary: 'FiO2', aliases: [] },
    // Cardiac Measurements
    QT_INTERVAL: { primary: 'QT Interval', aliases: ['QT'] },
    LVEF: {
        primary: 'LVEF',
        aliases: ['Ejection Fraction', 'EF', 'Left Ventricular Ejection Fraction']
    },
    LVEF_2D: { primary: 'LVEF (2D Echo)', aliases: ['EF 2D'] },
    PA_SYSTOLIC_PRESSURE: {
        primary: 'PA Systolic Pressure',
        aliases: ['PASP', 'Pulmonary Artery Pressure']
    },
    PA_MEAN_PRESSURE: { primary: 'PA Mean Pressure', aliases: ['PAMP', 'Mean PA Pressure'] },
    // Laboratory - Other
    HBA1C: { primary: 'HbA1c', aliases: ['A1c', 'Glycated Hemoglobin'] },
    TSH: { primary: 'TSH', aliases: [] },
    FREE_T4: { primary: 'Free T4', aliases: ['FT4'] },
    CORTISOL: { primary: 'Cortisol', aliases: [] },
    URIC_ACID: { primary: 'Uric Acid', aliases: ['UA'] },
    AMYLASE: { primary: 'Amylase', aliases: ['Amy'] },
    LIPASE: { primary: 'Lipase', aliases: ['Lip'] },
    LDH: { primary: 'LDH', aliases: [] },
    CULTURE: { primary: 'Culture', aliases: [] },
    ETHANOL: { primary: 'Ethanol', aliases: ['ETOH', 'Alcohol'] },
    FERRITIN: { primary: 'Ferritin', aliases: [] },
    VITAMIN_D: { primary: 'Vitamin D', aliases: ['Vit D', '25-OH Vit D'] },
    CSF_GRAM_STAIN: { primary: 'CSF Gram Stain', aliases: ['Gram Stain CSF'] },
    CSF_ANC: {
        primary: 'CSF ANC',
        aliases: ['CSF Neutrophils', 'Cerebrospinal Fluid Neutrophils']
    },
    CSF_PROTEIN: { primary: 'CSF Protein', aliases: ['Cerebrospinal Fluid Protein'] },
    NEUTROPHILS_ABSOLUTE: { primary: 'Absolute Neutrophil Count', aliases: ['ANC', 'Neutrophils'] },
    URINE_UREA_NITROGEN: { primary: 'Urine Urea Nitrogen', aliases: ['UUN', 'Urine Urea'] },
    // Clinical Assessments
    GCS: { primary: 'GCS', aliases: ['Glasgow Coma Scale'] },
    PAIN_SCORE: { primary: 'Pain Score', aliases: [] },
    APGAR_1MIN: { primary: 'Apgar 1 min', aliases: [] },
    APGAR_5MIN: { primary: 'Apgar 5 min', aliases: [] },
    SMOKING_STATUS: { primary: 'Smoking Status', aliases: [] },
    // Other Observations
    UREA: { primary: 'Urea', aliases: [] },
    BLOOD_TYPE: { primary: 'Blood Type', aliases: ['ABO/Rh'] },
    RH_FACTOR: { primary: 'Rh Factor', aliases: [] }
};
/**
 * Get the text name for a given LOINC code.
 * @param loincCode The LOINC code (e.g., '8480-6')
 * @returns The primary text name if found, otherwise null
 */
export function getTextNameByLoinc(loincCode) {
    // Find the key in LOINC_CODES that matches the value
    const entry = Object.entries(LOINC_CODES).find(([, value]) => {
        // Handle comma-separated codes with exact matching
        const codes = value.split(',').map(c => c.trim());
        return codes.includes(loincCode);
    });
    if (!entry)
        return null;
    const key = entry[0];
    const mapping = LAB_NAME_MAPPING[key];
    return mapping ? mapping.primary : null;
}
/**
 * Get the LOINC code for a given text name (case-insensitive fuzzy match).
 * @param textName The text name to search for (e.g., 'Hemoglobin')
 * @returns The corresponding LOINC code if found, otherwise null
 */
export function getLoincByTextName(textName) {
    if (!textName)
        return null;
    const search = textName.toLowerCase().trim();
    // Iterate through mappings to find a match
    const match = Object.entries(LAB_NAME_MAPPING).find(([, def]) => {
        if (def.primary.toLowerCase() === search)
            return true;
        if (def.aliases && def.aliases.some(alias => alias.toLowerCase() === search))
            return true;
        return false;
    });
    if (match) {
        const key = match[0];
        return LOINC_CODES[key] || null;
    }
    return null;
}
export default {
    LAB_NAME_MAPPING,
    getTextNameByLoinc,
    getLoincByTextName
};
