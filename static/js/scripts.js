document.addEventListener('DOMContentLoaded', function() {
    var initialForm = document.getElementById('initialForm');
    var resetButton = document.getElementById('resetButton');

    if (initialForm) {
        initialForm.onsubmit = function(event) {
            event.preventDefault();
            var numSources = document.getElementById('numSources').value;
            var numDestinations = document.getElementById('numDestinations').value;
            var inputTable = document.getElementById('inputTable');
            var thead = inputTable.querySelector('thead tr');
            var tbody = inputTable.querySelector('tbody');
            var tfoot = inputTable.querySelector('tfoot tr');

            // Clear previous table content
            thead.innerHTML = '<th>F/D</th>';
            tbody.innerHTML = '';
            tfoot.innerHTML = '<th>Oferta</th>';

            // Add destination columns
            for (var j = 1; j <= numDestinations; j++) {
                thead.innerHTML += '<th>Destino ' + j + '</th>';
            }
            thead.innerHTML += '<th>Demanda</th>';

            // Add source rows
            for (var i = 1; i <= numSources; i++) {
                var row = '<tr><td>Fuente ' + i + '</td>';
                for (var j = 1; j <= numDestinations; j++) {
                    row += '<td><input type="number" name="C' + i + j + '" required></td>';
                }
                row += '<td><input type="number" name="D' + i + '" required></td></tr>';
                tbody.innerHTML += row;
            }

            for (var j = 1; j <= numDestinations; j++) {
                tfoot.innerHTML += '<td><input type="number" name="O' + j + '" required></td>';
            }
            tfoot.innerHTML += '<td>-</td>';

            document.getElementById('initialForm').style.display = 'none';
            document.getElementById('dataForm').style.display = 'block';

            var infoDiv = document.querySelector('.n-filas-columna');
            infoDiv.innerHTML = '<p>(' + numSources+'X'+numDestinations +')</p>';
        };
    }

    if (resetButton) {
        resetButton.onclick = function() {
            document.getElementById('initialForm').style.display = 'block';
            document.getElementById('dataForm').style.display = 'none';
            document.getElementById('stepsContainer').style.display = 'none';
            document.getElementById('resultContainer').style.display = 'none';
            document.getElementById('initialForm').reset();
        };
    }
});

function resuelve() {
    var numSources = document.getElementById('numSources').value;
    var numDestinations = document.getElementById('numDestinations').value;
    var supply = [];
    var demand = [];
    var costs = [];

    for (var i = 1; i <= numSources; i++) {
        supply.push(parseInt(document.querySelector(`input[name="D${i}"]`).value));
    }

    for (var j = 1; j <= numDestinations; j++) {
        demand.push(parseInt(document.querySelector(`input[name="O${j}"]`).value));
    }

    for (var i = 1; i <= numSources; i++) {
        var row = [];
        for (var j = 1; j <= numDestinations; j++) {
            row.push(parseInt(document.querySelector(`input[name="C${i}${j}"]`).value));
        }
        costs.push(row);
    }

    var stepsContainer = document.getElementById('stepsContainer');
    var stepsDiv = document.getElementById('steps');
    stepsDiv.innerHTML = '';
    stepsContainer.style.display = 'block';

    var resultContainer = document.getElementById('resultContainer');
    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    resultContainer.style.display = 'block';

    fetch('/northwest_corner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            numSources: numSources,
            numDestinations: numDestinations,
            supply: supply,
            demand: demand,
            costs: costs
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.steps_images) {
            data.steps_images.forEach(step_image => {
                stepsDiv.innerHTML += `<img src="data:image/png;base64,${step_image}" class="img-fluid mb-3" />`;
            });
        }
        if (data.plot_url) {
            resultDiv.innerHTML += `<img src="data:image/png;base64,${data.plot_url}" class="img-fluid" />`;
        }
        if (data.table_data) {
            resultDiv.innerHTML += `<div class="table-responsive mt-3">${data.table_data}</div>`;
        }
    });
}

function northwestCornerMethod(supply, demand, costs, stepsDiv) {
    var totalCost = 0;
    var allocation = [];
    for (var i = 0; i < supply.length; i++) {
        allocation.push(new Array(demand.length).fill(0));
    }

    var i = 0;
    var j = 0;
    while (i < supply.length && j < demand.length) {
        var allocated = Math.min(supply[i], demand[j]);
        allocation[i][j] = allocated;
        supply[i] -= allocated;
        demand[j] -= allocated;
        totalCost += allocated * costs[i][j];

        stepsDiv.innerHTML += `<p>Asignar ${allocated} unidades a la celda (${i + 1}, ${j + 1}) con costo ${costs[i][j]}</p>`;

        if (supply[i] === 0) {
            i++;
        } else {
            j++;
        }
    }

    return { totalCost: totalCost, allocation: allocation };
}