---
description: How to upgrade a calculator module with Validator, UnitConverter and ErrorHandler
---

# Upgrading Calculator Modules

This workflow describes the steps to upgrade an existing MedCalcEHR calculator module to use the standardized `validator.js`, `unit-converter.js`, and `errorHandler.js` modules.

## Prerequisites

Ensure the following modules are imported in the calculator's `index.js`:

```javascript
import { uiBuilder } from '../../ui-builder.js';
import { UnitConverter } from '../../unit-converter.js';
import { ValidationRules, validateCalculatorInput } from '../../validator.js';
import { ValidationError, displayError, logError } from '../../errorHandler.js';
```

## Step 1: Update `generateHTML`

1.  **Unit Toggles**: Add `unitToggle` configuration to `uiBuilder.createInput` calls for fields that support multiple units (e.g., weight, creatinine, glucose).
    ```javascript
    uiBuilder.createInput({
        id: 'calc-weight',
        label: 'Weight',
        type: 'number',
        unit: 'kg',
        unitToggle: {
            type: 'weight',
            units: ['kg', 'lbs'],
            defaultUnit: 'kg'
        }
    });
    ```

## Step 2: Implement Validation Logic in `calculate`

1.  **Clear Errors**: At the start of the `calculate` function, remove any existing error messages.

    ```javascript
    const existingError = container.querySelector('#calc-error');
    if (existingError) existingError.remove();
    ```

2.  **Get Standard Values**: Use `UnitConverter.getStandardValue` to retrieve input values in the standard unit expected by the validation rules and calculation formula.

    ```javascript
    const weight = UnitConverter.getStandardValue(weightInput, 'kg');
    ```

3.  **Validate**: Create an input object and a schema object mapping inputs to `ValidationRules`. call `validateCalculatorInput`.

    ```javascript
    const inputs = { weight };
    const schema = { weight: ValidationRules.weight };
    const validation = validateCalculatorInput(inputs, schema);

    if (!validation.isValid) {
        // ... handling logic (see established pattern)
        return;
    }
    ```

## Step 3: Implement Calculation and Error Handling

1.  **Try-Catch**: Wrap the calculation and result update logic in a `try-catch` block.
2.  **Check Finite**: Ensure the calculated result is finite.
    ```javascript
    if (!isFinite(result) || isNaN(result)) throw new Error('Calculation Error');
    ```
3.  **Display Error**: In the `catch` block, use `logError` and `displayError`.
    ```javascript
    } catch (error) {
        logError(error, { calculator: 'id', action: 'calculate' });
        if (error.name !== 'ValidationError') {
             // ... create error container if needed
             displayError(errorContainer, error);
        }
    }
    ```

## Step 4: Update FHIR Integration

1.  **Normalize Values**: When auto-populating from FHIR, use `UnitConverter.convert` if necessary to match the expected unit, or populate the raw value and let the user/`UnitConverter` handle the toggle (preferred if `unitToggle` is set up correctly, but ensure `getStandardValue` is used during calc). Or better, `UnitConverter` handles the displayed value if we just set `.value`? No, we set `.value` to what we have, but if we have a set unit, we might need to convert before setting if the toggle is fixed.
    - _Best Practice_: Use `UnitConverter.setInputValue(inputElement, value, unit)` which will automatically handle unit checks and conversion if the UI unit differs from the FHIR unit.

## Step 5: Testing

1.  Verify validation messages appear for invalid inputs.
2.  Verify unit toggles correctly convert values.
3.  Verify calculation results are accurate across different units.
