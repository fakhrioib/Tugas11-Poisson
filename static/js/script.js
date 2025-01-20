document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const morningInput = document.getElementById('morningVisitors');
    const afternoonInput = document.getElementById('afternoonVisitors');
    
    // Set default values
    morningInput.value = "2.5";
    afternoonInput.value = "3.2";
    
    calculateBtn.addEventListener('click', calculateProbabilities);
    // Initial calculation on page load
    calculateProbabilities();
});

async function calculateProbabilities() {
    const morningVisitors = document.getElementById('morningVisitors').value;
    const afternoonVisitors = document.getElementById('afternoonVisitors').value;
    const showPercent = document.getElementById('showPercent').checked;

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                morning: morningVisitors,
                afternoon: afternoonVisitors
            })
        });

        const data = await response.json();
        updateAllTables(data, showPercent);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateAllTables(data, showPercent) {
    updateFinalResults(data.hasil);
    updateTotalVisitorsTable(data.matrix);
    updateCapacityTable(data.hasil);
    updateConcurrentTable(data.concurrent);
    updateDistributionTable(data.matrix);
}

function updateFinalResults(hasil) {
    const table = document.getElementById('finalResults').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    updateTableRow(rows[0], hasil.morning_busy);
    updateTableRow(rows[1], hasil.balanced);
    updateTableRow(rows[2], hasil.afternoon_busy);
}

function updateTableRow(row, probability) {
    const cells = row.getElementsByTagName('td');
    const ratio = probability > 0 ? (100 / probability).toFixed(2) : "0.00";
    cells[1].textContent = ratio;
    cells[2].textContent = probability.toFixed(2) + "%";
}

function updateTotalVisitorsTable(matrix) {
    const table = document.getElementById('overUnderTable');
    table.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    const thresholds = [2, 4, 6, 8, 10];
    headerRow.innerHTML = '<th>Pengunjung</th>';
    thresholds.forEach(threshold => {
        headerRow.innerHTML += `<th>${threshold}</th>`;
    });
    table.appendChild(headerRow);
    
    const aboveRow = document.createElement('tr');
    aboveRow.innerHTML = '<td>Di atas</td>';
    thresholds.forEach(threshold => {
        const prob = calculateAboveThreshold(matrix, threshold);
        aboveRow.innerHTML += `<td>${prob.toFixed(2)}</td>`;
    });
    table.appendChild(aboveRow);
    
    const belowRow = document.createElement('tr');
    belowRow.innerHTML = '<td>Di bawah</td>';
    thresholds.forEach(threshold => {
        const prob = calculateBelowThreshold(matrix, threshold);
        belowRow.innerHTML += `<td>${prob.toFixed(2)}</td>`;
    });
    table.appendChild(belowRow);
}

function calculateAboveThreshold(matrix, threshold) {
    let prob = 0;
    const maxVisitors = matrix.length;
    for (let i = 0; i < maxVisitors; i++) {
        for (let j = 0; j < maxVisitors; j++) {
            if (i + j > threshold) {
                prob += matrix[i][j];
            }
        }
    }
    return prob;
}

function calculateBelowThreshold(matrix, threshold) {
    let prob = 0;
    const maxVisitors = matrix.length;
    for (let i = 0; i < maxVisitors; i++) {
        for (let j = 0; j < maxVisitors; j++) {
            if (i + j < threshold) {
                prob += matrix[i][j];
            }
        }
    }
    return prob;
}

function updateCapacityTable(hasil) {
    const table = document.getElementById('capacityTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    rows[0].getElementsByTagName('td')[1].textContent = (hasil.morning_busy / 2).toFixed(2);
    rows[0].getElementsByTagName('td')[2].textContent = (100 - hasil.morning_busy / 2).toFixed(2);
    
    rows[1].getElementsByTagName('td')[1].textContent = (hasil.afternoon_busy / 2).toFixed(2);
    rows[1].getElementsByTagName('td')[2].textContent = (100 - hasil.afternoon_busy / 2).toFixed(2);
}

function updateConcurrentTable(concurrent) {
    const table = document.getElementById('concurrentTable').getElementsByTagName('tbody')[0];
    const row = table.getElementsByTagName('tr')[0];
    
    row.getElementsByTagName('td')[0].textContent = concurrent.yes.toFixed(2);
    row.getElementsByTagName('td')[1].textContent = concurrent.no.toFixed(2);
}

function updateDistributionTable(matrix) {
    const table = document.getElementById('distributionTable');
    table.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Pagi/Siang</th>';
    for (let i = 0; i < matrix[0].length; i++) {
        headerRow.innerHTML += `<th>${i}</th>`;
    }
    table.appendChild(headerRow);
    
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i}</td>`;
        for (let j = 0; j < matrix[i].length; j++) {
            row.innerHTML += `<td>${matrix[i][j].toFixed(2)}</td>`;
        }
        table.appendChild(row);
    }
}
