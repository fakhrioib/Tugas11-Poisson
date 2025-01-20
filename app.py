from flask import Flask, render_template, request, jsonify
import numpy as np
from scipy.stats import poisson

app = Flask(__name__)

def calculate_poisson_probability(lambda_val, k):
    """Calculate Poisson probability for k events given lambda"""
    return float(poisson.pmf(k, lambda_val))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        expected_regular = float(data['regularPatients'])  # Pasien reguler
        expected_special = float(data['specialPatients'])  # Pasien khusus
        
        # Menghitung probabilitas untuk berbagai jumlah kunjungan
        max_patients = 4  # Maksimal jumlah pasien per kategori
        
        # Matriks probabilitas
        visit_matrix = []
        regular_total = 0
        special_total = 0
        mixed_total = 0
        
        for i in range(max_patients + 1):
            row = []
            for j in range(max_patients + 1):
                prob = (calculate_poisson_probability(expected_regular, i) * 
                       calculate_poisson_probability(expected_special, j))
                row.append(prob * 100)
                
                if i > j:
                    regular_total += prob
                elif i < j:
                    special_total += prob
                else:
                    mixed_total += prob
            visit_matrix.append(row)
        
        # Menghitung probabilitas total kunjungan
        total_visit_probs = {}
        for visit in [0.5, 1.5, 2.5, 3.5, 4.5]:
            over_prob = 0
            for i in range(max_patients + 1):
                for j in range(max_patients + 1):
                    if i + j > visit:
                        over_prob += (calculate_poisson_probability(expected_regular, i) * 
                                    calculate_poisson_probability(expected_special, j))
            total_visit_probs[str(visit)] = {
                'over': over_prob * 100,
                'under': (1 - over_prob) * 100
            }
        
        # Menghitung probabilitas kedua jenis pasien hadir
        both_types_prob = 0
        for i in range(1, max_patients + 1):
            for j in range(1, max_patients + 1):
                both_types_prob += (calculate_poisson_probability(expected_regular, i) * 
                                  calculate_poisson_probability(expected_special, j))
        
        return jsonify({
            'success': True,
            'visit_matrix': visit_matrix,
            'regular_patients': regular_total * 100,
            'special_patients': special_total * 100,
            'mixed_patients': mixed_total * 100,
            'total_visits': total_visit_probs,
            'both_types': {
                'yes': both_types_prob * 100,
                'no': (1 - both_types_prob) * 100
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)