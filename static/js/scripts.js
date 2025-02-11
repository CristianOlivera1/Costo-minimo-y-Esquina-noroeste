document.addEventListener('DOMContentLoaded', function() {
    var initialForm = document.getElementById('initialForm');
    var resetButton = document.getElementById('resetButton');

    if (initialForm) {
        initialForm.onsubmit = function(event) {
            event.preventDefault();
            if (validateForm()) {
                crearTabla();
            }
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

function validateForm() {
    const numSources = document.getElementById('numSources').value;
    const numDestinations = document.getElementById('numDestinations').value;
    const errorMessage = document.getElementById('errorMessage');

    if (numSources < 0 || numDestinations < 0) {
        errorMessage.style.display = 'block';
        return false;
    } else {
        errorMessage.style.display = 'none';
        return true;
    }
}

function crearTabla() {
    var numSources = document.getElementById('numSources').value;
    var numDestinations = document.getElementById('numDestinations').value;
    var inputTable = document.getElementById('inputTable');
    var thead = inputTable.querySelector('thead tr');
    var tbody = inputTable.querySelector('tbody');
    var tfoot = inputTable.querySelector('tfoot tr');

    // Clear previous table content
    thead.innerHTML = '<th>F/D</th>';
    tbody.innerHTML = '';
    tfoot.innerHTML = '<th>Demanda</th>';

    // Add destination columns
    for (var j = 1; j <= numDestinations; j++) {
        thead.innerHTML += '<th>Destino ' + j + '</th>';
    }
    thead.innerHTML += '<th>Oferta</th>';

    // Add source rows
    for (var i = 1; i <= numSources; i++) {
        var row = '<tr><td>Fuente ' + i + '</td>';
        for (var j = 1; j <= numDestinations; j++) {
            row += '<td><input type="number" name="C' + i + j + '" required></td>';
        }
        row += '<td><input type="number" name="O' + i + '" required></td></tr>';
        tbody.innerHTML += row;
    }

    for (var j = 1; j <= numDestinations; j++) {
        tfoot.innerHTML += '<td><input type="number" name="D' + j + '" required></td>';
    }
    tfoot.innerHTML += '<td>-</td>';

    document.getElementById('initialForm').style.display = 'none';
    document.getElementById('dataForm').style.display = 'block';

    var infoDiv = document.querySelector('.n-filas-columna');
    infoDiv.innerHTML = '<p>(' + numSources + 'X' + numDestinations + ')</p>';
}
function resuelve() {
    var numSources = document.getElementById('numSources').value;
    var numDestinations = document.getElementById('numDestinations').value;
    var supply = [];
    var demand = [];
    var costs = [];

    for (var i = 1; i <= numSources; i++) {
        supply.push(parseInt(document.querySelector(`input[name="O${i}"]`).value));
    }

    for (var j = 1; j <= numDestinations; j++) {
        demand.push(parseInt(document.querySelector(`input[name="D${j}"]`).value));
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
    stepsContainer.style.display = 'none';

    var resultContainer = document.getElementById('resultContainer');
    var resultDiv = document.getElementById('result');
    var calculationDiv = document.getElementById('calculation');
    resultDiv.innerHTML = '';
    calculationDiv.innerHTML = '';
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
        if (data.plot_url) {
            resultDiv.innerHTML += `<img src="data:image/png;base64,${data.plot_url}" class="img-fluid" />`;
        }
        if (data.calculation) {
            calculationDiv.innerHTML = `<h4 class="text-info mt-2">Cálculo del Costo Total:</h4><p>Z = ${data.calculation}</p>`;
        }
        if (data.steps_images) {
            stepsDiv.innerHTML = '';
            data.steps_images.forEach(step_image => {
                stepsDiv.innerHTML += `<img src="data:image/png;base64,${step_image}" class="img-fluid mb-3" style="display:none;" />`;
            });
        }
    });
}

function verIteraciones() {
    var stepsContainer = document.getElementById('stepsContainer');
    stepsContainer.style.display = 'block';
}

function verSiguienteIteracion() {
    var stepsDiv = document.getElementById('steps');
    var stepImages = stepsDiv.querySelectorAll('img');
    var currentStep = 0;

    function showStep() {
        stepImages.forEach((img, index) => {
            img.style.display = index === currentStep ? 'block' : 'none';
        });
        currentStep++;
        if (currentStep < stepImages.length) {
            setTimeout(showStep, 2000); // Cambia de iteración cada 2 segundos
        }
    }

    showStep();
}

function verTodasIteraciones() {
    var stepsDiv = document.getElementById('steps');
    var stepImages = stepsDiv.querySelectorAll('img');

    stepImages.forEach(img => {
        img.style.display = 'block';
    });
}

function exportarDatos() {
    var numSources = document.getElementById('numSources').value;
    var numDestinations = document.getElementById('numDestinations').value;
    var supply = [];
    var demand = [];
    var costs = [];

    for (var i = 1; i <= numSources; i++) {
        supply.push(parseInt(document.querySelector(`input[name="O${i}"]`).value));
    }

    for (var j = 1; j <= numDestinations; j++) {
        demand.push(parseInt(document.querySelector(`input[name="D${j}"]`).value));
    }

    for (var i = 1; i <= numSources; i++) {
        var row = [];
        for (var j = 1; j <= numDestinations; j++) {
            row.push(parseInt(document.querySelector(`input[name="C${i}${j}"]`).value));
        }
        costs.push(row);
    }

    var data = {
        numSources: numSources,
        numDestinations: numDestinations,
        supply: supply,
        demand: demand,
        costs: costs
    };

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "datos_matriz.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importarDatos(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
        var data = JSON.parse(event.target.result);
        document.getElementById('numSources').value = data.numSources;
        document.getElementById('numDestinations').value = data.numDestinations;
        crearTabla();
        setTimeout(function() {
            for (var i = 1; i <= data.numSources; i++) {
                document.querySelector(`input[name="O${i}"]`).value = data.supply[i - 1];
            }
            for (var j = 1; j <= data.numDestinations; j++) {
                document.querySelector(`input[name="D${j}"]`).value = data.demand[j - 1];
            }
            for (var i = 1; i <= data.numSources; i++) {
                for (var j = 1; j <= data.numDestinations; j++) {
                    document.querySelector(`input[name="C${i}${j}"]`).value = data.costs[i - 1][j - 1];
                }
            }
        }, 500);
    };
    reader.readAsText(file);
}