# Standardizing UI Alerts

## Objective

To maintain a consistent look and feel across the application and simplify calculator implementation, all "alert" style messages (recommendations, warnings, interpretations) should be generated using `uiBuilder.createAlert()` instead of manually constructing HTML strings.

## Why?

1.  **Consistency**: Ensures all alerts use the same CSS classes, icons, and structure.
2.  **Maintainability**: A central changing point for alert styling (in `ui-builder.ts`).
3.  **Readability**: Makes calculator code cleaner and easier to read.
4.  **Type Safety**: Enforces valid alert types ('success' | 'warning' | 'info' | 'danger').

## Migration Guide

### Before (Manual HTML)

```typescript
// Old customResultRenderer
customResultRenderer: score => {
    // ... logic ...
    return `
        // ... other result items ...
        <div class="ui-alert ui-alert-danger mt-10">
            <span class="ui-alert-icon">⚠️</span>
            <div class="ui-alert-content">
                <strong>Recommendation:</strong> ${recommendation}
            </div>
        </div>
    `;
};
```

### After (uiBuilder)

```typescript
// New customResultRenderer
import { uiBuilder } from '../../ui-builder.js';

customResultRenderer: score => {
    // ... logic ...
    return `
        // ... other result items ...
        ${uiBuilder.createAlert({
            type: 'danger', // 'success' | 'warning' | 'info' | 'danger'
            message: `<strong>Recommendation:</strong> ${recommendation}`
        })}
    `;
};
```

## Best Practices

1.  **Alert Type Mapping**:
    - `success` (Green): Low risk, rule-out, good prognosis.
    - `info` (Blue): Neutral information, instructions.
    - `warning` (Yellow/Orange): Moderate risk, consider testing.
    - `danger` (Red): High risk, urgent intervention, bad prognosis.

2.  **Icons**: `uiBuilder.createAlert()` automatically adds the appropriate icon based on the type. Do not manually add icons inside the `message` unless strictly necessary for specific emphasis _within_ the text.

3.  **Content**: The `message` property supports HTML, so you can still use `<strong>`, `<br>`, etc.

4.  **Dynamic Types**: If the alert type changes based on the score, ensure strict typing:

    ```typescript
    const alertClass: 'success' | 'warning' | 'danger' = score > 5 ? 'danger' : 'success';

    uiBuilder.createAlert({
        type: alertClass,
        message: ...
    })
    ```
