from flask import Flask, render_template, request, jsonify
import math
import numpy as np

app = Flask(__name__)

def hitung_poisson(k, lambda_val):
    """Menghitung probabilitas Poisson untuk perkiraan pengunjung"""
    return (math.exp(-lambda_val) * (lambda_val ** k)) / math.factorial(k)

def generate_visitor_table(expected_morning, expected_afternoon, max_visitors=4):
    """Menghasilkan tabel probabilitas pengunjung"""
    probability_matrix = []
    for i in range(max_visitors + 1):
        row = []
        for j in range(max_visitors + 1):
            prob_morning = hitung_poisson(i, expected_morning)
            prob_afternoon = hitung_poisson(j, expected_afternoon)
            row.append(prob_morning * prob_afternoon * 100)
        probability_matrix.append(row)
    return probability_matrix

def hitung_probabilitas_kunjungan(matrix):
    """Menghitung probabilitas untuk berbagai pola kunjungan"""
    morning_busy = 0
    balanced = 0
    afternoon_busy = 0
    
    for i in range(len(matrix)):
        for j in range(len(matrix[0])):
            if i > j:  # Morning busier
                morning_busy += matrix[i][j]
            elif i == j:  # Balanced
                balanced += matrix[i][j]
            else:  # Afternoon busier
                afternoon_busy += matrix[i][j]
    
    return {
        'morning_busy': morning_busy,
        'balanced': balanced,
        'afternoon_busy': afternoon_busy
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expected_morning = float(data['morning'])
    expected_afternoon = float(data['afternoon'])
    
    # Generate probability matrix
    prob_matrix = generate_visitor_table(expected_morning, expected_afternoon)
    
    # Calculate visitor patterns
    hasil = hitung_probabilitas_kunjungan(prob_matrix)
    
    # Calculate concurrent visits probability
    concurrent_yes = sum(prob_matrix[i][j] for i in range(1, len(prob_matrix)) 
                        for j in range(1, len(prob_matrix[0])))
    concurrent_no = 100 - concurrent_yes
    
    return jsonify({
        'matrix': prob_matrix,
        'hasil': hasil,
        'concurrent': {'yes': concurrent_yes, 'no': concurrent_no}
    })

if __name__ == '__main__':
    app.run(debug=True)
