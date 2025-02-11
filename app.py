from flask import Flask, render_template, request, jsonify
from transport_solver import solve_transport_problem
import matplotlib.pyplot as plt
import io
import base64
import numpy as np
import pandas as pd

app = Flask(__name__)

def northwest_corner_method(supply, demand, costs):
    supply = supply.copy()
    demand = demand.copy()
    rows = len(supply)
    cols = len(demand)
    result = np.zeros((rows, cols))
    i = 0
    j = 0
    steps = []
    calculation = ''
    total_cost = 0
    while i < rows and j < cols:
        if supply[i] < demand[j]:
            result[i, j] = supply[i]
            demand[j] -= supply[i]
            steps.append((i, j, supply[i], demand[j]))
            total_cost += supply[i] * costs[i][j]
            calculation += f'{supply[i]}({costs[i][j]}) + '
            i += 1
        else:
            result[i, j] = demand[j]
            supply[i] -= demand[j]
            steps.append((i, j, supply[i], demand[j]))
            total_cost += demand[j] * costs[i][j]
            calculation += f'{demand[j]}({costs[i][j]}) + '
            j += 1
    calculation = calculation.rstrip(' + ')
    calculation += f' = {total_cost}.00'
    return result, steps, calculation

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
    calculation = ''

    if request.method == 'POST':
        data = request.get_json()
        num_sources = data['numSources']
        num_destinations = data['numDestinations']
        supply = data['supply']
        demand = data['demand']
        costs = data['costs']
        result, steps, calculation = northwest_corner_method(supply, demand, costs)
        
        fig, ax = plt.subplots(figsize=(len(demand) * 1.2, len(supply) * 0.8))
        ax.axis('tight')
        ax.axis('off')
        table_data = pd.DataFrame(result, columns=[f'Destino {j+1}' for j in range(len(demand))], index=[f'Fuente {i+1}' for i in range(len(supply))])
        table = ax.table(cellText=table_data.values, colLabels=table_data.columns, rowLabels=table_data.index, cellLoc='center', loc='center')
        
        plt.tight_layout()  # Ajustar el contenido

        img = io.BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight', pad_inches=0.1)
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()

        # Generate step images
        for step in steps:
            fig, ax = plt.subplots(figsize=(len(demand) * 1.2, len(supply) * 0.8))  # Ajuste dinámico del tamaño
            ax.axis('tight')
            ax.axis('off')
            
            step_data = result.copy()
            step_data[step[0], step[1]] = step[2]
            
            table_data = pd.DataFrame(step_data, columns=[f'Destino {j+1}' for j in range(len(demand))], index=[f'Fuente {i+1}' for i in range(len(supply))])
            table = ax.table(cellText=table_data.values, colLabels=table_data.columns, rowLabels=table_data.index, cellLoc='center', loc='center')

            # Resaltar la celda actual del paso
            table[(step[0], step[1])].set_facecolor('#56b5fd')

            # Ajustar márgenes y recortar espacios innecesarios
            plt.tight_layout()
            img = io.BytesIO()
            plt.savefig(img, format='png', bbox_inches='tight', pad_inches=0.1)  # Evita márgenes grandes
            img.seek(0)
            steps_images.append(base64.b64encode(img.getvalue()).decode())

        return jsonify({
            'plot_url': plot_url,
            'table_data': table_data.to_html(),
            'steps_images': steps_images,
            'calculation': calculation
        })

    return render_template('northwest_corner.html', plot_url=plot_url, table_data=table_data.to_html() if table_data is not None else None, num_sources=num_sources, num_destinations=num_destinations, steps_images=steps_images)

@app.route('/minimun_cost', methods=['GET', 'POST'])
def minimun_cost():
    # Implement the logic for the minimum cost calculation here
    return render_template('minimun_cost.html')

@app.route('/generate_matrix', methods=['POST'])
def generate_matrix():
    try:
        rows = int(request.form.get('rows'))
        cols = int(request.form.get('cols'))
        return render_template('matrix.html', rows=rows, cols=cols)
    except Exception as e:
        return f"Error: {e}"

@app.route('/solve', methods=['POST'])
def solve():
    try:
        rows = int(request.form.get('rows'))
        cols = int(request.form.get('cols'))
        supply = list(map(int, request.form.getlist('supply')))
        demand = list(map(int, request.form.getlist('demand')))
        costs = [list(map(int, request.form.getlist(f'cost_row_{i}'))) for i in range(rows)]

        result, total_cost = solve_transport_problem(supply, demand, costs)

        return render_template('result.html', result=result, total_cost=total_cost)
    except Exception as e:
        return f"Error: {e}"

if __name__ == '__main__':
    app.run(debug=True)
