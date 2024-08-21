let currentEditIndex = null;

// Function to get data from Local Storage
function getData() {
    const data = localStorage.getItem('crudData');
    return data ? JSON.parse(data) : [];
}

// Function to save data to Local Storage
function saveData(data) {
    localStorage.setItem('crudData', JSON.stringify(data));
}

// Function to render table rows
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const data = getData();
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.data}</td>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.dataContent}</td>
            <td>${item.description}</td>
        `;
        row.addEventListener('click', () => {
            openModal(index);
        });
        tableBody.appendChild(row);
    });
}

// Function to add new data
function addData(data, name, type, dataContent, description) {
    const dataList = getData();
    dataList.push({ data, name, type, dataContent, description });
    saveData(dataList);
    renderTable();
}

// Function to open modal
function openModal(index) {
    currentEditIndex = index;
    const data = getData()[index];
    document.getElementById('editData').value = data.data;
    document.getElementById('editName').value = data.name;
    document.getElementById('editType').value = data.type;
    document.getElementById('editDataContent').value = data.dataContent;
    document.getElementById('editDescription').value = data.description;
    document.getElementById('modal').style.display = 'block';
}

// Function to close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentEditIndex = null;
}

// Function to edit data
function editData(data, name, type, dataContent, description) {
    const dataList = getData();
    dataList[currentEditIndex] = { data, name, type, dataContent, description };
    saveData(dataList);
    renderTable();
    closeModal();
}

// Function to delete data
function deleteData() {
    const dataList = getData();
    dataList.splice(currentEditIndex, 1);
    saveData(dataList);
    renderTable();
    closeModal();
}

// Function to process data from Excel
function processExcelData(data) {
    const headers = data[0];
    const rows = data.slice(1);

    rows.forEach(row => {
        if (row.length >= 5) {
            const [data, name, type, dataContent, description] = row;
            addData(data, name, type, dataContent, description);
        }
    });
}

// Function to download data as Excel
function downloadExcel() {
    const dataList = getData(); // Get data from local storage

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(dataList, { header: ["data", "name", "type", "dataContent", "description"] });

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'data.xlsx');
}

// Event listener for form submission
document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const data = document.getElementById('data').value;
    const name = document.getElementById('name').value;
    const type = document.getElementById('type').value;
    const dataContent = document.getElementById('dataContent').value;
    const description = document.getElementById('description').value;
    addData(data, name, type, dataContent, description);
    this.reset();
});

// Event listener for edit form submission
document.getElementById('editForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const data = document.getElementById('editData').value;
    const name = document.getElementById('editName').value;
    const type = document.getElementById('editType').value;
    const dataContent = document.getElementById('editDataContent').value;
    const description = document.getElementById('editDescription').value;
    editData(data, name, type, dataContent, description);
});

// Event listener for delete button
document.getElementById('deleteButton').addEventListener('click', function () {
    deleteData();
});

// Event listener for file upload
document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process the data
        processExcelData(jsonData);
    };

    reader.readAsArrayBuffer(file);
});

// Event listener for download button
document.getElementById('downloadButton').addEventListener('click', downloadExcel);

// Event listener for closing the modal
document.querySelector('.close').addEventListener('click', closeModal);

// Initial rendering of the table
renderTable();
