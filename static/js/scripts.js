document.getElementById('initialForm').onsubmit = function(event) {
    event.preventDefault();
    var numSources = document.getElementById('numSources').value;
    var numDestinations = document.getElementById('numDestinations').value;
    var inputTable = document.getElementById('inputTable');
    var thead = inputTable.querySelector('thead tr');
    var tbody = inputTable.querySelector('tbody');
    var tfoot = inputTable.querySelector('tfoot tr');

    // Clear previous table content
    thead.innerHTML = '<th>F/Planta</th>';
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
};