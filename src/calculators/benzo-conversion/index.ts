/**
 * Benzodiazepine Conversion Calculator
 *
 * 使用 Conversion Calculator 工廠函數
 * 苯二氮平類藥物等效劑量換算（含範圍）
 */

import { createConversionCalculator, ConversionMatrix } from '../shared/conversion-calculator.js';
import { uiBuilder } from '../../ui-builder.js';

// 苯二氮平類換算矩陣（包含範圍）
const conversionMatrix: ConversionMatrix = {
    alprazolam: {
        chlordiazepoxide: { factor: 25, range: [15, 50] },
        diazepam: { factor: 10, range: [5, 20] },
        clonazepam: { factor: 0.5, range: [0.5, 4] },
        lorazepam: { factor: 0.5, range: [1, 4] },
        oxazepam: { factor: 20, range: [5, 40] },
        temazepam: { factor: 20, range: [5, 40] },
        triazolam: { factor: 0.5, range: [1, 4] }
    },
    chlordiazepoxide: {
        alprazolam: { factor: 1 / 25, range: [1 / 50, 1 / 15] },
        diazepam: { factor: 1 / 3, range: [1 / 5, 1 / 1.25] },
        clonazepam: { factor: 1 / 20, range: [1 / 50, 1 / 6.25] },
        lorazepam: { factor: 1 / 10, range: [1 / 25, 1 / 6.25] },
        oxazepam: { factor: 0.5, range: [0.2, 1.6] },
        temazepam: { factor: 0.5, range: [0.2, 1.6] },
        triazolam: { factor: 1 / 75, range: [1 / 100, 1 / 25] }
    },
    diazepam: {
        alprazolam: { factor: 1 / 10, range: [1 / 20, 1 / 5] },
        chlordiazepoxide: { factor: 3, range: [1.25, 5] },
        clonazepam: { factor: 1 / 10, range: [1 / 20, 1 / 2.5] },
        lorazepam: { factor: 1 / 6, range: [1 / 10, 1 / 2.5] },
        oxazepam: { factor: 0.5, range: [0.5, 4] },
        temazepam: { factor: 0.5, range: [0.5, 4] },
        triazolam: { factor: 1 / 20, range: [1 / 40, 1 / 10] }
    },
    clonazepam: {
        alprazolam: { factor: 2, range: [0.5, 4] },
        chlordiazepoxide: { factor: 20, range: [6.25, 50] },
        diazepam: { factor: 10, range: [2.5, 20] },
        lorazepam: { factor: 2, range: [0.5, 4] },
        oxazepam: { factor: 20, range: [2.5, 40] },
        temazepam: { factor: 20, range: [2.5, 40] },
        triazolam: { factor: 1 / 4, range: [1 / 8, 1] }
    },
    lorazepam: {
        alprazolam: { factor: 2, range: [1, 4] },
        chlordiazepoxide: { factor: 10, range: [6.25, 25] },
        diazepam: { factor: 6, range: [2.5, 10] },
        clonazepam: { factor: 2, range: [0.5, 4] },
        oxazepam: { factor: 10, range: [2.5, 20] },
        temazepam: { factor: 10, range: [2.5, 20] },
        triazolam: { factor: 1 / 4, range: [1 / 8, 1 / 2] }
    },
    oxazepam: {
        alprazolam: { factor: 1 / 20, range: [1 / 40, 1 / 5] },
        chlordiazepoxide: { factor: 2, range: [0.2, 1.6] },
        diazepam: { factor: 2, range: [0.5, 4] },
        clonazepam: { factor: 1 / 20, range: [1 / 40, 1 / 2.5] },
        lorazepam: { factor: 1 / 10, range: [1 / 20, 1 / 2.5] },
        temazepam: { factor: 1, range: [0.25, 4] },
        triazolam: { factor: 1 / 40, range: [1 / 80, 1 / 10] }
    },
    temazepam: {
        alprazolam: { factor: 1 / 20, range: [1 / 40, 1 / 5] },
        chlordiazepoxide: { factor: 2, range: [0.2, 1.6] },
        diazepam: { factor: 2, range: [0.5, 4] },
        clonazepam: { factor: 1 / 20, range: [1 / 40, 1 / 2.5] },
        lorazepam: { factor: 1 / 10, range: [1 / 20, 1 / 2.5] },
        oxazepam: { factor: 1, range: [0.25, 4] },
        triazolam: { factor: 1 / 40, range: [1 / 80, 1 / 10] }
    },
    triazolam: {
        alprazolam: { factor: 2, range: [1, 4] },
        chlordiazepoxide: { factor: 75, range: [25, 100] },
        diazepam: { factor: 20, range: [10, 40] },
        clonazepam: { factor: 4, range: [1, 8] },
        lorazepam: { factor: 4, range: [2, 8] },
        oxazepam: { factor: 40, range: [10, 80] },
        temazepam: { factor: 40, range: [10, 80] }
    }
};

export const benzoConversion = createConversionCalculator({
    id: 'benzo-conversion',
    title: 'Benzodiazepine Conversion Calculator',
    description:
        'Provides equivalents between different benzodiazepines based on a conversion factor table.',

    drugs: [
        { id: 'alprazolam', name: 'Alprazolam (Xanax)', equivalentDose: 0.5 },
        { id: 'chlordiazepoxide', name: 'Chlordiazepoxide (Librium)', equivalentDose: 25 },
        { id: 'diazepam', name: 'Diazepam (Valium)', equivalentDose: 10 },
        { id: 'clonazepam', name: 'Clonazepam (Klonopin)', equivalentDose: 0.5 },
        { id: 'lorazepam', name: 'Lorazepam (Ativan)', equivalentDose: 1 },
        { id: 'oxazepam', name: 'Oxazepam (Serax)', equivalentDose: 20 },
        { id: 'temazepam', name: 'Temazepam (Restoril)', equivalentDose: 20 },
        { id: 'triazolam', name: 'Triazolam (Halcion)', equivalentDose: 0.25 }
    ],

    conversionMatrix,
    showRange: true,
    unit: 'mg',

    conversionTable: {
        show: false // 苯二氮平類換算比較複雜，不顯示簡單等效表
    },

    warningAlert:
        '<strong>IMPORTANT:</strong> This calculator should be used as a reference for oral benzodiazepine conversions. Equipotent benzodiazepine doses are reported as ranges due to paucity of literature supporting exact conversions.',

    infoAlert:
        '<strong>INSTRUCTIONS:</strong> Do not use to calculate initial dose for a benzo-naïve patient.',

    additionalInfo: `
        ${uiBuilder.createAlert({
            type: 'info',
            message: `
                <h4>Clinical Considerations</h4>
                <ul>
                    <li><strong>Half-life varies widely:</strong> Short (triazolam), Intermediate (lorazepam, oxazepam), Long (diazepam, clonazepam)</li>
                    <li><strong>Hepatic metabolism:</strong> Lorazepam, oxazepam, temazepam undergo glucuronidation only - safer in liver disease</li>
                    <li><strong>Active metabolites:</strong> Diazepam, chlordiazepoxide have long-acting active metabolites</li>
                    <li><strong>Tapering:</strong> Consider switching to longer-acting agent (diazepam) for gradual taper</li>
                </ul>
            `
        })}

        ${uiBuilder.createSection({
            title: 'Formula',
            icon: '📐',
            content: `
                <h4 class="mb-10">Duration of Action</h4>
                ${uiBuilder.createTable({
                    headers: ['Benzodiazepine', 'Duration of action'],
                    rows: [
                        ['ALPRAZolam (Xanax)', 'Short'],
                        ['ChlordiazePOXIDE (Librium)', 'Long'],
                        ['DiazePAM (Valium)', 'Long'],
                        ['ClonazePAM (KlonoPIN)', 'Long'],
                        ['LORazepam (Ativan)', 'Intermediate'],
                        ['Oxazepam (Serax)', 'Short'],
                        ['Temazepam (Restoril)', 'Intermediate'],
                        ['Triazolam (Halcion)', 'Short']
                    ]
                })}

                <h4 class="mt-20 mb-10">Conversion Factors</h4>
                <p class="text-sm text-muted mb-10">Highlighted cell is used for example below</p>
                ${uiBuilder.createTable({
                    headers: [
                        '',
                        'From Xanax',
                        'From Librium',
                        'From Valium',
                        'From Klonopin',
                        'From Ativan',
                        'From Serax',
                        'From Restoril',
                        'From Halcion'
                    ],
                    rows: [
                        [
                            '<strong>To Xanax</strong>',
                            '1',
                            '÷ 25',
                            '÷ 10',
                            '× 2',
                            '× 2',
                            '÷ 20',
                            '÷ 20',
                            '× 2'
                        ],
                        ['Range', 'n/a', '15-50', '5-20', '0.5-4', '1-4', '5-40', '5-40', '1-4'],
                        [
                            '<strong>To Librium</strong>',
                            '× 25',
                            '1',
                            '× 3',
                            '× 20',
                            '× 10',
                            '÷ 0.5',
                            '÷ 0.5',
                            '× 75'
                        ],
                        [
                            'Range',
                            '15-50',
                            'n/a',
                            '1.25-5',
                            '6.25-50',
                            '6.25-25',
                            '0.2-1.6',
                            '0.2-1.6',
                            '25-100'
                        ],
                        [
                            '<strong>To Valium</strong>',
                            '× 10',
                            '÷ 3',
                            '1',
                            '× 10',
                            '× 6',
                            '× 2',
                            '× 2',
                            '× 20'
                        ],
                        [
                            'Range',
                            '5-20',
                            '1.25-5',
                            'n/a',
                            '2.5-20',
                            '2.5-10',
                            '0.5-4',
                            '0.5-4',
                            '10-40'
                        ],
                        [
                            '<strong>To Klonopin</strong>',
                            '÷ 2',
                            '÷ 20',
                            '÷ 10',
                            '1',
                            '÷ 2',
                            '÷ 20',
                            '÷ 20',
                            '× 4'
                        ],
                        [
                            'Range',
                            '0.5-4',
                            '6.25-50',
                            '2.5-20',
                            'n/a',
                            '0.5-4',
                            '2.5-40',
                            '2.5-40',
                            '1-8'
                        ],
                        [
                            '<strong>To Ativan</strong>',
                            '÷ 2',
                            '÷ 10',
                            '÷ 6',
                            '× 2',
                            '1',
                            '÷ 10',
                            '÷ 10',
                            '× 4'
                        ],
                        [
                            'Range',
                            '1-4',
                            '6.25-25',
                            '2.5-10',
                            '0.5-4',
                            'n/a',
                            '2.5-20',
                            '2.5-20',
                            '2-8'
                        ],
                        [
                            '<strong>To Serax</strong>',
                            '× 20',
                            '× 0.5',
                            '÷ 2',
                            '× 20',
                            '× 10',
                            '1',
                            '× 1',
                            '× 40'
                        ],
                        [
                            'Range',
                            '5-40',
                            '0.2-1.6',
                            '0.5-4',
                            '2.5-40',
                            '2.5-20',
                            'n/a',
                            '0.25-4',
                            '10-80'
                        ],
                        [
                            '<strong>To Restoril</strong>',
                            '× 20',
                            '× 0.5',
                            '÷ 2',
                            '× 20',
                            '× 10',
                            '× 1',
                            '1',
                            '× 40'
                        ],
                        [
                            'Range',
                            '5-40',
                            '0.2-1.6',
                            '0.5-4',
                            '2.5-40',
                            '2.5-20',
                            '0.25-4',
                            'n/a',
                            '10-80'
                        ],
                        [
                            '<strong>To Halcion</strong>',
                            '÷ 2',
                            '÷ 75',
                            '÷ 20',
                            '÷ 4',
                            '÷ 4',
                            '÷ 40',
                            '÷ 40',
                            '1'
                        ],
                        ['Range', '1-4', '25-100', '10-40', '1-8', '2-8', '10-80', '10-80', 'n/a']
                    ],
                    stickyFirstColumn: true
                })}
    `
        })}
`
});
