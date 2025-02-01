from flask import Flask, render_template, request, jsonify
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/northwest_corner', methods=['GET', 'POST'])
def northwest_corner():
    if request.method == 'POST':
        input1 = request.form['input1']
        input2 = request.form['input2']
        # Aquí se implementa la lógica del algoritmo Esquina del Noroeste usando input1 y input2
        fig, ax = plt.subplots()
        ax.plot([1, 2, 3], [1, 4, 9])
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        return render_template('northwest_corner.html', plot_url=plot_url)
    return render_template('northwest_corner.html')

@app.route('/other_algorithm', methods=['GET', 'POST'])
def other_algorithm():
    if request.method == 'POST':
        # Implementa aquí otro algoritmo y genera su gráfica
        pass
    return render_template('other_algorithm.html')

if __name__ == '__main__':
    app.run(debug=True)
