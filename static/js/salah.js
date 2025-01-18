let probabilityChart = null;

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function combination(n, r) {
    return factorial(n) / (factorial(r) * factorial(n - r));
}

function binomialPMF(k, n, p) {
    return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomialCDF(k, n, p) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        sum += binomialPMF(i, n, p);
    }
    return sum;
}

function calculateProbability() {
    const n = parseInt(document.getElementById('n').value);
    const p = parseFloat(document.getElementById('p').value);
    const k = parseInt(document.getElementById('k').value);

    if (p < 0 || p > 1) {
        alert('Probabilitas sukses (p) harus antara 0 dan 1');
        return;
    }

    // Hitung probabilitas
    const prob_exact = binomialPMF(k, n, p);
    const prob_cumulative = binomialCDF(k, n, p);
    const prob_more = 1 - prob_cumulative;
    const prob_at_least = 1 - binomialCDF(k - 1, n, p);

    // Generate data untuk grafik
    const graph_data = [];
    for (let i = 0; i <= n; i++) {
        graph_data.push({
            x: i,
            y: binomialPMF(i, n, p)
        });
    }

    // Update hasil
    document.getElementById('exact-result').textContent = (prob_exact * 100).toFixed(2) + '%';
    document.getElementById('cumulative-result').textContent = (prob_cumulative * 100).toFixed(2) + '%';
    document.getElementById('more-result').textContent = (prob_more * 100).toFixed(2) + '%';
    document.getElementById('at-least-result').textContent = (prob_at_least * 100).toFixed(2) + '%';

    // Update grafik
    updateChart(graph_data, k);

    // Update solusi langkah demi langkah
    updateStepByStepSolution(n, k, p);
}

function updateStepByStepSolution(n, k, p) {
    const solutionDiv = document.getElementById('step-by-step-solution');
    const C = combination(n, k);
    const P_k = Math.pow(p, k);
    const P_nk = Math.pow(1-p, n-k);
    const result = C * P_k * P_nk;

    let solution = `
        <div class="step">
            <h3>Langkah 1: Identifikasi Komponen</h3>
            <p>n = ${n} (jumlah percobaan/total pengiriman)</p>
            <p>k = ${k} (jumlah sukses yang diinginkan)</p>
            <p>p = ${p} (probabilitas sukses per percobaan)</p>
        </div>

        <div class="step">
            <h3>Langkah 2: Rumus Distribusi Binomial</h3>
            <p>P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</p>
        </div>

        <div class="step">
            <h3>Langkah 3: Hitung C(n,k) - Kombinasi</h3>
            <p>C(${n},${k}) = ${n}! / (${k}! × (${n}-${k})!)</p>
            <p>C(${n},${k}) = ${C}</p>
        </div>

        <div class="step">
            <h3>Langkah 4: Hitung p^k</h3>
            <p>(${p})^${k} = ${P_k.toFixed(6)}</p>
        </div>

        <div class="step">
            <h3>Langkah 5: Hitung (1-p)^(n-k)</h3>
            <p>(1-${p})^(${n}-${k}) = ${P_nk.toFixed(6)}</p>
        </div>

        <div class="step">
            <h3>Langkah 6: Kalikan Semua Komponen</h3>
            <p>${C} × ${P_k.toFixed(6)} × ${P_nk.toFixed(6)} = ${(result * 100).toFixed(4)}%</p>
        </div>

        <div class="step">
            <h3>Interpretasi:</h3>
            <p>Probabilitas mendapatkan tepat ${k} pengiriman sukses dari ${n} total pengiriman adalah ${(result * 100).toFixed(2)}%</p>
        </div>
    `;

    solutionDiv.innerHTML = solution;
}

function updateChart(data, k) {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    
    const backgroundColor = data.map((point, index) => 
        index === parseInt(k) ? 'rgba(26, 115, 232, 0.8)' : 'rgba(26, 115, 232, 0.2)'
    );

    probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(point => point.x),
            datasets: [{
                label: 'Probabilitas',
                data: data.map(point => (point.y * 100).toFixed(2)),
                backgroundColor: backgroundColor,
                borderColor: 'rgba(26, 115, 232, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Probabilitas (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Jumlah Sukses'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribusi Probabilitas Binomial'
                }
            }
        }
    });
}

// Validasi input saat nilai berubah
document.getElementById('p').addEventListener('change', validateInputs);

function validateInputs() {
    const p = parseFloat(document.getElementById('p').value);
    
    if (p < 0) {
        document.getElementById('p').value = 0;
    } else if (p > 1) {
        document.getElementById('p').value = 1;
    }
}
