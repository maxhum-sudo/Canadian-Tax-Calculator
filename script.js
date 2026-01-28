// Main application logic for Canada Tax Account Optimizer

// State management
let updateTimeout = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    // Initialize slider after a brief delay to ensure DOM is ready
    setTimeout(() => {
        const amountSlider = document.getElementById('amountSlider');
        if (amountSlider) {
            amountSlider.addEventListener('input', handleSliderChange);
            // Set initial slider value
            const amountToMove = parseFloat(document.getElementById('amountToMove').value) || 0;
            amountSlider.value = Math.min(100000, Math.max(0, amountToMove));
            const sliderValue = document.getElementById('sliderValue');
            if (sliderValue) {
                sliderValue.textContent = formatCurrency(amountToMove);
            }
        }
    }, 100);
    updateUI();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Part 1 inputs
    document.getElementById('province').addEventListener('change', handleInputChange);
    document.getElementById('income').addEventListener('input', handleInputChange);
    document.getElementById('amountToMove').addEventListener('input', handleAmountSavedChange);
    
    // Amount slider (initialize after DOM is ready)
    setTimeout(() => {
        const amountSlider = document.getElementById('amountSlider');
        if (amountSlider) {
            amountSlider.addEventListener('input', handleSliderChange);
        }
    }, 100);
    document.querySelectorAll('input[name="homePurchase"]').forEach(radio => {
        radio.addEventListener('change', handleHomePurchaseChange);
    });
    
    // Part 2 inputs
    document.getElementById('age').addEventListener('input', handleInputChange);
    document.getElementById('tfsaTotalContributions').addEventListener('input', handleInputChange);
    document.getElementById('tfsaContributions').addEventListener('input', handleInputChange);
    document.getElementById('fhsaLifetimeContributions').addEventListener('input', handleInputChange);
    document.getElementById('fhsaPreviousUnusedRoom').addEventListener('input', handleInputChange);
    document.getElementById('fhsaContributions').addEventListener('input', handleInputChange);
    document.getElementById('income2024').addEventListener('input', handleInputChange);
    document.getElementById('rrspContributions').addEventListener('input', handleInputChange);
    document.getElementById('companyMatch').addEventListener('input', handleInputChange);
    document.getElementById('rrspCarryForward').addEventListener('input', handleInputChange);
    document.getElementById('numChildren').addEventListener('input', handleNumChildrenChange);
    document.getElementById('respContributions').addEventListener('input', handleInputChange);
}

/**
 * Handle home purchase status change
 */
function handleHomePurchaseChange() {
    handleInputChange();
}

/**
 * Handle number of children change (show/hide RESP fields)
 */
function handleNumChildrenChange() {
    const numChildren = parseInt(document.getElementById('numChildren').value) || 0;
    const respGroup = document.getElementById('respGroup');
    respGroup.style.display = numChildren > 0 ? 'block' : 'none';
    
    if (numChildren === 0) {
        document.getElementById('respContributions').value = '';
    }
    
    handleInputChange();
}

/**
 * Handle amount saved input changes (updates slider)
 */
function handleAmountSavedChange() {
    const amountToMove = parseFloat(document.getElementById('amountToMove').value) || 0;
    const slider = document.getElementById('amountSlider');
    const sliderValue = document.getElementById('sliderValue');
    
    if (slider) {
        slider.value = Math.min(100000, Math.max(0, amountToMove));
    }
    if (sliderValue) {
        sliderValue.textContent = formatCurrency(amountToMove);
    }
    
    handleInputChange();
}

/**
 * Handle slider changes (updates amount saved field)
 */
function handleSliderChange() {
    const slider = document.getElementById('amountSlider');
    const amountToMoveInput = document.getElementById('amountToMove');
    const sliderValue = document.getElementById('sliderValue');
    
    if (slider && amountToMoveInput) {
        const value = parseFloat(slider.value) || 0;
        amountToMoveInput.value = value;
        if (sliderValue) {
            sliderValue.textContent = formatCurrency(value);
        }
    }
    
    handleInputChange();
}

/**
 * Handle input changes with debouncing
 */
function handleInputChange() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        updateUI();
    }, 300);
}

/**
 * Collect all input values
 */
function collectInputs() {
    const province = document.getElementById('province').value;
    const income = parseFloat(document.getElementById('income').value) || 0;
    const amountToMove = parseFloat(document.getElementById('amountToMove').value) || 0;
    const isFirstTimeBuyer = document.querySelector('input[name="homePurchase"]:checked').value === 'yes';
    const age = parseInt(document.getElementById('age').value) || 18;
    const tfsaTotalContributions = parseFloat(document.getElementById('tfsaTotalContributions').value) || 0;
    const tfsaContributions = parseFloat(document.getElementById('tfsaContributions').value) || 0;
    const fhsaLifetimeContributions = parseFloat(document.getElementById('fhsaLifetimeContributions').value) || 0;
    const fhsaPreviousUnusedRoom = parseFloat(document.getElementById('fhsaPreviousUnusedRoom').value) || 0;
    const fhsaContributions = parseFloat(document.getElementById('fhsaContributions').value) || 0;
    const income2024 = parseFloat(document.getElementById('income2024').value) || 0;
    const rrspContributions = parseFloat(document.getElementById('rrspContributions').value) || 0;
    const companyMatch = parseFloat(document.getElementById('companyMatch').value) || 0;
    const rrspCarryForward = parseFloat(document.getElementById('rrspCarryForward').value) || 0;
    const numChildren = parseInt(document.getElementById('numChildren').value) || 0;
    const respContributions = parseFloat(document.getElementById('respContributions').value) || 0;
    
    return {
        province,
        income,
        amountToMove,
        isFirstTimeBuyer,
        age,
        tfsaTotalContributions,
        tfsaContributions,
        fhsaLifetimeContributions,
        fhsaPreviousUnusedRoom,
        fhsaContributions,
        income2024,
        rrspContributions,
        companyMatch,
        rrspCarryForward,
        numChildren,
        respContributions
    };
}

/**
 * Calculate available contribution rooms
 */
function calculateRooms(inputs) {
    // Total RRSP contributions (personal + company match)
    const totalRRSPContributions = inputs.rrspContributions + inputs.companyMatch;
    
    const rooms = {
        tfsa: calculateTFSARoom(inputs.age, inputs.tfsaTotalContributions),
        fhsa: calculateFHSARoom(
            inputs.age,
            inputs.isFirstTimeBuyer,
            inputs.fhsaContributions,
            inputs.fhsaLifetimeContributions,
            inputs.fhsaPreviousUnusedRoom
        ),
        rrsp: calculateRRSPRoom(
            inputs.age,
            inputs.income2024,
            totalRRSPContributions,
            inputs.rrspCarryForward
        ),
        resp: calculateRESPRoom(
            inputs.age,
            inputs.numChildren,
            inputs.respContributions,
            inputs.respContributions // Assuming lifetime = current year for simplicity
        )
    };
    
    return rooms;
}

/**
 * Optimize contribution allocation
 */
function optimizeContributions(inputs, rooms) {
    if (!inputs.province || inputs.income <= 0 || inputs.amountToMove <= 0) {
        return {
            tfsa: 0,
            rrsp: 0,
            fhsa: 0,
            resp: 0,
            totalAllocated: 0
        };
    }
    
    const recommendations = {
        tfsa: 0,
        rrsp: 0,
        fhsa: 0,
        resp: 0,
        totalAllocated: 0
    };
    
    let remainingFunds = inputs.amountToMove;
    
    // Calculate marginal tax rate
    const marginalRate = calculateMarginalRate(inputs.income, inputs.province);
    
    // Priority 1: FHSA if eligible - tax deduction + tax-free withdrawal for home (maximize before RRSP)
    if (inputs.isFirstTimeBuyer && rooms.fhsa > 0 && remainingFunds > 0) {
        const fhsaAmount = Math.min(remainingFunds, rooms.fhsa);
        recommendations.fhsa = fhsaAmount;
        remainingFunds -= fhsaAmount;
        recommendations.totalAllocated += fhsaAmount;
    }
    
    // Priority 2: RRSP if marginal rate is high (>25%) - immediate tax deduction
    if (marginalRate > 0.25 && rooms.rrsp > 0 && remainingFunds > 0) {
        const rrspAmount = Math.min(remainingFunds, rooms.rrsp);
        recommendations.rrsp = rrspAmount;
        remainingFunds -= rrspAmount;
        recommendations.totalAllocated += rrspAmount;
    }
    
    // Priority 3: RESP if children exist - maximize CESG matching ($2,500 per child)
    if (inputs.numChildren > 0 && rooms.resp > 0 && remainingFunds > 0) {
        const optimalRESP = calculateOptimalRESPContribution(inputs.numChildren, remainingFunds);
        const respAmount = Math.min(optimalRESP, rooms.resp, remainingFunds);
        recommendations.resp = respAmount;
        remainingFunds -= respAmount;
        recommendations.totalAllocated += respAmount;
    }
    
    // Priority 4: RRSP if marginal rate is moderate (15-25%) - still get tax deduction
    if (marginalRate >= 0.15 && marginalRate <= 0.25 && rooms.rrsp > recommendations.rrsp && remainingFunds > 0) {
        const remainingRRSPRoom = rooms.rrsp - recommendations.rrsp;
        const rrspAmount = Math.min(remainingFunds, remainingRRSPRoom);
        recommendations.rrsp += rrspAmount;
        remainingFunds -= rrspAmount;
        recommendations.totalAllocated += rrspAmount;
    }
    
    // Priority 5: TFSA - tax-free growth, no deduction but flexible
    if (rooms.tfsa > 0 && remainingFunds > 0) {
        const tfsaAmount = Math.min(remainingFunds, rooms.tfsa);
        recommendations.tfsa = tfsaAmount;
        remainingFunds -= tfsaAmount;
        recommendations.totalAllocated += tfsaAmount;
    }
    
    // Priority 6: Remaining RRSP room if any funds left
    if (rooms.rrsp > recommendations.rrsp && remainingFunds > 0) {
        const additionalRRSP = Math.min(remainingFunds, rooms.rrsp - recommendations.rrsp);
        recommendations.rrsp += additionalRRSP;
        remainingFunds -= additionalRRSP;
        recommendations.totalAllocated += additionalRRSP;
    }
    
    // Priority 7: Remaining RESP room if any funds left (beyond optimal CESG matching)
    if (rooms.resp > recommendations.resp && remainingFunds > 0) {
        const remainingRESPRoom = rooms.resp - recommendations.resp;
        const additionalRESP = Math.min(remainingFunds, remainingRESPRoom);
        recommendations.resp += additionalRESP;
        remainingFunds -= additionalRESP;
        recommendations.totalAllocated += additionalRESP;
    }
    
    return recommendations;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format percentage
 */
function formatPercentage(rate) {
    return (rate * 100).toFixed(2) + '%';
}

/**
 * Update the UI with calculations
 */
function updateUI() {
    const inputs = collectInputs();
    const rooms = calculateRooms(inputs);
    const recommendations = optimizeContributions(inputs, rooms);
    
    // Calculate effective tax rate
    const totalRRSPDeductions = inputs.rrspContributions + inputs.companyMatch + recommendations.rrsp;
    const effectiveRate = calculateEffectiveRate(inputs.income, inputs.province, totalRRSPDeductions);
    
    // Calculate tax savings from recommended contributions
    const marginalRate = calculateMarginalRate(inputs.income, inputs.province);
    const recommendedRRSP = recommendations.rrsp;
    const recommendedFHSA = recommendations.fhsa;
    const taxSavingsFromRRSP = recommendedRRSP * marginalRate;
    const taxSavingsFromFHSA = recommendedFHSA * marginalRate;
    const totalTaxSavings = taxSavingsFromRRSP + taxSavingsFromFHSA;
    
    // Calculate tax breakdown
    const taxBreakdown = calculateTaxBreakdown(inputs.income, inputs.province, totalRRSPDeductions);
    
    // Update recommendations display
    updateRecommendations(recommendations, totalTaxSavings);
    
    // Update amount slider to match current input value
    const slider = document.getElementById('amountSlider');
    const sliderValue = document.getElementById('sliderValue');
    if (slider) {
        slider.value = Math.min(100000, Math.max(0, inputs.amountToMove));
    }
    if (sliderValue) {
        sliderValue.textContent = formatCurrency(inputs.amountToMove);
    }
    
    // Update tax rate display
    updateTaxRate(effectiveRate, inputs);
    
    // Update tax breakdown and pie chart
    updateTaxBreakdown(taxBreakdown, inputs.income, totalTaxSavings);
    
    // Update input summary
    updateInputSummary(inputs, rooms);
}

/**
 * Update recommendations display
 */
function updateRecommendations(recommendations, taxSavings = 0) {
    const recommendationsDiv = document.getElementById('recommendations');
    
    if (recommendations.totalAllocated === 0) {
        recommendationsDiv.innerHTML = '<p class="placeholder">Enter your information above to see recommendations</p>';
        return;
    }
    
    const parts = [];
    // Order: FHSA first, then RRSP, then TFSA, then RESP
    if (recommendations.fhsa > 0) {
        parts.push(`<span class="recommendation-item">Contribute <strong>${formatCurrency(recommendations.fhsa)}</strong> to FHSA</span>`);
    }
    if (recommendations.rrsp > 0) {
        parts.push(`<span class="recommendation-item">Contribute <strong>${formatCurrency(recommendations.rrsp)}</strong> to RRSP</span>`);
    }
    if (recommendations.tfsa > 0) {
        parts.push(`<span class="recommendation-item">Contribute <strong>${formatCurrency(recommendations.tfsa)}</strong> to TFSA</span>`);
    }
    if (recommendations.resp > 0) {
        parts.push(`<span class="recommendation-item">Contribute <strong>${formatCurrency(recommendations.resp)}</strong> to RESP</span>`);
    }
    
    if (parts.length === 0) {
        recommendationsDiv.innerHTML = '<p class="placeholder">No recommendations available. Check your contribution room.</p>';
    } else {
        let html = parts.join('<br>');
        if (taxSavings > 0) {
            html += `<div class="tax-savings-display">
                <div style="font-size: 1.1em; font-weight: 600;">Estimated Tax Savings: <strong style="color: #ffd700; font-size: 1.3em;">${formatCurrency(taxSavings)}</strong></div>
                <div style="font-size: 0.9em; margin-top: 5px; opacity: 0.9;">From RRSP and FHSA contributions</div>
            </div>`;
        }
        recommendationsDiv.innerHTML = html;
    }
}

/**
 * Update tax rate display
 */
function updateTaxRate(effectiveRate, inputs) {
    const taxRateDiv = document.getElementById('taxRate');
    
    if (!inputs.province || inputs.income <= 0) {
        taxRateDiv.innerHTML = '<p class="placeholder">Effective tax rate will appear here</p>';
        return;
    }
    
    const marginalRate = calculateMarginalRate(inputs.income, inputs.province);
    
    taxRateDiv.innerHTML = `
        <h3>Tax Information</h3>
        <p>Effective Tax Rate: <span class="rate-value">${formatPercentage(effectiveRate)}</span></p>
        <p style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">Marginal Tax Rate: ${formatPercentage(marginalRate)}</p>
    `;
}

/**
 * Update tax breakdown and pie chart
 */
function updateTaxBreakdown(breakdown, income, taxSavings = 0) {
    const breakdownDiv = document.getElementById('taxBreakdown');
    const textDiv = document.getElementById('taxBreakdownText');
    const canvas = document.getElementById('pieChart');
    
    if (!income || income <= 0) {
        breakdownDiv.style.display = 'none';
        return;
    }
    
    breakdownDiv.style.display = 'block';
    
    // Update text breakdown
    const netIncome = income - breakdown.totalDeductions;
    let html = `
        <div class="breakdown-item">
            <strong>Federal Tax:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(breakdown.federalTax)}</span>
                <span class="percentage">(${((breakdown.federalTax / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item">
            <strong>Provincial Tax:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(breakdown.provincialTax)}</span>
                <span class="percentage">(${((breakdown.provincialTax / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item">
            <strong>CPP:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(breakdown.cpp)}</span>
                <span class="percentage">(${((breakdown.cpp / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item">
            <strong>EI:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(breakdown.ei)}</span>
                <span class="percentage">(${((breakdown.ei / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item total">
            <strong>Total Deductions:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(breakdown.totalDeductions)}</span>
                <span class="percentage">(${((breakdown.totalDeductions / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item net">
            <strong>Net Income:</strong>
            <div class="breakdown-values">
                <span class="amount">${formatCurrency(netIncome)}</span>
                <span class="percentage">(${((netIncome / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>`;
    
    // Add tax savings line item after net income if applicable
    if (taxSavings > 0) {
        const netIncomeAndSavings = netIncome + taxSavings;
        html += `
        <div class="breakdown-item savings">
            <strong>Tax Savings (from RRSP/FHSA):</strong>
            <div class="breakdown-values">
                <span class="amount" style="color: #52c878;">${formatCurrency(taxSavings)}</span>
                <span class="percentage">(${((taxSavings / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>
        <div class="breakdown-item net-savings">
            <strong>Net Income and Tax Savings:</strong>
            <div class="breakdown-values">
                <span class="amount" style="color: #52c878; font-weight: 700;">${formatCurrency(netIncomeAndSavings)}</span>
                <span class="percentage">(${((netIncomeAndSavings / income) * 100).toFixed(2)}%)</span>
            </div>
        </div>`;
    }
    
    textDiv.innerHTML = html;
    
    // Draw pie chart
    drawPieChart(canvas, breakdown, income);
}

/**
 * Draw pie chart showing tax breakdown
 */
function drawPieChart(canvas, breakdown, income) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate percentages
    const federalPercent = breakdown.federalTax / income;
    const provincialPercent = breakdown.provincialTax / income;
    const cppPercent = breakdown.cpp / income;
    const eiPercent = breakdown.ei / income;
    const netPercent = (income - breakdown.totalDeductions) / income;
    
    // Colors
    const colors = {
        federal: '#E4572E',
        provincial: '#17BEBB',
        cpp: '#FFC914',
        ei: '#020402',
        net: '#76B041'
    };
    
    let currentAngle = -Math.PI / 2; // Start at top
    
    // Draw federal tax
    if (federalPercent > 0) {
        const sliceAngle = federalPercent * 2 * Math.PI;
        drawSlice(ctx, centerX, centerY, radius, currentAngle, sliceAngle, colors.federal);
        currentAngle += sliceAngle;
    }
    
    // Draw provincial tax
    if (provincialPercent > 0) {
        const sliceAngle = provincialPercent * 2 * Math.PI;
        drawSlice(ctx, centerX, centerY, radius, currentAngle, sliceAngle, colors.provincial);
        currentAngle += sliceAngle;
    }
    
    // Draw CPP
    if (cppPercent > 0) {
        const sliceAngle = cppPercent * 2 * Math.PI;
        drawSlice(ctx, centerX, centerY, radius, currentAngle, sliceAngle, colors.cpp);
        currentAngle += sliceAngle;
    }
    
    // Draw EI
    if (eiPercent > 0) {
        const sliceAngle = eiPercent * 2 * Math.PI;
        drawSlice(ctx, centerX, centerY, radius, currentAngle, sliceAngle, colors.ei);
        currentAngle += sliceAngle;
    }
    
    // Draw net income
    if (netPercent > 0) {
        const sliceAngle = netPercent * 2 * Math.PI;
        drawSlice(ctx, centerX, centerY, radius, currentAngle, sliceAngle, colors.net);
    }
    
    // Draw legend in HTML (not on canvas)
    drawLegendHTML(colors, federalPercent, provincialPercent, cppPercent, eiPercent, netPercent);
}

/**
 * Draw a slice of the pie chart
 */
function drawSlice(ctx, centerX, centerY, radius, startAngle, sliceAngle, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Draw legend for pie chart in HTML
 */
function drawLegendHTML(colors, federalPercent, provincialPercent, cppPercent, eiPercent, netPercent) {
    const legendDiv = document.getElementById('pieChartLegend');
    if (!legendDiv) return;
    
    const legendItems = [
        { label: 'Federal Tax', color: colors.federal, percent: federalPercent },
        { label: 'Provincial Tax', color: colors.provincial, percent: provincialPercent },
        { label: 'CPP', color: colors.cpp, percent: cppPercent },
        { label: 'EI', color: colors.ei, percent: eiPercent },
        { label: 'Net Income', color: colors.net, percent: netPercent }
    ];
    
    let html = '';
    legendItems.forEach(item => {
        if (item.percent > 0.001) { // Only show if > 0.1%
            html += `
                <div class="pie-chart-legend-item">
                    <div class="pie-chart-legend-color" style="background-color: ${item.color};"></div>
                    <span class="pie-chart-legend-label">${item.label}</span>
                    <span class="pie-chart-legend-percentage">${(item.percent * 100).toFixed(1)}%</span>
                </div>
            `;
        }
    });
    
    legendDiv.innerHTML = html;
}

/**
 * Update editable input summary
 */
function updateInputSummary(inputs, rooms) {
    const summaryDiv = document.getElementById('inputSummary');
    
    const summaryItems = [
        { label: 'Province', id: 'province', type: 'select', value: inputs.province },
        { label: 'Annual Income', id: 'income', type: 'number', value: inputs.income },
        { label: 'Amount Saved', id: 'amountToMove', type: 'number', value: inputs.amountToMove },
        { label: 'Are you a first time home buyer?', id: 'homePurchase', type: 'radio', value: inputs.isFirstTimeBuyer ? 'yes' : 'no' },
        { label: 'Age', id: 'age', type: 'number', value: inputs.age },
        { label: 'Total TFSA Contributions', id: 'tfsaTotalContributions', type: 'number', value: inputs.tfsaTotalContributions, room: rooms.tfsa },
        { label: 'TFSA Contributions This Year', id: 'tfsaContributions', type: 'number', value: inputs.tfsaContributions },
        { label: 'Total FHSA Lifetime Contributions', id: 'fhsaLifetimeContributions', type: 'number', value: inputs.fhsaLifetimeContributions },
        { label: 'Previous FHSA Unused Room', id: 'fhsaPreviousUnusedRoom', type: 'number', value: inputs.fhsaPreviousUnusedRoom },
        { label: 'FHSA Contributions This Year', id: 'fhsaContributions', type: 'number', value: inputs.fhsaContributions, room: rooms.fhsa },
        { label: 'Previous Year Income', id: 'income2024', type: 'number', value: inputs.income2024 },
        { label: 'RRSP Contributions This Year', id: 'rrspContributions', type: 'number', value: inputs.rrspContributions, room: rooms.rrsp },
        { label: 'Company-Matched RRSP', id: 'companyMatch', type: 'number', value: inputs.companyMatch },
        { label: 'RRSP Carry-Forward Room', id: 'rrspCarryForward', type: 'number', value: inputs.rrspCarryForward },
        { label: 'Number of Children', id: 'numChildren', type: 'number', value: inputs.numChildren },
        { label: 'RESP Contributions This Year', id: 'respContributions', type: 'number', value: inputs.respContributions, room: rooms.resp, show: inputs.numChildren > 0 }
    ];
    
    let html = '';
    summaryItems.forEach(item => {
        if (item.show === false) return;
        
        html += '<div class="summary-item">';
        html += `<label>${item.label}`;
        if (item.room !== undefined) {
            html += ` <small style="color: #6c757d;">(Room: ${formatCurrency(item.room)})</small>`;
        }
        html += `</label>`;
        
        if (item.type === 'select') {
            html += `<select id="summary_${item.id}" class="summary-input">`;
            html += '<option value="">Select Province/Territory</option>';
            const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
            const provinceNames = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'];
            provinces.forEach((code, idx) => {
                html += `<option value="${code}" ${code === item.value ? 'selected' : ''}>${provinceNames[idx]}</option>`;
            });
            html += '</select>';
        } else if (item.type === 'radio') {
            html += `<div class="radio-group">`;
            html += `<label class="radio-label"><input type="radio" name="summary_${item.id}" value="yes" ${item.value === 'yes' ? 'checked' : ''}> Yes</label>`;
            html += `<label class="radio-label"><input type="radio" name="summary_${item.id}" value="no" ${item.value === 'no' ? 'checked' : ''}> No</label>`;
            html += `</div>`;
        } else {
            let stepAttr = '';
            if (item.type === 'number') {
                // Age and number of children should increment by 1, others by 100
                if (item.id === 'age' || item.id === 'numChildren') {
                    stepAttr = 'step="1"';
                } else {
                    stepAttr = 'step="100"';
                }
            }
            html += `<input type="${item.type}" id="summary_${item.id}" class="summary-input" value="${item.value || ''}" ${stepAttr}>`;
        }
        
        html += '</div>';
    });
    
    summaryDiv.innerHTML = html;
    
    // Add event listeners to summary inputs
    summaryItems.forEach(item => {
        const element = document.getElementById(`summary_${item.id}`);
        if (element) {
            if (item.type === 'select') {
                element.addEventListener('change', function() {
                    document.getElementById(item.id).value = this.value;
                    if (item.id === 'province') {
                        document.getElementById('province').value = this.value;
                    }
                    handleInputChange();
                });
            } else if (item.type === 'radio') {
                document.querySelectorAll(`input[name="summary_${item.id}"]`).forEach(radio => {
                    radio.addEventListener('change', function() {
                        document.querySelector(`input[name="${item.id}"][value="${this.value}"]`).checked = true;
                        if (item.id === 'homePurchase') {
                            handleHomePurchaseChange();
                        } else {
                            handleInputChange();
                        }
                    });
                });
            } else {
                element.addEventListener('input', function() {
                    document.getElementById(item.id).value = this.value;
                    if (item.id === 'numChildren') {
                        handleNumChildrenChange();
                    } else if (item.id === 'homePurchase') {
                        handleHomePurchaseChange();
                    } else {
                        handleInputChange();
                    }
                });
            }
        }
    });
}

