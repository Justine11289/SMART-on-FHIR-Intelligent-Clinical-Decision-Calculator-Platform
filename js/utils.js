import { escapeHTML } from './security.js';
/**
 * Gets the most recent FHIR Observation for a given LOINC code.
 * @param {Object} client The FHIR client instance.
 * @param {string} code The LOINC code for the observation.
 * @returns {Promise<Object|null>} A promise that resolves to the Observation resource or null.
 */
export function getMostRecentObservation(client, code) {
    if (!client || !client.patient) {
        return Promise.resolve(null);
    }
    return client.patient
        .request(`Observation?code=${code}&_sort=-date&_count=1`)
        .then((response) => {
        if (response.entry && response.entry.length > 0) {
            return response.entry[0].resource;
        }
        return null;
    })
        .catch((error) => {
        console.error('Error fetching observation:', error);
        return null;
    });
}
/**
 * Extracts a value from an observation, handling both valueQuantity and components.
 * @param {Object} observation - The FHIR Observation resource.
 * @param {string} code - The specific LOINC code to look for (optional if simple observation).
 * @returns {number|null} - The value or null if not found.
 */
export function getObservationValue(observation, code) {
    if (!observation)
        return null;
    // 1. Check top-level valueQuantity
    if (observation.valueQuantity && observation.valueQuantity.value !== undefined) {
        return observation.valueQuantity.value;
    }
    // 2. Check components if code is provided
    if (observation.component && code) {
        const component = observation.component.find((c) => c.code.coding && c.code.coding.some((coding) => coding.code === code));
        if (component && component.valueQuantity) {
            return component.valueQuantity.value;
        }
    }
    return null;
}
/**
 * Calculates age based on a birthdate string.
 * @param {string} birthDate The birthdate in 'YYYY-MM-DD' format.
 * @returns {number} The calculated age in years.
 */
export function calculateAge(birthDate) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
}
/**
 * Fetches patient data and displays it in a designated div.
 * @param {Object} client The FHIR client instance.
 * @param {HTMLElement} patientInfoDiv The div element to display patient info in.
 * @returns {Promise<Object>} A promise that resolves to the patient resource.
 */
export function displayPatientInfo(client, patientInfoDiv) {
    const renderPatient = (patient) => {
        const name = patient.name[0];
        const formattedName = name.text || `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
        const age = calculateAge(patient.birthDate);
        // 檢查是否符合 TW Core Patient Profile
        const isTWCore = patient.meta?.profile?.some((p) => p.includes("twcore/StructureDefinition/Patient-twcore"));
        // 取得台灣身分證字號
        const twId = patient.identifier?.find((i) => i.system === "http://www.moi.gov.tw/")?.value || "N/A";
        patientInfoDiv.innerHTML = `
            <div class="tw-core-info">
                ${isTWCore ? '<span class="badge-twcore">✓ TW Core IG Verified</span>' : ''}
                <p><strong>Name:</strong> ${escapeHTML(formattedName)}</p>
                <p><strong>National ID:</strong> ${escapeHTML(twId)}</p>
                <p><strong>Birth Date:</strong> ${escapeHTML(patient.birthDate)} (Age: ${age})</p>
                <p><strong>Gender:</strong> ${escapeHTML(patient.gender)}</p>
            </div>
        `;
    };
    if (!client?.patient?.id) {
        patientInfoDiv.innerHTML = '<p>No patient data available. Please launch from the EHR.</p>';
        return Promise.resolve(null);
    }
    // First, try to display data from session storage for a faster UI response.
    // const cachedPatient = sessionStorage.getItem('patientData');
    // if (cachedPatient) {
    //     renderPatient(JSON.parse(cachedPatient));
    // }
    // if (!client?.patient?.id) {
    //     if (!cachedPatient) {
    //         patientInfoDiv.innerHTML =
    //             '<p>No patient data available. Please launch from the EHR.</p>';
    //     }
    //     return Promise.resolve(cachedPatient ? JSON.parse(cachedPatient) : null);
    // }
    return client.patient.read().then((patient) => {
        // 您可以保留寫入，但讀取時跳過它
        sessionStorage.setItem('patientData', JSON.stringify(patient));
        renderPatient(patient);
        return patient;
    }, (error) => {
        console.error(error);
        patientInfoDiv.innerText = 'Error fetching patient data.';
        throw error;
    });
}
/**
 * Gets patient's conditions for a given set of SNOMED codes.
 * @param {Object} client The FHIR client instance.
 * @param {Array<string>} codes Array of SNOMED codes for the conditions.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of Condition resources.
 */
export function getPatientConditions(client, codes) {
    if (!client || !client.patient) {
        return Promise.resolve([]);
    }
    const codeString = codes.join(',');
    return client.patient
        .request(`Condition?clinical-status=active&code=${codeString}`)
        .then((response) => {
        if (response.entry) {
            return response.entry.map((e) => e.resource);
        }
        return [];
    })
        .catch((error) => {
        console.error('Error fetching patient conditions:', error);
        return [];
    });
}
/**
 * Fetches the patient resource.
 * @param {Object} client - The FHIR client instance.
 * @returns {Promise<Object|null>} A promise that resolves to the patient resource or null.
 */
export function getPatient(client) {
    if (!client || !client.patient) {
        return Promise.resolve(null);
    }
    return client.patient
        .read()
        .then((patient) => patient || null)
        .catch((error) => {
        console.error('Error fetching patient:', error);
        return null;
    });
}
/**
 * Fetches the most recent observation for a given LOINC code.
 * @param {Object} client - The FHIR client instance.
 * @param {string} code - The LOINC code for the observation.
 * @returns {Promise<Object|null>} A promise that resolves to the observation resource or null.
 */
export function getObservation(client, code) {
    if (!client || !client.patient) {
        return Promise.resolve(null);
    }
    return client.patient
        .request(`Observation?code=${code}&_sort=-date&_count=1`)
        .then((response) => {
        if (response.entry && response.entry.length > 0) {
            return response.entry[0].resource;
        }
        return null;
    })
        .catch((error) => {
        console.error('Error fetching observation:', error);
        return null;
    });
}
/**
 * Converts a lab value from mg/dL to mmol/L.
 * @param {number} value - The lab value in mg/dL.
 * @param {string} type - The type of lab ('cholesterol', 'hdl', 'glucose').
 * @returns {number} The lab value in mmol/L.
 */
export function convertToMmolL(value, type) {
    const conversionFactors = {
        cholesterol: 0.02586,
        hdl: 0.02586,
        glucose: 0.0555
    };
    return value * (conversionFactors[type] || 1);
}
/**
 * Converts a lab value from mmol/L to mg/dL.
 * @param {number} value - The lab value in mmol/L.
 * @param {string} type - The type of lab ('cholesterol', 'hdl', 'glucose').
 * @returns {number} The lab value in mg/dL.
 */
export function convertToMgDl(value, type) {
    const conversionFactors = {
        cholesterol: 38.67,
        hdl: 38.67,
        glucose: 18.018
    };
    return value * (conversionFactors[type] || 1);
}
export async function getMedicationRequests(client, rxnormCodes) {
    if (!client) {
        return Promise.resolve([]);
    }
    try {
        const query = new URLSearchParams({
            code: `http://www.nlm.nih.gov/research/umls/rxnorm|${rxnormCodes.join(',')}`,
            patient: client.patient.id,
            status: 'active'
        });
        const response = await client.request(`MedicationRequest?${query}`);
        return response.entry ? response.entry.map((e) => e.resource) : [];
    }
    catch (error) {
        console.error('Error fetching medication requests:', error);
        return [];
    }
}
// Note: Unit conversion functions have been consolidated into unit-converter.ts
// Use UnitConverter.convert(), UnitConverter.conversions, etc.
/**
 * Initialize visual feedback for segmented controls with radio buttons
 * Adds 'selected' class to the label when its radio button is checked
 * @param {HTMLElement} container - Container element that contains segmented controls
 */
export function initializeSegmentedControls(container) {
    // Handle all segmented controls in the container
    container.querySelectorAll('.segmented-control, .radio-group').forEach(control => {
        const labels = control.querySelectorAll('label');
        const radioInputs = control.querySelectorAll('input[type="radio"]');
        // Function to update selected state
        const updateSelectedState = () => {
            radioInputs.forEach((input) => {
                const label = input.parentElement;
                if (input.checked) {
                    label.classList.add('selected');
                }
                else {
                    label.classList.remove('selected');
                }
            });
        };
        // Add change event listeners to radio buttons
        radioInputs.forEach(input => {
            input.addEventListener('change', updateSelectedState);
        });
        // Add click handlers to labels for immediate visual feedback
        labels.forEach(label => {
            label.addEventListener('click', () => {
                // Use setTimeout to ensure the radio state is updated first
                setTimeout(updateSelectedState, 0);
            });
        });
        // Initialize state on load
        updateSelectedState();
    });
}
