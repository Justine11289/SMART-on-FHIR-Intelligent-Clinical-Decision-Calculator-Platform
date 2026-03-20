// Centralized management of LOINC and SNOMED CT codes
/**
 * LOINC Codes Registry
 * Standard codes for laboratory and clinical observations
 * Reference: https://loinc.org/
 */
export const LOINC_CODES = {
    // Vital Signs
    SYSTOLIC_BP: '8480-6', // Systolic blood pressure
    DIASTOLIC_BP: '8462-4', // Diastolic blood pressure
    BP_PANEL: '85354-9,55284-4', // Blood pressure panel
    HEART_RATE: '8867-4', // Heart rate
    RESPIRATORY_RATE: '9279-1', // Respiratory rate
    TEMPERATURE: '8310-5,8331-1', // Body temperature (and Oral)
    OXYGEN_SATURATION: '59408-5', // Oxygen saturation (Pulse Ox)
    OXYGEN_SATURATION_ARTERIAL: '2708-6', // Oxygen saturation (Arterial)
    // Body Measurements
    HEIGHT: '8302-2', // Body height
    WEIGHT: '29463-7', // Body weight
    BMI: '39156-5', // Body mass index
    HEAD_CIRCUMFERENCE: '8287-5', // Head circumference
    // Laboratory - Hematology
    HEMOGLOBIN: '718-7', // Hemoglobin
    HEMATOCRIT: '4544-3', // Hematocrit
    WBC: '6690-2', // White blood cells
    PLATELETS: '777-3', // Platelets (automated count)
    PLATELET_COUNT: '777-3', // Alias for Platelets
    PLATELETS_ALT: '26515-7', // Platelets (in blood)
    EOSINOPHILS: '26478-8', // Eosinophils
    // Laboratory - Chemistry
    SODIUM: '2951-2', // Sodium
    POTASSIUM: '2823-3', // Potassium
    CHLORIDE: '2075-0', // Chloride
    BICARBONATE: '1963-8', // Bicarbonate (serum)
    CO2: '2028-9', // Carbon dioxide
    BUN: '3094-0', // Blood urea nitrogen
    BUN_ALT: '6299-8', // BUN (alternative code)
    CREATININE: '2160-0', // Creatinine
    GLUCOSE: '2345-7', // Glucose
    CALCIUM: '17861-6', // Calcium
    MAGNESIUM: '2601-3', // Magnesium
    PHOSPHATE: '2777-1', // Phosphate
    ALBUMIN: '1751-7', // Albumin
    // Specialized Tests
    INSULIN_LEVEL: '20448-7', // Fasting Insulin
    FASTING_GLUCOSE: '2339-0', // Fasting Glucose
    // Laboratory - Liver Function
    BILIRUBIN_TOTAL: '1975-2', // Bilirubin total
    BILIRUBIN_DIRECT: '1968-7', // Bilirubin direct
    AST: '1920-8', // AST (SGOT)
    ALT: '1742-6', // ALT (SGPT)
    ALP: '6768-6', // Alkaline phosphatase
    GGT: '2324-2', // Gamma glutamyl transferase
    ALBUMIN_SERUM: '1751-7', // Albumin serum
    TOTAL_PROTEIN: '2885-2', // Total protein
    INR: '6301-6', // INR
    // Laboratory - Lipid Panel
    CHOLESTEROL_TOTAL: '2093-3', // Cholesterol total
    HDL: '2085-9', // HDL cholesterol
    LDL: '2089-1', // LDL cholesterol
    TRIGLYCERIDES: '2571-8', // Triglycerides
    // Laboratory - Renal Function
    EGFR: '33914-3', // eGFR
    URINE_POTASSIUM: '2829-0', // Urine potassium
    SERUM_OSMOLALITY: '2695-6', // Serum osmolality
    URINE_OSMOLALITY: '2697-2', // Urine osmolality
    URINE_SODIUM: '2828-2,2955-3', // Urine sodium
    URINE_CREATININE: '2161-8', // Urine creatinine
    URINE_UREA_NITROGEN: '3095-7', // Urine Urea Nitrogen
    // Laboratory - Inflammatory Markers
    CRP: '1988-5', // C-reactive protein
    ESR: '4537-7', // Erythrocyte sedimentation rate
    PROCALCITONIN: '33959-8', // Procalcitonin
    // Laboratory - Cardiac Markers
    TROPONIN_I: '10839-9', // Troponin I
    TROPONIN_T: '6598-7', // Troponin T
    TROPONIN_T_HIGH: '30239-8', // Troponin T high sensitivity
    TROPONIN_I_HIGH: '15056-5', // Troponin I high sensitivity
    TROPONIN_ALT: '32195-5', // Troponin (alternative)
    BNP: '30934-4', // BNP
    NT_PRO_BNP: '33762-6', // NT-proBNP
    // Laboratory - Coagulation
    PT: '5902-2', // Prothrombin time
    PTT: '14979-9', // Partial thromboplastin time
    INR_COAG: '34714-6', // INR from coagulation panel
    FIBRINOGEN: '3255-7', // Fibrinogen
    D_DIMER: '48065-7', // D-dimer
    // Laboratory - Arterial Blood Gas
    PH: '2744-1', // pH
    PCO2: '2019-8', // pCO2
    PO2: '2703-7', // pO2
    PaO2_FiO2: '50984-4', // PaO2/FiO2 ratio
    HCO3: '1960-4', // Bicarbonate
    BASE_EXCESS: '1925-7', // Base excess
    LACTATE: '2524-7', // Lactate
    FIO2: '3150-0', // Inhaled oxygen concentration
    // Cardiac Measurements
    QT_INTERVAL: '8633-1', // QT interval (raw)
    LVEF: '10230-1', // Left ventricular ejection fraction
    LVEF_2D: '18043-0', // LVEF by 2D Echo
    PA_SYSTOLIC_PRESSURE: '8480-6', // Pulmonary artery systolic pressure
    PA_MEAN_PRESSURE: '8414-5', // Pulmonary artery mean pressure
    // Laboratory - Other
    HBA1C: '4548-4', // Hemoglobin A1c
    TSH: '3016-3', // Thyroid stimulating hormone
    FREE_T4: '3053-6', // Free T4
    CORTISOL: '2143-6', // Cortisol
    URIC_ACID: '3084-1', // Uric acid
    AMYLASE: '1798-8', // Amylase
    LIPASE: '3040-3', // Lipase
    LDH: '2532-0', // Lactate dehydrogenase
    CULTURE: '630-4', // Bacteria identified in Unspecified specimen by Culture
    ETHANOL: '49765-1', // Ethanol concentration
    FERRITIN: '2276-4', // Ferritin
    VITAMIN_D: '1989-3', // Vitamin D 25-hydroxy
    CSF_GRAM_STAIN: '664-3', // Microscopic observation [Identifier] in Cerebrospinal fluid by Gram stain
    CSF_ANC: '26485-3', // Neutrophils [#/volume] in Cerebrospinal fluid
    CSF_PROTEIN: '3137-7', // Protein [Mass/volume] in Cerebrospinal fluid
    NEUTROPHILS_ABSOLUTE: '751-8', // Neutrophils [#/volume] in Blood
    // Clinical Assessments
    GCS: '9269-2', // Glasgow Coma Scale
    PAIN_SCORE: '72514-3', // Pain severity
    APGAR_1MIN: '9272-6', // Apgar score 1 minute
    APGAR_5MIN: '9274-2', // Apgar score 5 minute
    SMOKING_STATUS: '72166-2', // Smoking status
    // Other Observations
    UREA: '3094-0', // Urea
    BLOOD_TYPE: '882-1', // Blood type
    RH_FACTOR: '10331-7', // Rh factor
    ASA_PHYSICAL_STATUS: '11368-0' // ASA Physical Status Class
};
/**
 * SNOMED CT Codes Registry
 * Standard codes for clinical conditions and procedures
 * Reference: https://www.snomed.org/
 */
export const SNOMED_CODES = {
    // Cardiovascular Conditions
    HYPERTENSION: '38341003',
    CORONARY_ARTERY_DISEASE: '53741008',
    MYOCARDIAL_INFARCTION: '22298006',
    HEART_FAILURE: '84114007',
    CONGESTIVE_HEART_FAILURE: '42343007',
    ATRIAL_FIBRILLATION: '49436004',
    STROKE: '230690007',
    TIA: '266257000',
    PERIPHERAL_ARTERY_DISEASE: '399957001',
    CARDIOGENIC_SHOCK: '27885002',
    ACUTE_CORONARY_SYNDROME: '394659003',
    ENDOCARDITIS: '56819008',
    PULMONARY_HYPERTENSION: '70995007',
    PREVIOUS_CARDIAC_SURGERY: '232717009', // CABG as marker
    DEEP_VEIN_THROMBOSIS: '128053003', // DVT
    CARDIAC_ARREST: '410429000',
    // Respiratory Conditions
    COPD: '13645005',
    ASTHMA: '195967001',
    PNEUMONIA: '233604007',
    PULMONARY_EMBOLISM: '59282003',
    RESPIRATORY_FAILURE: '409622000',
    SLEEP_APNEA: '78275009',
    // Metabolic/Endocrine
    DIABETES_MELLITUS: '73211009',
    DIABETES_TYPE_1: '46635009',
    DIABETES_TYPE_2: '44054006',
    HYPERLIPIDEMIA: '55822004',
    OBESITY: '414915002',
    HYPOTHYROIDISM: '40930008',
    HYPERTHYROIDISM: '34486009',
    // Renal Conditions
    CHRONIC_KIDNEY_DISEASE: '709044004',
    ACUTE_KIDNEY_INJURY: '14669001',
    END_STAGE_RENAL_DISEASE: '46177005',
    DIALYSIS_DEPENDENT: '429451001',
    // Liver Conditions
    CIRRHOSIS: '19943007',
    LIVER_FAILURE: '59927004',
    HEPATITIS: '40468003',
    ALCOHOLIC_LIVER_DISEASE: '41309000',
    // Hematological
    ANEMIA: '271737000',
    BLEEDING_DISORDER: '64779008',
    THROMBOCYTOPENIA: '415116008',
    ANTICOAGULATION_THERAPY: '281789004',
    // Neurological
    DEMENTIA: '52448006',
    EPILEPSY: '84757009',
    PARKINSONS_DISEASE: '49049000',
    MULTIPLE_SCLEROSIS: '24700007',
    PARALYSIS: '166001',
    // Malignancies
    MALIGNANCY: '363346000',
    METASTATIC_CANCER: '94225005',
    LEUKEMIA: '93143009',
    LYMPHOMA: '118600007',
    // Infections
    SEPSIS: '91302008',
    HIV: '86406008',
    TUBERCULOSIS: '56717001',
    COVID_19: '840539006',
    // Substance Use
    SMOKING: '77176002',
    ALCOHOL_ABUSE: '7200002',
    DRUG_ABUSE: '66214007',
    // Procedures
    PACEMAKER: '14106009',
    CABG: '232717009',
    PCI: '415070008',
    VALVE_SURGERY: '119978007',
    TRANSPLANT: '77465005',
    // Risk Factors
    FAMILY_HISTORY_CAD: '266897004',
    PREVIOUS_MI: '399211009',
    PREVIOUS_STROKE: '161505003',
    PREVIOUS_BLEEDING: '131148009',
    ISCHEMIC_HEART_DISEASE: '414545008',
    FRACTURE: '125605004',
    HEMOPTYSIS: '66857006',
    CONNECTIVE_TISSUE_DISEASE: '105969002',
    PEPTIC_ULCER_DISEASE: '13200003',
    HEMIPLEGIA: '50582007',
    AIDS: '62479008',
    SEIZURE: '91175000',
    POSITIVE_RESULT: '260348003',
    HISTORY_OF_VTE: '451574005'
};
/**
 * ICD-10 Codes Registry
 * International Classification of Diseases, 10th Revision
 * Reference: https://www.who.int/standards/classifications/classification-of-diseases
 */
export const ICD10_CODES = {
    // Cardiovascular Conditions
    HYPERTENSION: 'I10',
    CORONARY_ARTERY_DISEASE: 'I25.10',
    MYOCARDIAL_INFARCTION: 'I21.9',
    ACUTE_MI_STEMI: 'I21.3',
    ACUTE_MI_NSTEMI: 'I21.4',
    HEART_FAILURE: 'I50.9',
    CONGESTIVE_HEART_FAILURE: 'I50.0',
    ATRIAL_FIBRILLATION: 'I48.91',
    STROKE: 'I63.9',
    ISCHEMIC_STROKE: 'I63.9',
    HEMORRHAGIC_STROKE: 'I61.9',
    TIA: 'G45.9',
    PERIPHERAL_ARTERY_DISEASE: 'I73.9',
    CARDIOGENIC_SHOCK: 'R57.0',
    ACUTE_CORONARY_SYNDROME: 'I24.9',
    ENDOCARDITIS: 'I33.0',
    PULMONARY_HYPERTENSION: 'I27.0',
    DEEP_VEIN_THROMBOSIS: 'I82.40',
    CARDIAC_ARREST: 'I46.9',
    ISCHEMIC_HEART_DISEASE: 'I25.9',
    // Respiratory Conditions
    COPD: 'J44.9',
    ASTHMA: 'J45.909',
    PNEUMONIA: 'J18.9',
    PULMONARY_EMBOLISM: 'I26.99',
    RESPIRATORY_FAILURE: 'J96.90',
    SLEEP_APNEA: 'G47.30',
    // Metabolic/Endocrine
    DIABETES_MELLITUS: 'E11.9',
    DIABETES_TYPE_1: 'E10.9',
    DIABETES_TYPE_2: 'E11.9',
    DIABETES_WITH_CKD: 'E11.22',
    HYPERLIPIDEMIA: 'E78.5',
    OBESITY: 'E66.9',
    HYPOTHYROIDISM: 'E03.9',
    HYPERTHYROIDISM: 'E05.90',
    // Renal Conditions
    CHRONIC_KIDNEY_DISEASE: 'N18.9',
    CKD_STAGE_1: 'N18.1',
    CKD_STAGE_2: 'N18.2',
    CKD_STAGE_3: 'N18.3',
    CKD_STAGE_4: 'N18.4',
    CKD_STAGE_5: 'N18.5',
    ACUTE_KIDNEY_INJURY: 'N17.9',
    END_STAGE_RENAL_DISEASE: 'N18.6',
    DIALYSIS_DEPENDENT: 'Z99.2',
    // Liver Conditions
    CIRRHOSIS: 'K74.60',
    LIVER_FAILURE: 'K72.90',
    HEPATITIS: 'K75.9',
    ALCOHOLIC_LIVER_DISEASE: 'K70.9',
    // Hematological
    ANEMIA: 'D64.9',
    BLEEDING_DISORDER: 'D68.9',
    THROMBOCYTOPENIA: 'D69.6',
    // Neurological
    DEMENTIA: 'F03.90',
    EPILEPSY: 'G40.909',
    PARKINSONS_DISEASE: 'G20',
    MULTIPLE_SCLEROSIS: 'G35',
    PARALYSIS: 'G83.9',
    HEMIPLEGIA: 'G81.90',
    SEIZURE: 'R56.9',
    // Malignancies
    MALIGNANCY: 'C80.1',
    METASTATIC_CANCER: 'C79.9',
    LEUKEMIA: 'C95.90',
    LYMPHOMA: 'C85.90',
    // Infections
    SEPSIS: 'A41.9',
    HIV: 'B20',
    AIDS: 'B20',
    TUBERCULOSIS: 'A16.9',
    COVID_19: 'U07.1',
    // Substance Use
    SMOKING: 'F17.210',
    TOBACCO_USE: 'Z72.0',
    ALCOHOL_ABUSE: 'F10.10',
    DRUG_ABUSE: 'F19.10',
    // Other Conditions
    CONNECTIVE_TISSUE_DISEASE: 'M35.9',
    PEPTIC_ULCER_DISEASE: 'K27.9',
    FRACTURE: 'T14.8',
    HEMOPTYSIS: 'R04.2'
};
/**
 * SNOMED to ICD-10 Mapping
 * Maps SNOMED CT codes to their ICD-10 equivalents
 */
export const SNOMED_TO_ICD10_MAP = {
    // Cardiovascular
    '38341003': 'I10', // Hypertension
    '53741008': 'I25.10', // CAD
    '22298006': 'I21.9', // MI
    '84114007': 'I50.9', // Heart failure
    '42343007': 'I50.0', // CHF
    '49436004': 'I48.91', // AFib
    '230690007': 'I63.9', // Stroke
    '266257000': 'G45.9', // TIA
    '399957001': 'I73.9', // PAD
    '27885002': 'R57.0', // Cardiogenic shock
    '394659003': 'I24.9', // ACS
    '128053003': 'I82.40', // DVT
    '410429000': 'I46.9', // Cardiac arrest
    '414545008': 'I25.9', // Ischemic heart disease
    // Respiratory
    '13645005': 'J44.9', // COPD
    '195967001': 'J45.909', // Asthma
    '233604007': 'J18.9', // Pneumonia
    '59282003': 'I26.99', // PE
    '409622000': 'J96.90', // Respiratory failure
    // Metabolic
    '73211009': 'E11.9', // DM
    '46635009': 'E10.9', // Type 1 DM
    '44054006': 'E11.9', // Type 2 DM
    '55822004': 'E78.5', // Hyperlipidemia
    '414915002': 'E66.9', // Obesity
    // Renal
    '709044004': 'N18.9', // CKD
    '14669001': 'N17.9', // AKI
    '46177005': 'N18.6', // ESRD
    // Liver
    '19943007': 'K74.60', // Cirrhosis
    '59927004': 'K72.90', // Liver failure
    // Hematological
    '271737000': 'D64.9', // Anemia
    '64779008': 'D68.9', // Bleeding disorder
    '415116008': 'D69.6', // Thrombocytopenia
    // Neurological
    '52448006': 'F03.90', // Dementia
    '84757009': 'G40.909', // Epilepsy
    '49049000': 'G20', // Parkinson's
    '50582007': 'G81.90', // Hemiplegia
    // Malignancies
    '363346000': 'C80.1', // Malignancy
    '94225005': 'C79.9', // Metastatic cancer
    // Infections
    '91302008': 'A41.9', // Sepsis
    '86406008': 'B20', // HIV
    '840539006': 'U07.1' // COVID-19
};
/**
 * RxNorm Codes Registry
 * Standard codes for medications
 * Reference: https://www.nlm.nih.gov/research/umls/rxnorm/
 */
export const RXNORM_CODES = {
    // Antiplatelets
    ASPIRIN: '1191',
    CLOPIDOGREL: '32968',
    TICAGRELOR: '1116632',
    PRASUGREL: '855812',
    // Anticoagulants
    WARFARIN: '11289',
    HEPARIN: '5224',
    ENOXAPARIN: '67108',
    RIVAROXABAN: '1114195',
    APIXABAN: '1364430',
    DABIGATRAN: '1037042',
    EDOXABAN: '1599538',
    // Diabetic Medications
    INSULIN: '274783',
    // NSAIDs
    IBUPROFEN: '5640',
    NAPROXEN: '7258',
    DICLOFENAC: '3355',
    KETOROLAC: '6130',
    INDOMETHACIN: '5775',
    MELOXICAM: '6835',
    CELECOXIB: '202472',
    // Corticosteroids
    PREDNISONE: '8640',
    PREDNISOLONE: '8638',
    METHYLPREDNISOLONE: '6902',
    DEXAMETHASONE: '3264',
    HYDROCORTISONE: '5492',
    TRIAMCINOLONE: '10759',
    // P2Y12 Inhibitors (alias for common names)
    P2Y12_INHIBITOR: '32968,1116632,855812', // Clopidogrel, Ticagrelor, Prasugrel
    // Beta Blockers
    METOPROLOL: '6918',
    CARVEDILOL: '20352',
    BISOPROLOL: '16154',
    ATENOLOL: '1202',
    PROPRANOLOL: '8787',
    LABETALOL: '6221',
    // ACE Inhibitors
    LISINOPRIL: '29046',
    ENALAPRIL: '3827',
    RAMIPRIL: '35296',
    CAPTOPRIL: '1998',
    BENAZEPRIL: '1886',
    // ARBs (Angiotensin II Receptor Blockers)
    LOSARTAN: '52175',
    VALSARTAN: '69749',
    CANDESARTAN: '83367',
    IRBESARTAN: '83515',
    OLMESARTAN: '259255'
};
/**
 * Get LOINC code by common name
 * @param {string} name - Common name of the observation
 * @returns {string|null} - LOINC code or null if not found
 */
export function getLoincCode(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return LOINC_CODES[upperName] || null;
}
/**
 * Get SNOMED code by condition name
 * @param {string} name - Common name of the condition
 * @returns {string|null} - SNOMED code or null if not found
 */
export function getSnomedCode(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return SNOMED_CODES[upperName] || null;
}
/**
 * Get descriptive name for a LOINC code
 * @param {string} code - LOINC code
 * @returns {string|null} - Descriptive name or null if not found
 */
export function getLoincName(code) {
    const entry = Object.entries(LOINC_CODES).find(([, value]) => value === code);
    return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : null;
}
/**
 * Get descriptive name for a SNOMED code
 * @param {string} code - SNOMED code
 * @returns {string|null} - Descriptive name or null if not found
 */
export function getSnomedName(code) {
    const entry = Object.entries(SNOMED_CODES).find(([, value]) => value === code);
    return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : null;
}
/**
 * Validate if a code is a valid LOINC code format
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid LOINC format
 */
export function isValidLoincCode(code) {
    // LOINC codes are typically 4-5 digits followed by a dash and 1 digit
    return /^\d{4,5}-\d$/.test(code);
}
/**
 * Validate if a code is a valid SNOMED CT code format
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid SNOMED format
 */
export function isValidSnomedCode(code) {
    // SNOMED codes are typically 6-18 digit numbers
    return /^\d{6,18}$/.test(code);
}
/**
 * Get ICD-10 code by condition name
 * @param {string} name - Common name of the condition
 * @returns {string|null} - ICD-10 code or null if not found
 */
export function getIcd10Code(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return ICD10_CODES[upperName] || null;
}
/**
 * Get descriptive name for an ICD-10 code
 * @param {string} code - ICD-10 code
 * @returns {string|null} - Descriptive name or null if not found
 */
export function getIcd10Name(code) {
    const entry = Object.entries(ICD10_CODES).find(([, value]) => value === code);
    return entry ? entry[0].replace(/_/g, ' ').toLowerCase() : null;
}
/**
 * Validate if a code is a valid ICD-10 code format
 * @param {string} code - Code to validate
 * @returns {boolean} - True if valid ICD-10 format
 */
export function isValidIcd10Code(code) {
    // ICD-10 codes: letter followed by 2-7 alphanumeric characters, optionally with a decimal
    return /^[A-Z]\d{2}(\.\d{1,4})?$/.test(code);
}
/**
 * Get both SNOMED and ICD-10 codes by condition name
 * Unified lookup for diagnosis codes across both systems
 * @param {string} name - Common name of the condition
 * @returns {DiagnosisCodeResult} - Object containing both codes
 */
export function getDiagnosisCode(name) {
    const upperName = name.toUpperCase().replace(/[- ]/g, '_');
    return {
        snomed: SNOMED_CODES[upperName] || null,
        icd10: ICD10_CODES[upperName] || null,
        name: upperName.replace(/_/g, ' ').toLowerCase()
    };
}
/**
 * Convert a SNOMED code to ICD-10
 * @param {string} snomedCode - SNOMED CT code
 * @returns {string|null} - ICD-10 code or null if no mapping exists
 */
export function convertSnomedToIcd10(snomedCode) {
    return SNOMED_TO_ICD10_MAP[snomedCode] || null;
}
/**
 * Match a diagnosis code (either SNOMED or ICD-10) and return normalized info
 * Useful for accepting patient data that may use either coding system
 * @param {string} code - Diagnosis code (SNOMED or ICD-10)
 * @returns {DiagnosisCodeResult|null} - Matched diagnosis info or null
 */
export function matchDiagnosisCode(code) {
    // Check if it's a SNOMED code
    if (isValidSnomedCode(code)) {
        const name = getSnomedName(code);
        if (name) {
            const upperName = name.toUpperCase().replace(/ /g, '_');
            return {
                snomed: code,
                icd10: ICD10_CODES[upperName] || convertSnomedToIcd10(code),
                name
            };
        }
        // Check SNOMED_TO_ICD10_MAP for unmapped SNOMED codes
        const icd10 = convertSnomedToIcd10(code);
        if (icd10) {
            const icd10Name = getIcd10Name(icd10);
            return {
                snomed: code,
                icd10,
                name: icd10Name || 'unknown'
            };
        }
    }
    // Check if it's an ICD-10 code
    if (isValidIcd10Code(code)) {
        const name = getIcd10Name(code);
        if (name) {
            const upperName = name.toUpperCase().replace(/ /g, '_');
            return {
                snomed: SNOMED_CODES[upperName] || null,
                icd10: code,
                name
            };
        }
    }
    return null;
}
/**
 * Get all vital signs LOINC codes
 * @returns {Object} - Object containing vital signs codes
 */
export function getVitalSignsCodes() {
    return {
        systolicBP: LOINC_CODES.SYSTOLIC_BP,
        diastolicBP: LOINC_CODES.DIASTOLIC_BP,
        heartRate: LOINC_CODES.HEART_RATE,
        respiratoryRate: LOINC_CODES.RESPIRATORY_RATE,
        temperature: LOINC_CODES.TEMPERATURE,
        oxygenSaturation: LOINC_CODES.OXYGEN_SATURATION
    };
}
/**
 * Get all laboratory codes by category
 * @param {string} category - Category name (e.g., 'hematology', 'chemistry')
 * @returns {Object} - Object containing codes for that category
 */
export function getLabCodesByCategory(category) {
    const categories = {
        hematology: {
            hemoglobin: LOINC_CODES.HEMOGLOBIN,
            hematocrit: LOINC_CODES.HEMATOCRIT,
            wbc: LOINC_CODES.WBC,
            platelets: LOINC_CODES.PLATELETS
        },
        chemistry: {
            sodium: LOINC_CODES.SODIUM,
            potassium: LOINC_CODES.POTASSIUM,
            chloride: LOINC_CODES.CHLORIDE,
            co2: LOINC_CODES.CO2,
            bun: LOINC_CODES.BUN,
            creatinine: LOINC_CODES.CREATININE,
            glucose: LOINC_CODES.GLUCOSE
        },
        liver: {
            bilirubinTotal: LOINC_CODES.BILIRUBIN_TOTAL,
            ast: LOINC_CODES.AST,
            alt: LOINC_CODES.ALT,
            alp: LOINC_CODES.ALP,
            albumin: LOINC_CODES.ALBUMIN_SERUM,
            inr: LOINC_CODES.INR
        },
        lipid: {
            totalCholesterol: LOINC_CODES.CHOLESTEROL_TOTAL,
            hdl: LOINC_CODES.HDL,
            ldl: LOINC_CODES.LDL,
            triglycerides: LOINC_CODES.TRIGLYCERIDES
        },
        cardiac: {
            troponinI: LOINC_CODES.TROPONIN_I,
            troponinT: LOINC_CODES.TROPONIN_T,
            bnp: LOINC_CODES.BNP,
            ntProBnp: LOINC_CODES.NT_PRO_BNP
        }
    };
    return categories[category.toLowerCase()] || null;
}
// Export default object with all codes
export default {
    LOINC: LOINC_CODES,
    SNOMED: SNOMED_CODES,
    ICD10: ICD10_CODES,
    SNOMED_TO_ICD10: SNOMED_TO_ICD10_MAP,
    getLoincCode,
    getSnomedCode,
    getIcd10Code,
    getLoincName,
    getSnomedName,
    getIcd10Name,
    isValidLoincCode,
    isValidSnomedCode,
    isValidIcd10Code,
    getDiagnosisCode,
    convertSnomedToIcd10,
    matchDiagnosisCode,
    getVitalSignsCodes,
    getLabCodesByCategory,
    getMeasurementType
};
/**
 * Get the measurement type for a LOINC code
 * Used for unit conversion
 * @param {string} code - LOINC code
 * @returns {string} - Measurement type (e.g., 'temperature', 'weight') or 'concentration' default
 */
export function getMeasurementType(code) {
    // Handle comma-separated codes (take first)
    const primaryCode = code.split(',')[0].trim();
    // Map LOINC codes to measurement types
    const codeMap = {
        // Vital Signs
        [LOINC_CODES.TEMPERATURE]: 'temperature', // Body temperature 8310-5
        '8331-1': 'temperature', // Oral temperature
        // Cholesterol/Lipids
        [LOINC_CODES.CHOLESTEROL_TOTAL]: 'cholesterol',
        [LOINC_CODES.HDL]: 'hdl',
        [LOINC_CODES.LDL]: 'ldl',
        [LOINC_CODES.TRIGLYCERIDES]: 'triglycerides',
        // Glucose
        [LOINC_CODES.GLUCOSE]: 'glucose',
        '2339-0': 'glucose', // Fasting glucose
        // Creatinine
        [LOINC_CODES.CREATININE]: 'creatinine',
        '38483-4': 'creatinine', // Creatinine (blood)
        // Calcium
        [LOINC_CODES.CALCIUM]: 'calcium',
        // Albumin
        [LOINC_CODES.ALBUMIN_SERUM]: 'albumin',
        [LOINC_CODES.ALBUMIN]: 'albumin',
        // Bilirubin
        [LOINC_CODES.BILIRUBIN_TOTAL]: 'bilirubin',
        [LOINC_CODES.BILIRUBIN_DIRECT]: 'bilirubin',
        // Hemoglobin
        [LOINC_CODES.HEMOGLOBIN]: 'hemoglobin',
        // BUN
        [LOINC_CODES.BUN]: 'bun',
        [LOINC_CODES.BUN_ALT]: 'bun',
        '6299-2': 'bun', // BUN
        // Electrolytes (Na, K)
        [LOINC_CODES.SODIUM]: 'electrolyte',
        [LOINC_CODES.POTASSIUM]: 'electrolyte',
        // Weight/Height
        [LOINC_CODES.WEIGHT]: 'weight',
        [LOINC_CODES.HEIGHT]: 'height'
    };
    return codeMap[primaryCode] || 'concentration';
}
