// Contribution Limits and Rules for Canadian Tax-Advantaged Accounts (2025)

const CONTRIBUTION_LIMITS = {
    TFSA: {
        annualLimit: 7000, // 2025
        // Historical TFSA limits (for calculating cumulative room)
        historicalLimits: {
            2009: 5000,
            2010: 5000,
            2011: 5000,
            2012: 5000,
            2013: 5500,
            2014: 5500,
            2015: 10000,
            2016: 5500,
            2017: 5500,
            2018: 5500,
            2019: 6000,
            2020: 6000,
            2021: 6000,
            2022: 6000,
            2023: 6500,
            2024: 7000,
            2025: 7000
        },
        minAge: 18,
        description: "Tax-Free Savings Account - contributions accumulate from age 18"
    },
    
    FHSA: {
        annualLimit: 8000,
        lifetimeLimit: 40000,
        maxCarryForward: 8000, // Maximum unused room that can be carried forward
        description: "First Home Savings Account - for first-time home buyers only"
    },
    
    RRSP: {
        percentageOfIncome: 0.18, // 18% of previous year's earned income
        maxAnnualLimit: 30780, // 2025 maximum
        description: "Registered Retirement Savings Plan - 18% of income up to maximum"
    },
    
    RESP: {
        lifetimeLimitPerBeneficiary: 50000,
        cesgMatchRate: 0.20, // 20% match
        cesgMaxAnnualMatch: 2500, // Maximum contribution eligible for match per beneficiary
        cesgMaxAnnualGrant: 500, // Maximum grant per beneficiary per year
        description: "Registered Education Savings Plan - $50,000 lifetime limit per child"
    }
};

/**
 * Calculate TFSA contribution room based on age
 * @param {number} age - Current age
 * @param {number} totalContributions - Total lifetime contributions to TFSA
 * @returns {number} Available TFSA contribution room
 */
function calculateTFSARoom(age, totalContributions = 0) {
    if (age < CONTRIBUTION_LIMITS.TFSA.minAge) {
        return 0;
    }
    
    const currentYear = 2025;
    const startYear = Math.max(2009, currentYear - (age - CONTRIBUTION_LIMITS.TFSA.minAge));
    let totalRoom = 0;
    
    // Sum up all historical limits from start year to current year
    for (let year = startYear; year <= currentYear; year++) {
        if (CONTRIBUTION_LIMITS.TFSA.historicalLimits[year]) {
            totalRoom += CONTRIBUTION_LIMITS.TFSA.historicalLimits[year];
        }
    }
    
    // Subtract total contributions
    const availableRoom = Math.max(0, totalRoom - totalContributions);
    
    return availableRoom;
}

/**
 * Calculate FHSA contribution room
 * @param {number} age - Current age
 * @param {boolean} isFirstTimeBuyer - Whether user is eligible for FHSA
 * @param {number} currentYearContributions - Contributions made this year
 * @param {number} lifetimeContributions - Total lifetime contributions
 * @param {number} unusedRoomFromPreviousYears - Unused room from previous years (max $8,000)
 * @returns {number} Available FHSA contribution room
 */
function calculateFHSARoom(age, isFirstTimeBuyer, currentYearContributions = 0, lifetimeContributions = 0, unusedRoomFromPreviousYears = 0) {
    if (age < 18) {
        return 0;
    }
    if (!isFirstTimeBuyer) {
        return 0;
    }
    
    // Check lifetime limit
    const remainingLifetimeRoom = Math.max(0, CONTRIBUTION_LIMITS.FHSA.lifetimeLimit - lifetimeContributions);
    
    // Annual limit with carry-forward (max $8,000 carry-forward)
    const maxCarryForward = Math.min(CONTRIBUTION_LIMITS.FHSA.maxCarryForward, unusedRoomFromPreviousYears);
    const annualRoomWithCarryForward = CONTRIBUTION_LIMITS.FHSA.annualLimit + maxCarryForward;
    
    // Available room is the minimum of remaining lifetime room and annual room with carry-forward
    const availableRoom = Math.min(remainingLifetimeRoom, annualRoomWithCarryForward - currentYearContributions);
    
    return Math.max(0, availableRoom);
}

/**
 * Calculate RRSP contribution room
 * @param {number} age - Current age
 * @param {number} income - Previous year's earned income (or current year if not available)
 * @param {number} currentYearContributions - Contributions made this year (including company match)
 * @param {number} carryForwardRoom - Unused room from previous years
 * @returns {number} Available RRSP contribution room
 */
function calculateRRSPRoom(age, income, currentYearContributions = 0, carryForwardRoom = 0) {
    if (age < 18) {
        return 0;
    }
    
    // Calculate new room: 18% of income, capped at maximum
    const newRoom = Math.min(income * CONTRIBUTION_LIMITS.RRSP.percentageOfIncome, CONTRIBUTION_LIMITS.RRSP.maxAnnualLimit);
    
    // Total available room = new room + carry-forward - current contributions
    const totalRoom = newRoom + carryForwardRoom;
    const availableRoom = Math.max(0, totalRoom - currentYearContributions);
    
    return availableRoom;
}

/**
 * Calculate RESP contribution room
 * @param {number} age - Current age (of the contributor)
 * @param {number} numChildren - Number of children/beneficiaries
 * @param {number} currentYearContributions - Total contributions made this year across all children
 * @param {number} lifetimeContributions - Total lifetime contributions across all children
 * @returns {number} Available RESP contribution room
 */
function calculateRESPRoom(age, numChildren, currentYearContributions = 0, lifetimeContributions = 0) {
    if (age < 18) {
        return 0;
    }
    if (numChildren <= 0) {
        return 0;
    }
    
    const totalLifetimeLimit = numChildren * CONTRIBUTION_LIMITS.RESP.lifetimeLimitPerBeneficiary;
    const remainingLifetimeRoom = Math.max(0, totalLifetimeLimit - lifetimeContributions);
    
    // Note: There's no annual limit, but we consider lifetime limit
    // Current year contributions are already included in lifetimeContributions
    return remainingLifetimeRoom;
}

/**
 * Calculate optimal RESP contribution for CESG matching
 * @param {number} numChildren - Number of children
 * @param {number} availableFunds - Funds available to contribute
 * @returns {number} Recommended contribution to maximize CESG matching
 */
function calculateOptimalRESPContribution(numChildren, availableFunds) {
    if (numChildren <= 0) {
        return 0;
    }
    
    // Optimal is $2,500 per child to maximize 20% CESG match ($500 grant per child)
    const optimalPerChild = CONTRIBUTION_LIMITS.RESP.cesgMaxAnnualMatch;
    const totalOptimal = numChildren * optimalPerChild;
    
    // Return the minimum of optimal amount and available funds
    return Math.min(totalOptimal, availableFunds);
}

