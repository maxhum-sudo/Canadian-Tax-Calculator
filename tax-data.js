// Tax Brackets for Canada - Federal and Provincial/Territorial (2025)
// Data sourced from Canada Revenue Agency (CRA) publications

// Federal Tax Brackets (2025)
const FEDERAL_TAX_BRACKETS = [
    { min: 0, max: 57375, rate: 0.14 },
    { min: 57375, max: 114750, rate: 0.205 },
    { min: 114750, max: 177882, rate: 0.26 },
    { min: 177882, max: 253414, rate: 0.29 },
    { min: 253414, max: Infinity, rate: 0.33 }
];

// Provincial/Territorial Tax Brackets (2025)
const PROVINCIAL_TAX_BRACKETS = {
    // Alberta
    AB: [
        { min: 0, max: 60000, rate: 0.06 }, // Prorated for 2025
        { min: 60000, max: 151234, rate: 0.10 },
        { min: 151234, max: 181481, rate: 0.12 },
        { min: 181481, max: 241974, rate: 0.13 },
        { min: 241974, max: 362961, rate: 0.14 },
        { min: 362961, max: Infinity, rate: 0.15 }
    ],
    
    // British Columbia
    BC: [
        { min: 0, max: 47937, rate: 0.0506 },
        { min: 47937, max: 95875, rate: 0.077 },
        { min: 95875, max: 110076, rate: 0.105 },
        { min: 110076, max: 133664, rate: 0.1229 },
        { min: 133664, max: 181232, rate: 0.147 },
        { min: 181232, max: 252752, rate: 0.168 },
        { min: 252752, max: Infinity, rate: 0.205 }
    ],
    
    // Manitoba
    MB: [
        { min: 0, max: 46513, rate: 0.108 }, // Prorated for 2025
        { min: 46513, max: 98796, rate: 0.1275 },
        { min: 98796, max: Infinity, rate: 0.174 }
    ],
    
    // New Brunswick
    NB: [
        { min: 0, max: 49958, rate: 0.094 },
        { min: 49958, max: 99916, rate: 0.14 },
        { min: 99916, max: 185064, rate: 0.16 },
        { min: 185064, max: Infinity, rate: 0.195 }
    ],
    
    // Newfoundland and Labrador
    NL: [
        { min: 0, max: 43198, rate: 0.087 },
        { min: 43198, max: 86395, rate: 0.145 },
        { min: 86395, max: 154244, rate: 0.158 },
        { min: 154244, max: 215943, rate: 0.173 },
        { min: 215943, max: Infinity, rate: 0.183 }
    ],
    
    // Northwest Territories
    NT: [
        { min: 0, max: 50877, rate: 0.059 },
        { min: 50877, max: 101754, rate: 0.086 },
        { min: 101754, max: 165429, rate: 0.122 },
        { min: 165429, max: Infinity, rate: 0.1405 }
    ],
    
    // Nova Scotia
    NS: [
        { min: 0, max: 29590, rate: 0.0879 },
        { min: 29590, max: 59180, rate: 0.1495 },
        { min: 59180, max: 93000, rate: 0.1667 },
        { min: 93000, max: 150000, rate: 0.175 },
        { min: 150000, max: Infinity, rate: 0.21 }
    ],
    
    // Nunavut
    NU: [
        { min: 0, max: 50877, rate: 0.04 },
        { min: 50877, max: 101754, rate: 0.07 },
        { min: 101754, max: 165429, rate: 0.09 },
        { min: 165429, max: Infinity, rate: 0.115 }
    ],
    
    // Ontario
    ON: [
        { min: 0, max: 51446, rate: 0.0505 },
        { min: 51446, max: 102894, rate: 0.0915 },
        { min: 102894, max: 150000, rate: 0.1116 },
        { min: 150000, max: 220000, rate: 0.1216 },
        { min: 220000, max: Infinity, rate: 0.1316 }
    ],
    
    // Prince Edward Island
    PE: [
        { min: 0, max: 32656, rate: 0.098 },
        { min: 32656, max: 65312, rate: 0.138 },
        { min: 65312, max: 105000, rate: 0.167 },
        { min: 105000, max: Infinity, rate: 0.18 }
    ],
    
    // Quebec (Note: Quebec has its own tax system, rates are combined)
    QC: [
        { min: 0, max: 51480, rate: 0.14 },
        { min: 51480, max: 102975, rate: 0.19 },
        { min: 102975, max: 123395, rate: 0.24 },
        { min: 123395, max: Infinity, rate: 0.2575 }
    ],
    
    // Saskatchewan
    SK: [
        { min: 0, max: 52057, rate: 0.105 },
        { min: 52057, max: 148734, rate: 0.125 },
        { min: 148734, max: Infinity, rate: 0.145 }
    ],
    
    // Yukon
    YT: [
        { min: 0, max: 50877, rate: 0.064 },
        { min: 50877, max: 101754, rate: 0.09 },
        { min: 101754, max: 165429, rate: 0.109 },
        { min: 165429, max: 500000, rate: 0.128 },
        { min: 500000, max: Infinity, rate: 0.15 }
    ]
};

/**
 * Calculate marginal tax rate for a given income and province
 * @param {number} income - Taxable income
 * @param {string} province - Province code (e.g., 'ON', 'BC')
 * @returns {number} Combined federal + provincial marginal tax rate (as decimal)
 */
function calculateMarginalRate(income, province) {
    if (!income || income <= 0) return 0;
    if (!province || !PROVINCIAL_TAX_BRACKETS[province]) return 0;
    
    let federalRate = 0;
    let provincialRate = 0;
    
    // Find federal marginal rate
    for (const bracket of FEDERAL_TAX_BRACKETS) {
        if (income > bracket.min && income <= bracket.max) {
            federalRate = bracket.rate;
            break;
        }
    }
    
    // Find provincial marginal rate
    const provincialBrackets = PROVINCIAL_TAX_BRACKETS[province];
    for (const bracket of provincialBrackets) {
        if (income > bracket.min && income <= bracket.max) {
            provincialRate = bracket.rate;
            break;
        }
    }
    
    return federalRate + provincialRate;
}

/**
 * Calculate effective tax rate (average tax rate)
 * @param {number} income - Taxable income
 * @param {string} province - Province code
 * @param {number} deductions - Total deductions (e.g., RRSP contributions)
 * @returns {number} Effective tax rate (as decimal)
 */
function calculateEffectiveRate(income, province, deductions = 0) {
    if (!income || income <= 0) return 0;
    if (!province || !PROVINCIAL_TAX_BRACKETS[province]) return 0;
    
    const taxableIncome = Math.max(0, income - deductions);
    if (taxableIncome <= 0) return 0;
    
    let federalTax = 0;
    let provincialTax = 0;
    let remainingIncome = taxableIncome;
    
    // Calculate federal tax
    for (const bracket of FEDERAL_TAX_BRACKETS) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }
    
    // Calculate provincial tax
    remainingIncome = taxableIncome;
    const provincialBrackets = PROVINCIAL_TAX_BRACKETS[province];
    for (const bracket of provincialBrackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        provincialTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }
    
    const totalTax = federalTax + provincialTax;
    return totalTax / income; // Effective rate based on original income
}

/**
 * Calculate tax savings from RRSP contribution
 * @param {number} contribution - RRSP contribution amount
 * @param {number} marginalRate - Marginal tax rate (as decimal)
 * @returns {number} Tax savings in dollars
 */
function calculateTaxSavings(contribution, marginalRate) {
    return contribution * marginalRate;
}

/**
 * Get tax bracket information for a province
 * @param {string} province - Province code
 * @returns {Array} Array of tax brackets
 */
function getProvincialBrackets(province) {
    return PROVINCIAL_TAX_BRACKETS[province] || [];
}

/**
 * Get federal tax brackets
 * @returns {Array} Array of federal tax brackets
 */
function getFederalBrackets() {
    return FEDERAL_TAX_BRACKETS;
}

// CPP and EI Rates for 2025
// Source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html
const CPP_RATES = {
    rate: 0.0595, // 5.95%
    maxPensionableEarnings: 71300,
    basicExemption: 3500,
    maxContribution: 4034.10
};

const EI_RATES = {
    rate: 0.0164, // 1.64% (2025 rate from CRA)
    maxInsurableEarnings: 65700, // $65,700 (2025 maximum from CRA)
    maxPremium: 1077.48 // $1,077.48 (2025 maximum employee premium from CRA)
};

/**
 * Calculate CPP contribution
 * @param {number} income - Annual income
 * @returns {number} CPP contribution amount
 */
function calculateCPP(income) {
    const pensionableEarnings = Math.min(income, CPP_RATES.maxPensionableEarnings);
    const contributoryEarnings = Math.max(0, pensionableEarnings - CPP_RATES.basicExemption);
    const cppContribution = contributoryEarnings * CPP_RATES.rate;
    return Math.min(cppContribution, CPP_RATES.maxContribution);
}

/**
 * Calculate EI premium
 * @param {number} income - Annual income
 * @returns {number} EI premium amount
 */
function calculateEI(income) {
    const insurableEarnings = Math.min(income, EI_RATES.maxInsurableEarnings);
    const eiPremium = insurableEarnings * EI_RATES.rate;
    return Math.min(eiPremium, EI_RATES.maxPremium);
}

/**
 * Calculate detailed tax breakdown
 * @param {number} income - Taxable income
 * @param {string} province - Province code
 * @param {number} deductions - Total deductions (e.g., RRSP contributions)
 * @returns {Object} Breakdown of federal tax, provincial tax, CPP, EI, and net income
 */
function calculateTaxBreakdown(income, province, deductions = 0) {
    if (!income || income <= 0 || !province || !PROVINCIAL_TAX_BRACKETS[province]) {
        return {
            federalTax: 0,
            provincialTax: 0,
            cpp: 0,
            ei: 0,
            totalDeductions: 0,
            netIncome: income
        };
    }
    
    const taxableIncome = Math.max(0, income - deductions);
    
    let federalTax = 0;
    let provincialTax = 0;
    let remainingIncome = taxableIncome;
    
    // Calculate federal tax
    for (const bracket of FEDERAL_TAX_BRACKETS) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }
    
    // Calculate provincial tax
    remainingIncome = taxableIncome;
    const provincialBrackets = PROVINCIAL_TAX_BRACKETS[province];
    for (const bracket of provincialBrackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        provincialTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }
    
    // Calculate CPP and EI (on gross income, before deductions)
    const cpp = calculateCPP(income);
    const ei = calculateEI(income);
    
    const totalDeductions = federalTax + provincialTax + cpp + ei;
    const netIncome = income - totalDeductions;
    
    return {
        federalTax,
        provincialTax,
        cpp,
        ei,
        totalDeductions,
        netIncome
    };
}

