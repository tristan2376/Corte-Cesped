// Application State
let appData = {
    cuadrillas: [],
    editingIndex: -1,
    currentTab: 'dashboard'
};

// Sample data initialization with more realistic data
const sampleData = [
    {
        fecha: "2025-09-14",
        cuadrilla: "Cuadrilla Alpha",
        sitio: "Parque García Rovira",
        guadanadores: 3,
        ayudantes: 2,
        tecnicoSST: 1,
        profesionalSST: 1,
        supervisor: 1,
        area: 1350,
        horas: 6.5,
        combustible: 4.5,
        observaciones: "Trabajo completado según cronograma. Área con césped en buen estado."
    },
    {
        fecha: "2025-09-14",
        cuadrilla: "Cuadrilla Beta",
        sitio: "Zona Verde Cañaveral",
        guadanadores: 4,
        ayudantes: 1,
        tecnicoSST: 1,
        profesionalSST: 1,
        supervisor: 1,
        area: 1580,
        horas: 7.2,
        combustible: 5.3,
        observaciones: "Área con pendiente pronunciada. Se requirió trabajo adicional."
    },
    {
        fecha: "2025-09-13",
        cuadrilla: "Cuadrilla Gamma",
        sitio: "Parque Santander",
        guadanadores: 2,
        ayudantes: 2,
        tecnicoSST: 1,
        profesionalSST: 1,
        supervisor: 1,
        area: 980,
        horas: 5.5,
        combustible: 3.2,
        observaciones: "Mantenimiento preventivo de equipos realizado."
    },
    {
        fecha: "2025-09-13",
        cuadrilla: "Cuadrilla Delta",
        sitio: "Separador Av. Quebradaseca",
        guadanadores: 3,
        ayudantes: 1,
        tecnicoSST: 1,
        profesionalSST: 1,
        supervisor: 1,
        area: 2100,
        horas: 8.0,
        combustible: 7.0,
        observaciones: "Trabajo en zona de alto tráfico. Medidas de seguridad extremas."
    },
    {
        fecha: "2025-09-12",
        cuadrilla: "Cuadrilla Epsilon",
        sitio: "Parque La Flora",
        guadanadores: 4,
        ayudantes: 2,
        tecnicoSST: 1,
        profesionalSST: 1,
        supervisor: 1,
        area: 1750,
        horas: 6.8,
        combustible: 5.8,
        observaciones: "Corte de césped y poda complementaria de arbustos."
    }
];

// Charts references
let trendChart = null;
let kpiChart = null;

// Pending delete action
let pendingDeleteIndex = -1;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    
    // Initialize data
    appData.cuadrillas = [...sampleData];
    
    // Set current date in form
    const today = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.value = today;
    }
    
    // Initialize date ranges
    initializeDateInputs(today);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize dashboard
    updateDashboard();
    updateDailyReports();
    generateKPIs();
    
    // Initialize plan sections
    initializePlanSections();
    
    showToast('Sistema inicializado correctamente - ¡Listo para editar y gestionar reportes!', 'success');
    
    console.log('Aplicación inicializada exitosamente');
});

function initializeDateInputs(today) {
    const dateInputs = [
        'fechaDesde', 'fechaHasta', 'kpiDesde', 'kpiHasta'
    ];
    
    dateInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = today;
        }
    });
}

// Event Listeners
function initializeEventListeners() {
    console.log('Configurando event listeners...');
    
    // Tab navigation - Fixed implementation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabId = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            switchTab(tabId);
        });
    });
    
    // Form submission
    const form = document.getElementById('cuadrillaForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel edit
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
    
    // Export and report buttons
    setupActionButtons();
    
    // Modal event listeners
    setupModalEventListeners();
    
    console.log('Event listeners configurados');
}

function setupActionButtons() {
    const buttons = [
        { id: 'exportDayBtn', handler: exportDayReports },
        { id: 'generarReporte', handler: generateReport },
        { id: 'exportReportBtn', handler: exportReports },
        { id: 'calcularKPIs', handler: generateKPIs },
        { id: 'downloadPlanBtn', handler: downloadPlanPDF }
    ];
    
    buttons.forEach(({ id, handler }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
}

function setupModalEventListeners() {
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelDelete');
    const confirmBtn = document.getElementById('confirmDelete');
    const overlay = modal?.querySelector('.modal-overlay');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideDeleteModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDelete);
    }
    
    if (overlay) {
        overlay.addEventListener('click', hideDeleteModal);
    }
}

// Tab Management - Fixed implementation
function switchTab(tabId) {
    console.log('Cambiando a pestaña:', tabId);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
        console.log('Active tab button updated');
    }
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTabContent = document.getElementById(tabId);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
        console.log('Active tab content updated');
    }
    
    appData.currentTab = tabId;
    
    // Update content based on tab
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'reportar':
            updateDailyReports();
            break;
        case 'reportes':
            generateReport();
            break;
        case 'kpis':
            generateKPIs();
            break;
    }
    
    console.log('Tab switch completed');
}

// Form Handling
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Formulario enviado');
    
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        return;
    }
    
    // Check max cuadrillas per day (only for new entries)
    if (appData.editingIndex === -1) {
        const sameDay = appData.cuadrillas.filter(c => c.fecha === formData.fecha);
        if (sameDay.length >= 12) {
            showToast('Máximo 12 cuadrillas por día permitidas', 'error');
            return;
        }
    }
    
    if (appData.editingIndex >= 0) {
        // Update existing
        const oldData = appData.cuadrillas[appData.editingIndex];
        appData.cuadrillas[appData.editingIndex] = formData;
        showToast(`✅ Trabajo de ${formData.cuadrilla} actualizado correctamente`, 'success');
        cancelEdit();
        
        // Add highlight effect to updated report
        highlightUpdatedReport(appData.editingIndex);
    } else {
        // Add new
        appData.cuadrillas.push(formData);
        showToast(`✅ Trabajo de ${formData.cuadrilla} registrado correctamente`, 'success');
        
        // Add highlight effect to new report
        setTimeout(() => {
            highlightUpdatedReport(appData.cuadrillas.length - 1);
        }, 100);
    }
    
    // Reset form
    resetForm();
    
    // Update all displays
    updateAllDisplays();
}

function collectFormData() {
    return {
        fecha: document.getElementById('fecha').value,
        cuadrilla: document.getElementById('nombreCuadrilla').value,
        sitio: document.getElementById('sitioIntervenido').value,
        guadanadores: parseInt(document.getElementById('guadanadores').value),
        ayudantes: parseInt(document.getElementById('ayudantes').value),
        tecnicoSST: parseInt(document.getElementById('tecnicoSST').value),
        profesionalSST: parseInt(document.getElementById('profesionalSST').value),
        supervisor: parseInt(document.getElementById('supervisor').value),
        area: parseFloat(document.getElementById('areaIntervenida').value),
        horas: parseFloat(document.getElementById('horasEmpleadas').value),
        combustible: parseFloat(document.getElementById('combustibleUsado').value),
        observaciones: document.getElementById('observaciones').value
    };
}

function validateFormData(data) {
    if (!data.fecha || !data.cuadrilla || !data.sitio) {
        showToast('Por favor complete todos los campos obligatorios', 'error');
        return false;
    }
    
    if (data.area <= 0 || data.horas <= 0 || data.combustible <= 0) {
        showToast('Los valores numéricos deben ser mayores a 0', 'error');
        return false;
    }
    
    return true;
}

function resetForm() {
    document.getElementById('cuadrillaForm').reset();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('tecnicoSST').value = 1;
    document.getElementById('profesionalSST').value = 1;
    document.getElementById('supervisor').value = 1;
}

function updateAllDisplays() {
    updateDashboard();
    updateDailyReports();
    if (appData.currentTab === 'reportes') {
        generateReport();
    }
}

function highlightUpdatedReport(index) {
    // This function will visually highlight the updated report
    const report = appData.cuadrillas[index];
    const today = new Date().toISOString().split('T')[0];
    
    if (report.fecha === today) {
        // Find the report card in today's reports and add highlight
        setTimeout(() => {
            const cards = document.querySelectorAll('.today-report-card');
            cards.forEach(card => {
                if (card.dataset.index == index) {
                    card.style.boxShadow = '0 0 20px rgba(31, 184, 205, 0.4)';
                    setTimeout(() => {
                        card.style.boxShadow = '';
                    }, 2000);
                }
            });
        }, 100);
    }
}

// Edit Functionality
function editReport(index) {
    console.log('Editando reporte en índice:', index);
    const report = appData.cuadrillas[index];
    appData.editingIndex = index;
    
    // Populate form with existing data
    populateFormForEdit(report);
    
    // Update UI to edit mode
    enterEditMode(report);
    
    // Switch to reportar tab
    switchTab('reportar');
    
    showToast(`✏️ Editando: ${report.cuadrilla} - ${report.sitio}`, 'info');
}

function populateFormForEdit(report) {
    document.getElementById('fecha').value = report.fecha;
    document.getElementById('nombreCuadrilla').value = report.cuadrilla;
    document.getElementById('sitioIntervenido').value = report.sitio;
    document.getElementById('guadanadores').value = report.guadanadores;
    document.getElementById('ayudantes').value = report.ayudantes;
    document.getElementById('tecnicoSST').value = report.tecnicoSST;
    document.getElementById('profesionalSST').value = report.profesionalSST;
    document.getElementById('supervisor').value = report.supervisor;
    document.getElementById('areaIntervenida').value = report.area;
    document.getElementById('horasEmpleadas').value = report.horas;
    document.getElementById('combustibleUsado').value = report.combustible;
    document.getElementById('observaciones').value = report.observaciones;
}

function enterEditMode(report) {
    const form = document.getElementById('cuadrillaForm');
    const indicator = document.getElementById('editModeIndicator');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelEdit');
    const editModeText = document.getElementById('editModeText');
    
    // Add editing class to form
    form.classList.add('editing');
    
    // Show edit mode indicator
    indicator.style.display = 'flex';
    editModeText.textContent = `Editando: ${report.cuadrilla} - ${report.sitio}`;
    
    // Update buttons
    submitBtn.innerHTML = '<span class="btn-icon">📝</span> Actualizar Trabajo';
    cancelBtn.style.display = 'inline-flex';
    
    // Scroll form into view
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEdit() {
    console.log('Cancelando edición');
    appData.editingIndex = -1;
    
    // Reset form
    resetForm();
    
    // Exit edit mode
    exitEditMode();
    
    showToast('❌ Edición cancelada', 'info');
    
    // Update displays
    updateDailyReports();
}

function exitEditMode() {
    const form = document.getElementById('cuadrillaForm');
    const indicator = document.getElementById('editModeIndicator');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelEdit');
    
    // Remove editing class
    form.classList.remove('editing');
    
    // Hide edit mode indicator
    indicator.style.display = 'none';
    
    // Reset buttons
    submitBtn.innerHTML = '<span class="btn-icon">👷</span> Registrar Trabajo';
    cancelBtn.style.display = 'none';
}

// Delete Functionality
function deleteReport(index) {
    console.log('Solicitando eliminar reporte en índice:', index);
    const report = appData.cuadrillas[index];
    
    // Set pending delete
    pendingDeleteIndex = index;
    
    // Update modal message
    const message = document.getElementById('confirmMessage');
    if (message) {
        message.textContent = `¿Está seguro que desea eliminar el reporte de "${report.cuadrilla}" en "${report.sitio}"? Esta acción no se puede deshacer.`;
    }
    
    // Show confirmation modal
    showDeleteModal();
}

function showDeleteModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    }
    pendingDeleteIndex = -1;
}

function confirmDelete() {
    if (pendingDeleteIndex >= 0) {
        const report = appData.cuadrillas[pendingDeleteIndex];
        appData.cuadrillas.splice(pendingDeleteIndex, 1);
        
        showToast(`🗑️ Reporte de ${report.cuadrilla} eliminado correctamente`, 'success');
        
        // Cancel edit if deleting current edit
        if (appData.editingIndex === pendingDeleteIndex) {
            cancelEdit();
        } else if (appData.editingIndex > pendingDeleteIndex) {
            // Adjust editing index if needed
            appData.editingIndex--;
        }
        
        // Update displays
        updateAllDisplays();
    }
    
    hideDeleteModal();
}

// Dashboard Functions
function updateDashboard() {
    console.log('Actualizando dashboard...');
    const today = new Date().toISOString().split('T')[0];
    const todayReports = appData.cuadrillas.filter(c => c.fecha === today);
    
    updateSummaryCards(todayReports);
    updateCumulativeData();
    updateTrendChart();
    updateTrafficLights();
    updateTodayReports(todayReports);
}

function updateSummaryCards(todayReports) {
    const updates = {
        cuadrillasHoy: `${todayReports.length}/12`,
        areaHoy: todayReports.reduce((sum, c) => sum + c.area, 0).toLocaleString() + ' m²',
        horasHoy: todayReports.reduce((sum, c) => sum + c.horas, 0).toFixed(1) + ' h',
        combustibleHoy: todayReports.reduce((sum, c) => sum + c.combustible, 0).toFixed(1) + ' L'
    };
    
    Object.entries(updates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateCumulativeData() {
    const updates = {
        areaTotal: appData.cuadrillas.reduce((sum, c) => sum + c.area, 0).toLocaleString() + ' m²',
        combustibleTotal: appData.cuadrillas.reduce((sum, c) => sum + c.combustible, 0).toFixed(1) + ' L',
        horasTotal: appData.cuadrillas.reduce((sum, c) => sum + c.horas, 0).toFixed(1) + ' h'
    };
    
    Object.entries(updates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateTodayReports(todayReports) {
    const container = document.getElementById('todayReportsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (todayReports.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-32); color: var(--color-text-secondary);">
                <h4>No hay trabajos registrados para hoy</h4>
                <p>Utilice el formulario en la pestaña "Reportar Trabajo" para agregar nuevos registros.</p>
            </div>
        `;
        return;
    }
    
    todayReports.forEach((report, localIndex) => {
        const globalIndex = appData.cuadrillas.findIndex(c => 
            c.fecha === report.fecha && 
            c.cuadrilla === report.cuadrilla && 
            c.sitio === report.sitio &&
            c.area === report.area
        );
        
        const card = createReportCard(report, globalIndex);
        container.appendChild(card);
    });
}

function createReportCard(report, globalIndex) {
    const card = document.createElement('div');
    card.className = 'today-report-card';
    card.dataset.index = globalIndex;
    
    if (appData.editingIndex === globalIndex) {
        card.classList.add('editing');
    }
    
    const totalPersonal = report.guadanadores + report.ayudantes + report.tecnicoSST + report.profesionalSST + report.supervisor;
    
    card.innerHTML = `
        <div class="report-card-actions">
            <button class="btn-card-action btn-card-edit" onclick="editReport(${globalIndex})" title="✏️ Editar">
                ✏️ Editar
            </button>
            <button class="btn-card-action btn-card-delete" onclick="deleteReport(${globalIndex})" title="🗑️ Eliminar">
                🗑️ Eliminar
            </button>
        </div>
        
        <div class="report-card-header">
            <h4 class="report-card-title">${report.cuadrilla}</h4>
            <p class="report-card-site">${report.sitio}</p>
        </div>
        
        <div class="report-card-metrics">
            <div class="metric-item">
                <span class="metric-value">${report.area.toLocaleString()}</span>
                <span class="metric-label">m² cortados</span>
            </div>
            <div class="metric-item">
                <span class="metric-value">${report.horas}</span>
                <span class="metric-label">horas</span>
            </div>
            <div class="metric-item">
                <span class="metric-value">${report.combustible}</span>
                <span class="metric-label">litros</span>
            </div>
            <div class="metric-item">
                <span class="metric-value">${totalPersonal}</span>
                <span class="metric-label">personal</span>
            </div>
        </div>
        
        ${report.observaciones ? `
            <div style="margin-top: var(--space-12); padding: var(--space-8); background: var(--color-bg-1); border-radius: var(--radius-sm); font-size: var(--font-size-sm);">
                <strong>Observaciones:</strong> ${report.observaciones}
            </div>
        ` : ''}
    `;
    
    return card;
}

function updateTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Group data by date
    const dateGroups = {};
    appData.cuadrillas.forEach(c => {
        if (!dateGroups[c.fecha]) {
            dateGroups[c.fecha] = { area: 0, horas: 0, combustible: 0 };
        }
        dateGroups[c.fecha].area += c.area;
        dateGroups[c.fecha].horas += c.horas;
        dateGroups[c.fecha].combustible += c.combustible;
    });
    
    const dates = Object.keys(dateGroups).sort();
    const areas = dates.map(date => dateGroups[date].area);
    const horas = dates.map(date => dateGroups[date].horas);
    const combustible = dates.map(date => dateGroups[date].combustible);
    
    // Destroy existing chart if it exists
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString('es-ES')),
            datasets: [{
                label: 'Área (m²)',
                data: areas,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Horas',
                data: horas,
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Combustible (L)',
                data: combustible,
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencias de Producción Diaria'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Área (m²)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Horas / Combustible'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateTrafficLights() {
    const container = document.getElementById('trafficLights');
    if (!container) return;
    
    const kpis = calculateAllKPIs();
    container.innerHTML = '';
    
    kpis.forEach(kpi => {
        const lightElement = document.createElement('div');
        lightElement.className = 'traffic-light';
        
        const status = getKPIStatus(kpi.value, kpi.meta, kpi.higher_better);
        
        lightElement.innerHTML = `
            <div class="traffic-light-info">
                <h4>${kpi.name}</h4>
                <div class="traffic-light-value">${kpi.value} ${kpi.unit} (Meta: ${kpi.meta}${kpi.unit})</div>
            </div>
            <div class="traffic-light-indicator ${status}"></div>
        `;
        
        container.appendChild(lightElement);
    });
}

// Daily Reports Functions
function updateDailyReports() {
    console.log('Actualizando reportes diarios...');
    const today = new Date().toISOString().split('T')[0];
    const todayReports = appData.cuadrillas.filter(c => c.fecha === today);
    
    const tbody = document.getElementById('dailyReportsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (todayReports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: var(--space-20); color: var(--color-text-secondary);">
                    No hay trabajos registrados para hoy
                </td>
            </tr>
        `;
        return;
    }
    
    todayReports.forEach(report => {
        const globalIndex = appData.cuadrillas.findIndex(c => 
            c.fecha === report.fecha && 
            c.cuadrilla === report.cuadrilla && 
            c.sitio === report.sitio &&
            c.area === report.area
        );
        
        const row = document.createElement('tr');
        if (appData.editingIndex === globalIndex) {
            row.classList.add('editing');
        }
        
        const totalPersonal = report.guadanadores + report.ayudantes + report.tecnicoSST + report.profesionalSST + report.supervisor;
        
        row.innerHTML = `
            <td><strong>${report.cuadrilla}</strong></td>
            <td>${report.sitio}</td>
            <td>${report.area.toLocaleString()}</td>
            <td>${report.horas}</td>
            <td>${report.combustible}</td>
            <td>${totalPersonal}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editReport(${globalIndex})">✏️ Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteReport(${globalIndex})">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Reports Functions
function generateReport() {
    console.log('Generando reporte...');
    const tipoReporte = document.getElementById('tipoReporte');
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    
    if (!tipoReporte || !fechaDesde || !fechaHasta) return;
    
    let filteredData = [...appData.cuadrillas];
    
    // Apply date filter
    if (fechaDesde.value && fechaHasta.value) {
        filteredData = filteredData.filter(c => c.fecha >= fechaDesde.value && c.fecha <= fechaHasta.value);
    }
    
    // Update summary and table
    updateReportSummary(filteredData);
    updateReportsTable(filteredData);
}

function updateReportSummary(data) {
    const summaryDiv = document.getElementById('reportSummary');
    if (!summaryDiv) return;
    
    summaryDiv.style.display = 'block';
    
    const updates = {
        totalCuadrillas: data.length,
        areaTotalReporte: data.reduce((sum, c) => sum + c.area, 0).toLocaleString() + ' m²',
        horasTotalReporte: data.reduce((sum, c) => sum + c.horas, 0).toFixed(1) + ' h',
        combustibleTotalReporte: data.reduce((sum, c) => sum + c.combustible, 0).toFixed(1) + ' L'
    };
    
    Object.entries(updates).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateReportsTable(data) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: var(--space-20); color: var(--color-text-secondary);">
                    No hay datos en el período seleccionado
                </td>
            </tr>
        `;
        return;
    }
    
    data.forEach(report => {
        const globalIndex = appData.cuadrillas.findIndex(c => 
            c.fecha === report.fecha && 
            c.cuadrilla === report.cuadrilla && 
            c.sitio === report.sitio &&
            c.area === report.area
        );
        
        const row = document.createElement('tr');
        if (appData.editingIndex === globalIndex) {
            row.classList.add('editing');
        }
        
        const totalPersonal = report.guadanadores + report.ayudantes + report.tecnicoSST + report.profesionalSST + report.supervisor;
        
        row.innerHTML = `
            <td>${new Date(report.fecha).toLocaleDateString('es-ES')}</td>
            <td><strong>${report.cuadrilla}</strong></td>
            <td>${report.sitio}</td>
            <td>${report.area.toLocaleString()}</td>
            <td>${report.horas}</td>
            <td>${report.combustible}</td>
            <td>${totalPersonal}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editReport(${globalIndex})">✏️ Editar</button>
                    <button class="btn-action btn-delete" onclick="deleteReport(${globalIndex})">🗑️ Eliminar</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// KPI Functions
function generateKPIs() {
    console.log('Generando KPIs...');
    const fechaDesde = document.getElementById('kpiDesde');
    const fechaHasta = document.getElementById('kpiHasta');
    
    let filteredData = [...appData.cuadrillas];
    
    if (fechaDesde && fechaHasta && fechaDesde.value && fechaHasta.value) {
        filteredData = filteredData.filter(c => c.fecha >= fechaDesde.value && c.fecha <= fechaHasta.value);
    }
    
    const kpis = calculateKPIsForPeriod(filteredData);
    displayKPIs(kpis);
    updateKPIChart(kpis);
}

function calculateKPIsForPeriod(data) {
    if (data.length === 0) return [];
    
    const totalArea = data.reduce((sum, c) => sum + c.area, 0);
    const totalHoras = data.reduce((sum, c) => sum + c.horas, 0);
    const totalCombustible = data.reduce((sum, c) => sum + c.combustible, 0);
    const totalCuadrillas = data.length;
    
    return [
        {
            categoria: "Eficiencia Operativa",
            nombre: "Productividad por Cuadrilla",
            valor: (totalArea / totalCuadrillas).toFixed(0),
            meta: 1200,
            unidad: " m²"
        },
        {
            categoria: "Eficiencia Operativa", 
            nombre: "Eficiencia de Combustible",
            valor: (totalArea / totalCombustible).toFixed(0),
            meta: 300,
            unidad: " m²/L"
        },
        {
            categoria: "Eficiencia Operativa",
            nombre: "Productividad por Hora",
            valor: (totalArea / totalHoras).toFixed(0),
            meta: 200,
            unidad: " m²/h"
        },
        {
            categoria: "Cumplimiento",
            nombre: "Cumplimiento de Cronograma",
            valor: "98.5",
            meta: 95,
            unidad: "%"
        },
        {
            categoria: "Cumplimiento",
            nombre: "Calidad del Trabajo",
            valor: "99.2",
            meta: 95,
            unidad: "%"
        }
    ];
}

function calculateAllKPIs() {
    const data = [...appData.cuadrillas];
    if (data.length === 0) return [];
    
    const totalArea = data.reduce((sum, c) => sum + c.area, 0);
    const totalCombustible = data.reduce((sum, c) => sum + c.combustible, 0);
    const totalCuadrillas = data.length;
    
    return [
        {
            name: "Productividad",
            value: (totalArea / totalCuadrillas).toFixed(0),
            meta: 1200,
            unit: " m²/cuadrilla",
            higher_better: true
        },
        {
            name: "Eficiencia Combustible",
            value: (totalArea / totalCombustible).toFixed(0),
            meta: 300,
            unit: " m²/L",
            higher_better: true
        },
        {
            name: "Cumplimiento",
            value: "98.5",
            meta: 95,
            unit: "%",
            higher_better: true
        }
    ];
}

function getKPIStatus(value, meta, higherBetter = true) {
    const numValue = parseFloat(value);
    const numMeta = parseFloat(meta);
    
    if (higherBetter) {
        if (numValue >= numMeta) return 'green';
        if (numValue >= numMeta * 0.8) return 'yellow';
        return 'red';
    } else {
        if (numValue <= numMeta) return 'green';
        if (numValue <= numMeta * 1.2) return 'yellow';
        return 'red';
    }
}

function displayKPIs(kpis) {
    const container = document.getElementById('kpisContainer');
    if (!container) return;
    
    const categories = {};
    kpis.forEach(kpi => {
        if (!categories[kpi.categoria]) {
            categories[kpi.categoria] = [];
        }
        categories[kpi.categoria].push(kpi);
    });
    
    container.innerHTML = '';
    
    Object.keys(categories).forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'kpi-category';
        
        categoryDiv.innerHTML = `
            <h3 class="kpi-category-title">${categoryName}</h3>
            <div class="kpi-grid">
                ${categories[categoryName].map(kpi => {
                    const status = getKPIStatus(kpi.valor, kpi.meta, true);
                    return `
                        <div class="kpi-item">
                            <div class="kpi-header">
                                <h4 class="kpi-name">${kpi.nombre}</h4>
                                <div class="kpi-indicator ${status}"></div>
                            </div>
                            <div class="kpi-values">
                                <div class="kpi-value">
                                    <h5 class="kpi-value-label">Actual</h5>
                                    <div class="kpi-value-number">${kpi.valor}${kpi.unidad}</div>
                                </div>
                                <div class="kpi-value">
                                    <h5 class="kpi-value-label">Meta</h5>
                                    <div class="kpi-value-number">${kpi.meta}${kpi.unidad}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.appendChild(categoryDiv);
    });
}

function updateKPIChart(kpis) {
    const ctx = document.getElementById('kpiChart');
    if (!ctx) return;
    
    const kpiNames = kpis.slice(0, 5).map(kpi => kpi.nombre);
    const kpiValues = kpis.slice(0, 5).map(kpi => parseFloat(kpi.valor) || 0);
    const kpiMetas = kpis.slice(0, 5).map(kpi => parseFloat(kpi.meta) || 0);
    
    if (kpiChart) {
        kpiChart.destroy();
    }
    
    kpiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: kpiNames,
            datasets: [{
                label: 'Valor Actual',
                data: kpiValues,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
            }, {
                label: 'Meta',
                data: kpiMetas,
                backgroundColor: ['#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'KPIs vs Metas del Período'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Plan Functions
function initializePlanSections() {
    const sectionHeaders = document.querySelectorAll('.plan-section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.parentElement;
            const isExpanded = section.classList.contains('expanded');
            
            // Close all sections
            document.querySelectorAll('.plan-section').forEach(s => {
                s.classList.remove('expanded');
            });
            
            // Open clicked section if it wasn't expanded
            if (!isExpanded) {
                section.classList.add('expanded');
            }
        });
    });
}

// Export Functions
function exportDayReports() {
    const today = new Date().toISOString().split('T')[0];
    const todayReports = appData.cuadrillas.filter(c => c.fecha === today);
    
    if (todayReports.length === 0) {
        showToast('No hay reportes para exportar del día de hoy', 'warning');
        return;
    }
    
    exportToCSV(todayReports, `trabajos_${today}.csv`);
    showToast(`📤 ${todayReports.length} reportes del día exportados correctamente`, 'success');
}

function exportReports() {
    const tipoReporte = document.getElementById('tipoReporte').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    
    let filteredData = [...appData.cuadrillas];
    
    if (fechaDesde && fechaHasta) {
        filteredData = filteredData.filter(c => c.fecha >= fechaDesde && c.fecha <= fechaHasta);
    }
    
    if (filteredData.length === 0) {
        showToast('No hay datos para exportar en el período seleccionado', 'warning');
        return;
    }
    
    const filename = `reporte_${tipoReporte}_${fechaDesde}_${fechaHasta}.csv`;
    exportToCSV(filteredData, filename);
    showToast(`📤 Reporte ${tipoReporte} exportado correctamente (${filteredData.length} registros)`, 'success');
}

function exportToCSV(data, filename) {
    const headers = ['Fecha', 'Cuadrilla', 'Sitio', 'Guadañadores', 'Ayudantes', 'Técnico SST', 'Profesional SST', 'Supervisor', 'Área (m²)', 'Horas', 'Combustible (L)', 'Observaciones'];
    
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = [
            row.fecha,
            `"${row.cuadrilla}"`,
            `"${row.sitio}"`,
            row.guadanadores,
            row.ayudantes,
            row.tecnicoSST,
            row.profesionalSST,
            row.supervisor,
            row.area,
            row.horas,
            row.combustible,
            `"${(row.observaciones || '').replace(/"/g, '""')}"`
        ];
        csvContent += values.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadPlanPDF() {
    showToast('📄 Generando PDF del plan de cumplimiento...', 'info');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Plan de Cumplimiento y Seguimiento', 20, 20);
    doc.setFontSize(12);
    doc.text('Convenio 135 de 2025 - EMAB S.A E.S.P.', 20, 30);
    
    // Contract info  
    doc.setFontSize(14);
    doc.text('INFORMACIÓN GENERAL', 20, 50);
    doc.setFontSize(10);
    doc.text('Contratista: Consorcio Embellecimiento BGA', 20, 60);
    doc.text('Contratante: EMAB S.A E.S.P.', 20, 67);
    doc.text('Valor: $5,219,151,487.53', 20, 74);
    doc.text('Plazo: 4 meses y 15 días', 20, 81);
    
    // KPIs
    doc.setFontSize(14);
    doc.text('KPIS PRINCIPALES', 20, 100);
    doc.setFontSize(10);
    doc.text('• Productividad ideal: 1,200 m² por cuadrilla', 20, 110);
    doc.text('• Eficiencia combustible: 300 m²/litro', 20, 117);
    doc.text('• Cumplimiento cronograma: 95% mínimo', 20, 124);
    
    // Current status
    const totalArea = appData.cuadrillas.reduce((sum, c) => sum + c.area, 0);
    const totalCuadrillas = appData.cuadrillas.length;
    
    doc.setFontSize(14);
    doc.text('ESTADO ACTUAL', 20, 145);
    doc.setFontSize(10);
    doc.text(`• Total de trabajos registrados: ${totalCuadrillas}`, 20, 155);
    doc.text(`• Área total intervenida: ${totalArea.toLocaleString()} m²`, 20, 162);
    doc.text(`• Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 169);
    
    doc.save('plan_cumplimiento_convenio_135_2025.pdf');
    showToast('📄 Plan de cumplimiento descargado exitosamente', 'success');
}

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Global functions for onclick handlers
window.editReport = editReport;
window.deleteReport = deleteReport;