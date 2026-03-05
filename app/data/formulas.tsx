// formulas.ts
import { CalculateRatiosPropsArray } from "./ratios";

// Define result types for different formula outputs
export type FormulaResultType = 'percentage' | 'currency' | 'ratio' | 'years' | 'decimal';

// Enhanced item type with proper typing
export type CalculateRatiosItem = typeof CalculateRatiosPropsArray[0];

// Interface for formula metadata
export interface FormulaMetadata {
    id: string;
    name: string;
    description: string;
    category: 'return' | 'valuation' | 'risk' | 'efficiency' | 'leverage';
    resultType: FormulaResultType;
    unit?: string; // π.χ. '€/m²', 'x', 'έτη'
    decimalPlaces: number;
    requires: string[]; // Required fields for this formula
}

export interface Formula {
    id: string;
    metadata: FormulaMetadata;
    calculate: (item: CalculateRatiosItem) => number;
    format?: (value: number) => string; // Optional custom formatter
}

// Type guard to check if a value is a valid number
const isValidNumber = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0;
};

// Safe number extraction helper
const getNumberValue = (value: any, defaultValue: number = 0): number => {
    return isValidNumber(value) ? value as number : defaultValue;
};

// Μορφοποίηση ανάλογα με τον τύπο
const formatValue = (value: number, type: FormulaResultType, decimals: number = 2): string => {
    switch (type) {
        case 'percentage':
            return `${value.toFixed(decimals)}%`;
        case 'currency':
            return new Intl.NumberFormat('el-GR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        case 'years':
            return `${value.toFixed(decimals)} έτη`;
        case 'ratio':
            return value.toFixed(decimals);
        default:
            return value.toFixed(decimals);
    }
};

export const formulas: Record<number, Formula> = {
    // 1. Gross Rental Yield - ΠΟΣΟΣΤΟ
    1: {
        id: '1',
        metadata: {
            id: '1',
            name: 'Μικτή Απόδοση Ενοικίου',
            description: 'Μικτό ετήσιο εισόδημα ως ποσοστό της αξίας του ακινήτου',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'propertyPrice']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const propertyPrice = getNumberValue(item.inputValues.propertyPrice);

            if (propertyPrice <= 0) return 0;
            return (annualRentalIncome / propertyPrice) * 100;
        }
    },

    // 2. Net Rental Yield - ΠΟΣΟΣΤΟ
    2: {
        id: '2',
        metadata: {
            id: '2',
            name: 'Καθαρή Απόδοση Ενοικίου',
            description: 'Καθαρό ετήσιο εισόδημα μετά από έξοδα ως ποσοστό της αξίας',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'propertyPrice']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const propertyPrice = getNumberValue(item.inputValues.propertyPrice);

            if (propertyPrice <= 0) return 0;
            const netIncome = annualRentalIncome - annualExpenses;
            return (netIncome / propertyPrice) * 100;
        }
    },

    // 3. Price per Square Meter - ΧΡΗΜΑ/m²
    3: {
        id: '3',
        metadata: {
            id: '3',
            name: 'Τιμή ανά Τετραγωνικό',
            description: 'Τιμή ακινήτου ανά τετραγωνικό μέτρο',
            category: 'valuation',
            resultType: 'currency',
            unit: '€/m²',
            decimalPlaces: 2,
            requires: ['propertyPrice', 'totalArea']
        },
        calculate: (item) => {
            const propertyPrice = getNumberValue(item.inputValues.propertyPrice);
            const totalArea = getNumberValue(item.inputValues.totalArea);

            if (totalArea <= 0) return 0;
            return propertyPrice / totalArea;
        }
    },

    // 4. Rent per Square Meter - ΧΡΗΜΑ/m²
    4: {
        id: '4',
        metadata: {
            id: '4',
            name: 'Ενοίκιο ανά Τετραγωνικό',
            description: 'Μηνιαίο ενοίκιο ανά τετραγωνικό μέτρο',
            category: 'valuation',
            resultType: 'currency',
            unit: '€/m²',
            decimalPlaces: 2,
            requires: ['monthlyRent', 'totalArea']
        },
        calculate: (item) => {
            const monthlyRent = getNumberValue(item.inputValues.monthlyRent);
            const totalArea = getNumberValue(item.inputValues.totalArea);

            if (totalArea <= 0) return 0;
            return monthlyRent / totalArea;
        }
    },

    // 5. Net Operating Income - ΧΡΗΜΑ
    5: {
        id: '5',
        metadata: {
            id: '5',
            name: 'Καθαρό Λειτουργικό Εισόδημα (NOI)',
            description: 'Ετήσιο εισόδημα μείον λειτουργικά έξοδα',
            category: 'return',
            resultType: 'currency',
            unit: '€',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'operatingExpenses']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const operatingExpenses = getNumberValue(item.inputValues.operatingExpenses);

            return annualRentalIncome - operatingExpenses;
        }
    },

    // 6. Annual Cash Flow - ΧΡΗΜΑ
    6: {
        id: '6',
        metadata: {
            id: '6',
            name: 'Ετήσια Ταμειακή Ροή',
            description: 'Καθαρό εισόδημα μετά από όλα τα έξοδα και δάνεια',
            category: 'return',
            resultType: 'currency',
            unit: '€',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'annualLoanPayments']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const annualLoanPayments = getNumberValue(item.inputValues.annualLoanPayments);

            return (annualRentalIncome - annualExpenses) - annualLoanPayments;
        }
    },

    // 7. Operating Expense Ratio - ΠΟΣΟΣΤΟ
    7: {
        id: '7',
        metadata: {
            id: '7',
            name: 'Δείκτης Λειτουργικών Εξόδων',
            description: 'Λειτουργικά έξοδα ως ποσοστό του εισοδήματος',
            category: 'efficiency',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['operatingExpenses', 'annualRentalIncome']
        },
        calculate: (item) => {
            const operatingExpenses = getNumberValue(item.inputValues.operatingExpenses);
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);

            if (annualRentalIncome <= 0) return 0;
            return (operatingExpenses / annualRentalIncome) * 100;
        }
    },

    // 8. Cap Rate - ΠΟΣΟΣΤΟ
    8: {
        id: '8',
        metadata: {
            id: '8',
            name: 'Cap Rate (Συντελεστής Κεφαλαιοποίησης)',
            description: 'Καθαρό λειτουργικό εισόδημα ως ποσοστό της αξίας',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'propertyValue']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const propertyValue = getNumberValue(item.inputValues.propertyValue);

            if (propertyValue <= 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return (noi / propertyValue) * 100;
        }
    },

    // 9. Cash on Cash Return - ΠΟΣΟΣΤΟ
    9: {
        id: '9',
        metadata: {
            id: '9',
            name: 'Cash on Cash Return',
            description: 'Ετήσια ταμειακή ροή ως ποσοστό των μετρητών που επενδύθηκαν',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'annualLoanPayments', 'cashInvested']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const annualLoanPayments = getNumberValue(item.inputValues.annualLoanPayments);
            const cashInvested = getNumberValue(item.inputValues.cashInvested);

            if (cashInvested <= 0) return 0;
            const cashFlow = (annualRentalIncome - annualExpenses) - annualLoanPayments;
            return (cashFlow / cashInvested) * 100;
        }
    },

    // 10. Loan to Value - ΠΟΣΟΣΤΟ
    10: {
        id: '10',
        metadata: {
            id: '10',
            name: 'Δείκτης Δανείου προς Αξία (LTV)',
            description: 'Ποσό δανείου ως ποσοστό της αξίας του ακινήτου',
            category: 'leverage',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['loanAmount', 'propertyValue']
        },
        calculate: (item) => {
            const loanAmount = getNumberValue(item.inputValues.loanAmount);
            const propertyValue = getNumberValue(item.inputValues.propertyValue);

            if (propertyValue <= 0) return 0;
            return (loanAmount / propertyValue) * 100;
        }
    },

    // 11. Debt Coverage Ratio - ΑΡΙΘΜΟΣ (όχι ποσοστό)
    11: {
        id: '11',
        metadata: {
            id: '11',
            name: 'Δείκτης Κάλυψης Χρέους (DCR)',
            description: 'Καθαρό λειτουργικό εισόδημα προς ετήσιες δόσεις δανείου',
            category: 'risk',
            resultType: 'ratio',
            unit: 'x',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'annualLoanPayments']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const annualLoanPayments = getNumberValue(item.inputValues.annualLoanPayments);

            if (annualLoanPayments <= 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return noi / annualLoanPayments;
        }
    },

    // 12. Occupancy Rate - ΠΟΣΟΣΤΟ
    12: {
        id: '12',
        metadata: {
            id: '12',
            name: 'Ποσοστό Πληρότητας',
            description: 'Ημέρες ενοικίασης ως ποσοστό των συνολικών ημερών',
            category: 'efficiency',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['daysRented', 'totalDays']
        },
        calculate: (item) => {
            const daysRented = getNumberValue(item.inputValues.daysRented);
            const totalDays = getNumberValue(item.inputValues.totalDays);

            if (totalDays <= 0) return 0;
            return (daysRented / totalDays) * 100;
        }
    },

    // 13. Vacancy Rate - ΠΟΣΟΣΤΟ
    13: {
        id: '13',
        metadata: {
            id: '13',
            name: 'Ποσοστό Κενών',
            description: 'Ημέρες κενών ως ποσοστό των συνολικών ημερών',
            category: 'risk',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['daysVacant', 'totalDays']
        },
        calculate: (item) => {
            const daysVacant = getNumberValue(item.inputValues.daysVacant);
            const totalDays = getNumberValue(item.inputValues.totalDays);

            if (totalDays <= 0) return 0;
            return (daysVacant / totalDays) * 100;
        }
    },

    // 14. Gross Rent Multiplier - ΑΡΙΘΜΟΣ (όχι ποσοστό)
    14: {
        id: '14',
        metadata: {
            id: '14',
            name: 'Μικτός Πολλαπλασιαστής Ενοικίου (GRM)',
            description: 'Τιμή ακινήτου προς ετήσιο εισόδημα',
            category: 'valuation',
            resultType: 'ratio',
            unit: 'x',
            decimalPlaces: 2,
            requires: ['propertyPrice', 'annualRentalIncome']
        },
        calculate: (item) => {
            const propertyPrice = getNumberValue(item.inputValues.propertyPrice);
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);

            if (annualRentalIncome <= 0) return 0;
            return propertyPrice / annualRentalIncome;
        }
    },

    // 15. Equity Dividend Rate - ΠΟΣΟΣΤΟ
    15: {
        id: '15',
        metadata: {
            id: '15',
            name: 'Equity Dividend Rate',
            description: 'Καθαρό λειτουργικό εισόδημα ως ποσοστό του δανείου',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'annualExpenses', 'loanAmount']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const annualExpenses = getNumberValue(item.inputValues.annualExpenses);
            const loanAmount = getNumberValue(item.inputValues.loanAmount);

            if (loanAmount <= 0) return 0;
            const noi = annualRentalIncome - annualExpenses;
            return (noi / loanAmount) * 100;
        }
    },

    // 16. Break-even Occupancy - ΠΟΣΟΣΤΟ
    16: {
        id: '16',
        metadata: {
            id: '16',
            name: 'Νεκρό Σημείο Πληρότητας',
            description: 'Ποσοστό εισοδήματος που καλύπτει έξοδα και δάνειο',
            category: 'risk',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualRentalIncome', 'operatingExpenses', 'annualLoanPayments']
        },
        calculate: (item) => {
            const annualRentalIncome = getNumberValue(item.inputValues.annualRentalIncome);
            const operatingExpenses = getNumberValue(item.inputValues.operatingExpenses);
            const annualLoanPayments = getNumberValue(item.inputValues.annualLoanPayments);

            if (annualRentalIncome <= 0) return 0;
            return ((operatingExpenses + annualLoanPayments) / annualRentalIncome) * 100;
        }
    },

    // 17. Monthly Rent to Price Ratio - ΠΟΣΟΣΤΟ
    17: {
        id: '17',
        metadata: {
            id: '17',
            name: 'Λόγος Μηνιαίου Ενοικίου προς Τιμή',
            description: 'Μηνιαίο ενοίκιο ως ποσοστό της τιμής',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['monthlyRent', 'propertyPrice']
        },
        calculate: (item) => {
            const monthlyRent = getNumberValue(item.inputValues.monthlyRent);
            const propertyPrice = getNumberValue(item.inputValues.propertyPrice);

            if (propertyPrice <= 0) return 0;
            return (monthlyRent / propertyPrice) * 100;
        }
    },

    // 18. ROI on Cash Investment - ΠΟΣΟΣΤΟ
    18: {
        id: '18',
        metadata: {
            id: '18',
            name: 'Απόδοση Επένδυσης (ROI)',
            description: 'Ετήσια ταμειακή ροή ως ποσοστό των μετρητών που επενδύθηκαν',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['annualCashFlow', 'cashInvested']
        },
        calculate: (item) => {
            const annualCashFlow = getNumberValue(item.inputValues.annualCashFlow);
            const cashInvested = getNumberValue(item.inputValues.cashInvested);

            if (cashInvested <= 0) return 0;
            return (annualCashFlow / cashInvested) * 100;
        }
    },

    // 19. Internal Rate of Return - ΠΟΣΟΣΤΟ
    19: {
        id: '19',
        metadata: {
            id: '19',
            name: 'Εσωτερικός Βαθμός Απόδοσης (IRR)',
            description: 'Μέση ετήσια απόδοση επένδυσης',
            category: 'return',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['cashFlows', 'initialInvestment']
        },
        calculate: (item) => {
            const cashFlows = item.inputValues.cashFlows as number[] || [];
            const initialInvestment = getNumberValue(item.inputValues.initialInvestment);

            if (!cashFlows.length || initialInvestment <= 0) return 0;

            const totalCashFlow = cashFlows.reduce((sum, flow) => sum + (isValidNumber(flow) ? flow : 0), 0);
            const averageAnnualCashFlow = totalCashFlow / cashFlows.length;

            return (averageAnnualCashFlow / initialInvestment) * 100;
        }
    },

    // 20. Operating Expense Ratio (OER) - ΠΟΣΟΣΤΟ
    20: {
        id: '20',
        metadata: {
            id: '20',
            name: 'Δείκτης Λειτουργικών Εξόδων (OER)',
            description: 'Λειτουργικά έξοδα ως ποσοστό της αξίας',
            category: 'efficiency',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['operatingExpenses', 'propertyValue']
        },
        calculate: (item) => {
            const operatingExpenses = getNumberValue(item.inputValues.operatingExpenses);
            const propertyValue = getNumberValue(item.inputValues.propertyValue);

            if (propertyValue <= 0) return 0;
            return (operatingExpenses / propertyValue) * 100;
        }
    },

    // 21. Gross Profit Margin - ΠΟΣΟΣΤΟ
    21: {
        id: '21',
        metadata: {
            id: '21',
            name: 'Μικτό Περιθώριο Κέρδους',
            description: 'Μικτό κέρδος ως ποσοστό των εσόδων',
            category: 'efficiency',
            resultType: 'percentage',
            unit: '%',
            decimalPlaces: 2,
            requires: ['grossProfit', 'revenue']
        },
        calculate: (item) => {
            const grossProfit = getNumberValue(item.inputValues.grossProfit);
            const revenue = getNumberValue(item.inputValues.revenue);

            if (revenue <= 0) return 0;
            return (grossProfit / revenue) * 100;
        }
    }
};

// Helper function to calculate any ratio with validation
export function calculateRatio(id: number, item: CalculateRatiosItem): number {
    const formula = formulas[id];
    if (!formula) {
        console.warn(`No formula found for ratio ID: ${id}`);
        return 0;
    }

    try {
        return formula.calculate(item);
    } catch (error) {
        console.error(`Error calculating formula ${id}:`, error);
        return 0;
    }
}

// Helper function to calculate ratio with formatted result
export function calculateAndFormatRatio(id: number, item: CalculateRatiosItem): string {
    const formula = formulas[id];
    if (!formula) {
        return 'N/A';
    }

    const value = calculateRatio(id, item);

    // Μορφοποίηση ανάλογα με τον τύπο
    return formatValue(value, formula.metadata.resultType, formula.metadata.decimalPlaces);
}

// Helper function to calculate all ratios at once
export function calculateAllRatios(item: CalculateRatiosItem): Record<number, number> {
    const results: Record<number, number> = {};

    for (const id of Object.keys(formulas)) {
        const numId = parseInt(id);
        results[numId] = calculateRatio(numId, item);
    }

    return results;
}

// Helper function to calculate all ratios with metadata
export function calculateAllRatiosWithMetadata(item: CalculateRatiosItem): Array<{
    id: number;
    value: number;
    formattedValue: string;
    metadata: FormulaMetadata;
}> {
    return Object.entries(formulas).map(([id, formula]) => {
        const numId = parseInt(id);
        const value = calculateRatio(numId, item);
        const formattedValue = calculateAndFormatRatio(numId, item);

        return {
            id: numId,
            value,
            formattedValue,
            metadata: formula.metadata
        };
    });
}

export default formulas;
