from flask import Flask, render_template, request, jsonify
import matplotlib.pyplot as plt
import io
import base64
import numpy as np
import pandas as pd

app = Flask(__name__)

def northwest_corner_method(supply, demand):
    supply = supply.copy()
    demand = demand.copy()
    rows = len(supply)
    cols = len(demand)
    result = np.zeros((rows, cols))
    i = 0
    j = 0
    steps = []
    while i < rows and j < cols:
        if supply[i] < demand[j]:
            result[i, j] = supply[i]
            demand[j] -= supply[i]
            steps.append((i, j, supply[i], demand[j]))
            i += 1
        else:
            result[i, j] = demand[j]
            supply[i] -= demand[j]
            steps.append((i, j, supply[i], demand[j]))
            j += 1
    return result, steps

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/northwest_corner', methods=['GET', 'POST'])
def northwest_corner():
    num_sources = None
    num_destinations = None
    plot_url = None
    table_data = None
    steps_images = []

    if request.method == 'POST':
        data = request.get_json()
        num_sources = data['numSources']
        num_destinations = data['numDestinations']
        supply = data['supply']
        demand = data['demand']
        costs = data['costs']
        result, steps = northwest_corner_method(supply, demand)
        
        fig, ax = plt.subplots()
        ax.axis('tight')
        ax.axis('off')
        table_data = pd.DataFrame(result, columns=[f'Planta {j+1}' for j in range(len(demand))], index=[f'Fuente {i+1}' for i in range(len(supply))])
        table = ax.table(cellText=table_data.values, colLabels=table_data.columns, rowLabels=table_data.index, cellLoc='center', loc='center')
        
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()

        # Generate step images
        for step in steps:
            fig, ax = plt.subplots()
            ax.axis('tight')
            ax.axis('off')
            step_data = result.copy()
            step_data[step[0], step[1]] = step[2]
            table_data = pd.DataFrame(step_data, columns=[f'Planta {j+1}' for j in range(len(demand))], index=[f'Fuente {i+1}' for i in range(len(supply))])
            table = ax.table(cellText=table_data.values, colLabels=table_data.columns, rowLabels=table_data.index, cellLoc='center', loc='center')
            table[(step[0], step[1])].set_facecolor('#56b5fd')
            img = io.BytesIO()
            plt.savefig(img, format='png')
            img.seek(0)
            steps_images.append(base64.b64encode(img.getvalue()).decode())

        return jsonify({
            'plot_url': plot_url,
            'table_data': table_data.to_html(),
            'steps_images': steps_images
        })

    return render_template('northwest_corner.html', plot_url=plot_url, table_data=table_data.to_html() if table_data is not None else None, num_sources=num_sources, num_destinations=num_destinations, steps_images=steps_images)

@app.route('/other_algorithm', methods=['GET', 'POST'])
def other_algorithm():
    if request.method == 'POST':
        # Implementa aquí otro algoritmo y genera su gráfica
        pass
    return render_template('other_algorithm.html')

if __name__ == '__main__':
    app.run(debug=True)