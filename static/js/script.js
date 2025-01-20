function calculate() {
    const regularPatients = document.getElementById('regularPatients').value;
    const specialPatients = document.getElementById('specialPatients').value;

    if (!regularPatients || !specialPatients) {
        alert('Harap isi semua field yang wajib diisi');
        return;
    }

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            regularPatients: regularPatients,
            specialPatients: specialPatients
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateResults(data);
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        alert('Error menghitung probabilitas: ' + error);
    });
}

function updateResults(data) {
    // Update final result
    document.getElementById('regularWin').textContent = data.regular_patients.toFixed(2);
    document.getElementById('regularWinPercent').textContent = data.regular_patients.toFixed(2) + '%';
    document.getElementById('specialWin').textContent = data.special_patients.toFixed(2);
    document.getElementById('specialWinPercent').textContent = data.special_patients.toFixed(2) + '%';
    document.getElementById('mixedResult').textContent = data.mixed_patients.toFixed(2);
    document.getElementById('mixedResultPercent').textContent = data.mixed_patients.toFixed(2) + '%';

    // Update total visits
    const visits = ['0_5', '1_5', '2_5', '3_5', '4_5'];
    visits.forEach(visit => {
        const visitKey = visit.replace('_', '.');
        document.getElementById('over' + visit).textContent = 
            data.total_visits[visitKey].over.toFixed(2);
        document.getElementById('under' + visit).textContent = 
            data.total_visits[visitKey].under.toFixed(2);
    });

    // Update both types
    document.getElementById('bothTypesYes').textContent = data.both_types.yes.toFixed(2);
    document.getElementById('bothTypesNo').textContent = data.both_types.no.toFixed(2);

    // Update visit distribution table
    const tbody = document.querySelector('#visitDistribution tbody');
    tbody.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i}</td>`;
        
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('td');
            cell.textContent = data.visit_matrix[i][j].toFixed(2);
            
            if (i === j) {
                cell.classList.add('yellow-bg');
            } else if (i > j) {
                cell.classList.add('green-bg');
            } else {
                cell.classList.add('pink-bg');
            }
            
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
}