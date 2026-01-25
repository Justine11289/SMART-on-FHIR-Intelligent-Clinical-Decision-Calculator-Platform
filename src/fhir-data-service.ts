// src/fhir-data-service.ts
// Unified FHIR Data Management Layer
// Consolidates data fetching, caching, staleness tracking, and UI feedback

import {
    getMostRecentObservation,
    getObservationValue,
    getPatientConditions,
    getMedicationRequests,
    calculateAge
} from './utils.js';
import {
    LOINC_CODES,
    SNOMED_CODES,
    getLoincName,
    getMeasurementType,
    isValidLoincCode
} from './fhir-codes.js';
import { getTextNameByLoinc } from './lab-name-mapping.js';
// @ts-ignore - no type declarations
import { fhirCache } from './cache-manager.js';
import { createStalenessTracker, DataStalenessTracker } from './data-staleness.js';
import { UnitConverter } from './unit-converter.js';
// @ts-ignore - no type declarations
import { fhirFeedback } from './fhir-feedback.js';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * FHIR Client interface (from fhirclient library)
 */
export interface FHIRClient {
    patient: {
        id: string;
        read: () => Promise<Patient>;
        request: (url: string, options?: any) => Promise<any>;
    };
    request: (url: string, options?: any) => Promise<any>;
}

/**
 * FHIR Patient resource
 */
export interface Patient {
    id: string;
    birthDate?: string;
    gender?: string;
    name?: Array<{
        use?: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
        given?: string[];
        family?: string;
        text?: string;
    }>;
}

/**
 * Options for fetching observations
 */
export interface GetObservationOptions {
    /** Skip cache and fetch fresh data */
    skipCache?: boolean;
    /** Track staleness for this observation */
    trackStaleness?: boolean;
    /** Custom label for staleness tracking */
    stalenessLabel?: string;
    /** Target unit for automatic conversion */
    targetUnit?: string;
    /** Unit type for conversion (e.g., 'creatinine', 'weight', 'height') */
    /** Unit type for conversion (e.g., 'creatinine', 'weight', 'height') */
    unitType?: string;
    /** Use text-based query instead of LOINC code (for hospitals without LOINC support) */
    useTextQuery?: boolean;
}

/**
 * Result of an observation fetch
 */
export interface ObservationResult {
    /** Raw FHIR Observation resource */
    observation: any | null;
    /** Extracted numeric value */
    value: number | null;
    /** Unit of the value */
    unit: string | null;
    /** Original value before conversion */
    originalValue: number | null;
    /** Original unit before conversion */
    originalUnit: string | null;
    /** Date of the observation */
    date: Date | null;
    /** Whether the observation is stale */
    isStale: boolean;
    /** Age in days if stale */
    ageInDays: number | null;
    /** LOINC code */
    code: string;
}

/**
 * Options for auto-populating an input field
 */
export interface AutoPopulateOptions {
    /** Transform the value before setting */
    transform?: (value: number) => number;
    /** Number of decimal places */
    decimals?: number;
    /** Target unit for the input */
    targetUnit?: string;
    /** Custom label for staleness warning */
    label?: string;
    /** Skip staleness tracking */
    skipStaleness?: boolean;
}

/**
 * Data requirement for a calculator field
 */
export interface FieldDataRequirement {
    /** LOINC code(s) - can be comma-separated for alternatives */
    code: string;
    /** ID of the input element (CSS selector) */
    inputId: string;
    /** Display label */
    label: string;
    /** Target unit for conversion */
    targetUnit?: string;
    /** Number of decimal places */
    decimals?: number;
    /** Value transform function */
    transform?: (value: number) => number;
}

/**
 * Complete data requirements for a calculator
 */
export interface CalculatorDataRequirements {
    /** Observation requirements */
    observations: FieldDataRequirement[];
    /** Condition codes to check */
    conditions?: string[];
    /** Medication codes to check */
    medications?: string[];
}

// ============================================================================
// FHIR Data Service Class
// ============================================================================

/**
 * Unified FHIR Data Service
 * Provides a centralized API for all FHIR data operations
 */
export class FHIRDataService {
    private client: FHIRClient | null = null;
    private patient: Patient | null = null;
    private container: HTMLElement | null = null;
    private stalenessTracker: DataStalenessTracker | null = null;
    private patientId: string | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize the service with FHIR client and patient
     */
    initialize(client: any, patient: any, container: HTMLElement): void {
        this.client = client as FHIRClient | null;
        this.patient = patient as Patient | null;
        this.container = container;
        this.patientId = patient?.id || client?.patient?.id || null;

        // Create staleness tracker
        this.stalenessTracker = createStalenessTracker();
        this.stalenessTracker.setContainer(container);

        this.isInitialized = true;
    }

    /**
     * Check if service is properly initialized
     */
    isReady(): boolean {
        return this.isInitialized && this.client !== null;
    }

    /**
     * Get patient information
     */
    getPatient(): Patient | null {
        return this.patient;
    }

    /**
     * Get patient ID
     */
    getPatientId(): string | null {
        return this.patientId;
    }

    /**
     * Get staleness tracker instance
     */
    getStalenessTracker(): DataStalenessTracker | null {
        return this.stalenessTracker;
    }

    // ========================================================================
    // Observation Fetching
    // ========================================================================

    /**
     * Get the most recent observation for a LOINC code
     * Includes caching, staleness tracking, and unit conversion
     */
    async getObservation(
        code: string,
        options: GetObservationOptions = {}
    ): Promise<ObservationResult> {
        const result: ObservationResult = {
            observation: null,
            value: null,
            unit: null,
            originalValue: null,
            originalUnit: null,
            date: null,
            isStale: false,
            ageInDays: null,
            code
        };

        if (!this.client) {
            return result;
        }

        try {
            // Check cache first
            if (!options.skipCache && this.patientId) {
                const cached = await fhirCache.getCachedObservation(this.patientId, code);
                if (cached) {
                    return this.processObservation(cached, code, options);
                }
            }

            let observation = null;

            // Determine if we should use text-based query
            const useTextQuery = options.useTextQuery || !isValidLoincCode(code);

            if (useTextQuery) {
                // Try to resolve text name from LOINC, or use code as-is if it's already text
                const textName = getTextNameByLoinc(code) || code;

                // Perform text-based search (using code:text modifier or fallback to code for some servers)
                // We use direct client request here to bypass getMostRecentObservation's hardcoded query
                const response = await this.client.patient.request(
                    `Observation?code:text=${encodeURIComponent(textName)}&_sort=-date&_count=1`
                );

                if (response.entry && response.entry.length > 0) {
                    observation = response.entry[0].resource;
                }
            } else {
                // Standard LOINC query
                observation = await getMostRecentObservation(this.client, code);
            }

            // Cache the result (cache key remains the original code/LOINC for consistency)
            if (observation && this.patientId) {
                await fhirCache.cacheObservation(this.patientId, code, observation);
            }

            return this.processObservation(observation, code, options);
        } catch (error) {
            console.error(
                `Error fetching observation ${code} (TextQuery: ${options.useTextQuery}):`,
                error
            );
            return result;
        }
    }

    /**
     * Process an observation and extract values
     */
    private processObservation(
        observation: any,
        code: string,
        options: GetObservationOptions
    ): ObservationResult {
        const result: ObservationResult = {
            observation,
            value: null,
            unit: null,
            originalValue: null,
            originalUnit: null,
            date: null,
            isStale: false,
            ageInDays: null,
            code
        };

        if (!observation) {
            return result;
        }

        // Extract value using getObservationValue for proper component handling
        const value = getObservationValue(observation, code);
        if (value !== null) {
            result.value = value;
            result.originalValue = value;
        } else if (observation.valueQuantity) {
            result.value = observation.valueQuantity.value;
            result.originalValue = result.value;
        }

        // Extract unit
        if (observation.valueQuantity?.unit) {
            result.unit = observation.valueQuantity.unit;
            result.originalUnit = result.unit;
        }

        // Extract date
        const dateStr = observation.effectiveDateTime || observation.issued;
        if (dateStr) {
            result.date = new Date(dateStr);
        }

        // Check staleness
        if (options.trackStaleness && this.stalenessTracker) {
            const stalenessInfo = this.stalenessTracker.checkStaleness(observation);
            if (stalenessInfo) {
                result.isStale = stalenessInfo.isStale;
                result.ageInDays = stalenessInfo.ageInDays;
            }
        }

        // Unit conversion
        if (options.targetUnit && result.value !== null && result.unit) {
            // Use provided unitType or determine measurement type from LOINC code
            const measurementType = options.unitType || getMeasurementType(code);
            const converted = UnitConverter.convert(
                result.value,
                result.unit,
                options.targetUnit,
                measurementType
            );
            if (converted !== null) {
                result.value = converted;
                result.unit = options.targetUnit;
            }
        }

        return result;
    }

    /**
     * Get multiple observations at once
     */
    async getObservations(
        codes: string[],
        options: GetObservationOptions = {}
    ): Promise<Map<string, ObservationResult>> {
        const results = new Map<string, ObservationResult>();

        const promises = codes.map(async code => {
            const result = await this.getObservation(code, options);
            results.set(code, result);
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * Get all historical observations for a LOINC code (sorted by date)
     * Useful for growth charts and trend analysis
     */
    async getAllObservations(
        code: string,
        options: { sortOrder?: 'asc' | 'desc' } = {}
    ): Promise<any[]> {
        if (!this.client) {
            return [];
        }

        try {
            const sortDirection = options.sortOrder === 'desc' ? '-date' : 'date';
            const response = await this.client.patient.request(
                `Observation?code=${code}&_sort=${sortDirection}`
            );

            if (response.entry && Array.isArray(response.entry)) {
                return response.entry.map((entry: any) => entry.resource);
            }

            return [];
        } catch (error) {
            console.error(`Error fetching all observations for ${code}:`, error);
            return [];
        }
    }

    /**
     * Get raw observation with full FHIR resource (for non-numeric values like CodeableConcept)
     */
    async getRawObservation(code: string): Promise<any | null> {
        if (!this.client) {
            return null;
        }

        try {
            return await getMostRecentObservation(this.client, code);
        } catch (error) {
            console.error(`Error fetching raw observation ${code}:`, error);
            return null;
        }
    }

    /**
     * Result of blood pressure fetch
     */
    /**
     * Get blood pressure (systolic and diastolic)
     * Blood pressure is stored as a panel with components
     */
    async getBloodPressure(
        options: {
            trackStaleness?: boolean;
            skipCache?: boolean;
        } = {}
    ): Promise<{
        systolic: number | null;
        diastolic: number | null;
        observation: any | null;
        date: Date | null;
        isStale: boolean;
    }> {
        const result = {
            systolic: null as number | null,
            diastolic: null as number | null,
            observation: null as any | null,
            date: null as Date | null,
            isStale: false
        };

        if (!this.client) {
            return result;
        }

        try {
            // Fetch BP panel observation
            const bpPanel = await getMostRecentObservation(this.client, LOINC_CODES.BP_PANEL);

            if (bpPanel && bpPanel.component) {
                result.observation = bpPanel;

                // Extract systolic BP
                const sbpComp = bpPanel.component.find((c: any) =>
                    c.code?.coding?.some((coding: any) => coding.code === LOINC_CODES.SYSTOLIC_BP)
                );
                if (sbpComp?.valueQuantity?.value !== undefined) {
                    result.systolic = sbpComp.valueQuantity.value;
                }

                // Extract diastolic BP
                const dbpComp = bpPanel.component.find((c: any) =>
                    c.code?.coding?.some((coding: any) => coding.code === LOINC_CODES.DIASTOLIC_BP)
                );
                if (dbpComp?.valueQuantity?.value !== undefined) {
                    result.diastolic = dbpComp.valueQuantity.value;
                }

                // Extract date
                const dateStr = bpPanel.effectiveDateTime || bpPanel.issued;
                if (dateStr) {
                    result.date = new Date(dateStr);
                }

                // Track staleness
                if (options.trackStaleness && this.stalenessTracker) {
                    const stalenessInfo = this.stalenessTracker.checkStaleness(bpPanel);
                    if (stalenessInfo) {
                        result.isStale = stalenessInfo.isStale;
                    }

                    // Track for both systolic and diastolic if container exists
                    if (result.systolic !== null) {
                        this.stalenessTracker.trackObservation(
                            '#map-sbp',
                            bpPanel,
                            LOINC_CODES.SYSTOLIC_BP,
                            'Systolic BP'
                        );
                    }
                    if (result.diastolic !== null) {
                        this.stalenessTracker.trackObservation(
                            '#map-dbp',
                            bpPanel,
                            LOINC_CODES.DIASTOLIC_BP,
                            'Diastolic BP'
                        );
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Error fetching blood pressure:', error);
            return result;
        }
    }

    // ========================================================================
    // Auto-Population
    // ========================================================================

    /**
     * Auto-populate a single input field from FHIR data
     */
    async autoPopulateInput(
        inputId: string,
        code: string,
        options: AutoPopulateOptions = {}
    ): Promise<ObservationResult> {
        const obsOptions: GetObservationOptions = {
            trackStaleness: !options.skipStaleness,
            stalenessLabel: options.label,
            targetUnit: options.targetUnit
        };

        const result = await this.getObservation(code, obsOptions);

        if (result.value !== null && this.container) {
            const input = this.container.querySelector(inputId) as HTMLInputElement;
            if (input) {
                let value = result.value;

                // Apply transform if provided
                if (options.transform) {
                    value = options.transform(value);
                }

                // Format with decimals
                const decimals = options.decimals ?? 1;
                input.value = value.toFixed(decimals);

                // Track staleness
                if (!options.skipStaleness && this.stalenessTracker && result.observation) {
                    this.stalenessTracker.trackObservation(
                        inputId,
                        result.observation,
                        code,
                        options.label || getLoincName(code) || code
                    );
                }

                // Use UnitConverter.setInputValue for proper unit handling
                if (options.targetUnit && result.originalValue !== null && result.originalUnit) {
                    UnitConverter.setInputValue(input, result.originalValue, result.originalUnit);
                }

                // Dispatch input event to trigger recalculation
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        return result;
    }

    /**
     * Auto-populate multiple inputs based on field requirements
     */
    async autoPopulateFields(
        fields: FieldDataRequirement[]
    ): Promise<Map<string, ObservationResult>> {
        const results = new Map<string, ObservationResult>();

        // Show loading banner if container exists
        if (this.container) {
            fhirFeedback.createLoadingBanner(this.container);
        }

        try {
            // Special handling for Blood Pressure
            // FHIR often stores BP as a panel (85354-9), so querying for individual components might fail
            const bpFields = fields.filter(
                f => f.code === LOINC_CODES.SYSTOLIC_BP || f.code === LOINC_CODES.DIASTOLIC_BP
            );

            const processedBPCodes: string[] = [];

            if (bpFields.length > 0) {
                try {
                    // Fetch BP Panel without internal staleness tracking (we'll do it here with correct IDs)
                    const bpResult = await this.getBloodPressure({ trackStaleness: false });

                    if (bpResult.observation) {
                        for (const field of bpFields) {
                            const isSystolic = field.code === LOINC_CODES.SYSTOLIC_BP;
                            const value = isSystolic ? bpResult.systolic : bpResult.diastolic;

                            if (value !== null && this.container) {
                                const input = this.container.querySelector(
                                    field.inputId
                                ) as HTMLInputElement;
                                if (input) {
                                    // Apply formatting (decimals)
                                    const decimals = field.decimals ?? 1;
                                    input.value = Number(value).toFixed(decimals);

                                    // Track Staleness
                                    if (this.stalenessTracker) {
                                        this.stalenessTracker.trackObservation(
                                            field.inputId,
                                            bpResult.observation,
                                            field.code,
                                            field.label
                                        );
                                    }

                                    // Trigger update
                                    input.dispatchEvent(new Event('input', { bubbles: true }));

                                    // Add to results
                                    results.set(field.code, {
                                        observation: bpResult.observation,
                                        value: value,
                                        unit: 'mmHg',
                                        originalValue: value,
                                        originalUnit: 'mmHg',
                                        date: bpResult.date,
                                        isStale: bpResult.isStale,
                                        ageInDays: null,
                                        code: field.code
                                    });

                                    processedBPCodes.push(field.code);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error auto-populating BP:', e);
                }
            }

            // Process remaining fields (exclude successfully processed BP fields)
            const remainingFields = fields.filter(f => !processedBPCodes.includes(f.code));

            const promises = remainingFields.map(async field => {
                const result = await this.autoPopulateInput(field.inputId, field.code, {
                    label: field.label,
                    targetUnit: field.targetUnit,
                    decimals: field.decimals,
                    transform: field.transform
                });
                results.set(field.code, result);
            });

            await Promise.all(promises);

            // Show summary
            if (this.container) {
                const loaded = fields
                    .filter(f => results.get(f.code)?.value !== null)
                    .map(f => f.label);

                const missing = fields
                    .filter(f => results.get(f.code)?.value === null)
                    .map(f => ({
                        id: f.inputId.replace(/^#/, ''),
                        label: f.label
                    }));

                fhirFeedback.createDataSummary(this.container, {
                    loaded,
                    missing,
                    failed: []
                });

                // Enable dynamic tracking for missing fields
                if (missing.length > 0) {
                    fhirFeedback.setupDynamicTracking(this.container, missing);
                }
            }
        } finally {
            // Remove loading banner
            if (this.container) {
                fhirFeedback.removeLoadingBanner(this.container);
            }
        }

        return results;
    }

    /**
     * Auto-populate based on calculator data requirements
     */
    async autoPopulateFromRequirements(requirements: CalculatorDataRequirements): Promise<void> {
        if (requirements.observations && requirements.observations.length > 0) {
            await this.autoPopulateFields(requirements.observations);
        }
    }

    // ========================================================================
    // Condition and Medication Fetching
    // ========================================================================

    /**
     * Get patient conditions by SNOMED codes
     */
    async getConditions(snomedCodes: string[]): Promise<any[]> {
        if (!this.client) {
            return [];
        }

        try {
            return await getPatientConditions(this.client, snomedCodes);
        } catch (error) {
            console.error('Error fetching conditions:', error);
            return [];
        }
    }

    /**
     * Check if patient has any of the specified conditions
     */
    async hasCondition(snomedCodes: string[]): Promise<boolean> {
        const conditions = await this.getConditions(snomedCodes);
        return conditions.length > 0;
    }

    /**
     * Get patient medications by RxNorm codes
     */
    async getMedications(rxnormCodes: string[]): Promise<any[]> {
        if (!this.client) {
            return [];
        }

        try {
            return await getMedicationRequests(this.client, rxnormCodes);
        } catch (error) {
            console.error('Error fetching medications:', error);
            return [];
        }
    }

    /**
     * Check if patient is on any of the specified medications
     */
    async isOnMedication(rxnormCodes: string[]): Promise<boolean> {
        const medications = await this.getMedications(rxnormCodes);
        return medications.length > 0;
    }

    // ========================================================================
    // Cache Management
    // ========================================================================

    /**
     * Clear all cached data for the current patient
     */
    clearCache(): void {
        if (this.patientId) {
            fhirCache.clearPatientCache(this.patientId);
        }
    }

    /**
     * Prefetch common observations for faster access
     */
    async prefetch(codes: string[]): Promise<void> {
        const promises = codes.map(code => this.getObservation(code));
        await Promise.all(promises);
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================

    /**
     * Calculate age from patient birthDate
     * Uses calculateAge from utils.ts for consistent implementation
     */
    getPatientAge(): number | null {
        if (!this.patient?.birthDate) {
            return null;
        }
        return calculateAge(this.patient.birthDate);
    }

    /**
     * Get patient gender
     */
    getPatientGender(): 'male' | 'female' | null {
        if (!this.patient?.gender) {
            return null;
        }
        return this.patient.gender.toLowerCase() === 'female' ? 'female' : 'male';
    }

    /**
     * Get patient name with TWCORE IG support
     * Prioritizes 'text' field for Chinese names (TWCORE format)
     * Falls back to family + given for Western format
     * @returns Patient name information or null
     */
    getPatientName(): {
        display: string;
        text?: string;
        family?: string;
        given?: string[];
    } | null {
        if (!this.patient?.name || this.patient.name.length === 0) {
            return null;
        }

        // Find the official name first, or use the first name entry
        const officialName =
            this.patient.name.find(n => n.use === 'official') || this.patient.name[0];

        // TWCORE IG: Use 'text' field if available (Chinese full name)
        if (officialName.text) {
            return {
                display: officialName.text,
                text: officialName.text,
                family: officialName.family,
                given: officialName.given
            };
        }

        // Western format fallback: family + given
        const parts: string[] = [];
        if (officialName.given && officialName.given.length > 0) {
            parts.push(...officialName.given);
        }
        if (officialName.family) {
            parts.push(officialName.family);
        }

        if (parts.length === 0) {
            return null;
        }

        return {
            display: parts.join(' '),
            family: officialName.family,
            given: officialName.given
        };
    }

    /**
     * Get patient display name as string
     * Shorthand for getPatientName()?.display
     * @returns Patient name string or null
     */
    getPatientDisplayName(): string | null {
        return this.getPatientName()?.display || null;
    }

    /**
     * Get patient birth date
     * @returns Birth date as Date object, or null if not available
     */
    getPatientBirthDate(): Date | null {
        if (!this.patient?.birthDate) {
            return null;
        }
        return new Date(this.patient.birthDate);
    }

    /**
     * Get patient birth date as ISO string (YYYY-MM-DD)
     * @returns Birth date string or null
     */
    getPatientBirthDateString(): string | null {
        return this.patient?.birthDate || null;
    }

    /**
     * Get formatted patient demographics
     * Combines name, age, gender, and birth date
     */
    getPatientDemographics(): {
        name: string | null;
        age: number | null;
        gender: 'male' | 'female' | null;
        birthDate: string | null;
    } {
        return {
            name: this.getPatientDisplayName(),
            age: this.getPatientAge(),
            gender: this.getPatientGender(),
            birthDate: this.getPatientBirthDateString()
        };
    }

    getPatientNationalId(patient: any): string | null {
        const twId = patient.identifier?.find((id: any) => id.system === 'http://www.moi.gov.tw/');
        return twId ? twId.value : null;
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Default singleton instance
 */
export const fhirDataService = new FHIRDataService();

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new FHIRDataService instance
 * Use this when you need isolated service instances
 */
export function createFHIRDataService(): FHIRDataService {
    return new FHIRDataService();
}

// ============================================================================
// Exports
// ============================================================================

export default {
    FHIRDataService,
    fhirDataService,
    createFHIRDataService
};
