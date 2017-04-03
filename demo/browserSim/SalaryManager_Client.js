function createTableColumn(value) {
  var column   = document.createElement('td');
  var nodeText = document.createTextNode(value);
  column.appendChild(nodeText);
  return column;
}

function createTableRow(columnValueList, isHeadingRow) {
  var row = document.createElement("tr");
  for (var i in columnValueList) {
    var column = createTableColumn(columnValueList[i]);
    row.appendChild(column);
  }
  if (isHeadingRow) {
    var header = document.createElement("thead");
    header.appendChild(row);
    return header;
  }
  return row;
}

function getSalaryDetailsOfEmployees() {
  var salaryData  = document.getElementById('salaryDetails');
  salaryData.innerHTML = '';
  var salaryTable = document.createElement('table');
  salaryTable.id  = 'salaryTable';
  salaryTable.setAttribute('border','2');
  var headingRow = createTableRow(['Name','Address','Salary'], true);
  salaryTable.appendChild(headingRow);

  var data = {};
  $.get('http://localhost:8080/SalaryGet.php?manager=true', function(response) {
    for (var i in response) {
      var empData = response[i];
      var dataRow = createTableRow([empData['name'], empData['address'], empData['salary']]);
      salaryTable.appendChild(dataRow);
    }
  });
  salaryData.appendChild(salaryTable);
}

function getOwnSalaryDetails() {
  var ownSalaryHeading = document.getElementById('OwnSalary');
  $.get('http://localhost:8080/SalaryGet.php', function(response) {
    var data        = response[0];
    var name        = data['name'];
    var salary      = data['salary'];
    var message     = 'Hi ' + name + ', your current salary is: $' + salary;
    var welcomeText = document.createTextNode(message);
    ownSalaryHeading.appendChild(welcomeText);
  });
}
