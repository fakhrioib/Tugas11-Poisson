from flask import Flask, render_template, request, jsonify
import numpy as np
from scipy.stats import binom

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        n = int(data['n'])  # Jumlah total pengiriman
        p = float(data['p'])  # Probabilitas sukses per pengiriman
        k = int(data['k'])  # Jumlah sukses yang diinginkan
        
        # Menghitung probabilitas tepat k sukses
        prob_exact = binom.pmf(k, n, p)
        
        # Menghitung probabilitas kurang dari atau sama dengan k sukses
        prob_cumulative = binom.cdf(k, n, p)
        
        # Menghitung probabilitas lebih dari k sukses
        prob_more = 1 - binom.cdf(k, n, p)
        
        # Menghitung probabilitas setidaknya k sukses
        prob_at_least = 1 - binom.cdf(k-1, n, p)
        
        # Generate data untuk grafik
        x = np.arange(0, n+1)
        probabilities = binom.pmf(x, n, p)
        graph_data = [{"x": int(i), "y": float(prob)} for i, prob in zip(x, probabilities)]
        
        return jsonify({
            "exact": round(prob_exact * 100, 2),
            "cumulative": round(prob_cumulative * 100, 2),
            "more": round(prob_more * 100, 2),
            "at_least": round(prob_at_least * 100, 2),
            "graph_data": graph_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)