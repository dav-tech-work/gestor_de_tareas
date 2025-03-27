// 📦 Estado de la aplicación
// --------------------------------------------------------------------------
// Estructura de datos principal que almacena las tareas organizadas por estado.
// Cada estado (pendientes, en progreso, completadas) tiene su propia lista.
let tasks = {
    pending: [],      // Tareas pendientes
    in_progress: [],  // Tareas en progreso
    completed: []     // Tareas completadas
};

// 📅 Configuración del calendario
// --------------------------------------------------------------------------
// Variable que almacenará la instancia del calendario de FullCalendar.
// Se inicializa en la función initializeCalendar().
let calendar;

// 🚀 Inicialización de la aplicación
// --------------------------------------------------------------------------
// Evento que se ejecuta cuando el DOM está completamente cargado.
// Inicializa todos los componentes y carga los datos almacenados.
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadTasksFromStorage();     // Carga las tareas almacenadas
        removeExampleTasks();       // Elimina las tareas de ejemplo
        initializeCalendar();       // Inicializa el calendario
        setMinDates();             // Configura las fechas mínimas
        renderAllTasks();          // Renderiza todas las tareas
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

// 📅 Configuración de fechas
// --------------------------------------------------------------------------
// Configura las fechas mínimas para evitar seleccionar fechas pasadas.
function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
}

// 🔒 Validación de fechas
// --------------------------------------------------------------------------
// Eventos que validan la relación entre fechas de inicio y fin.
// Evita que la fecha de fin sea anterior a la de inicio.
document.getElementById('startDate').addEventListener('change', function() {
    document.getElementById('endDate').min = this.value;
});

document.getElementById('endDate').addEventListener('change', function() {
    if (this.value < document.getElementById('startDate').value) {
        alert('La fecha de entrega no puede ser anterior a la fecha de inicio');
        this.value = document.getElementById('startDate').value;
    }
});

// 🔄 Funciones de almacenamiento
// --------------------------------------------------------------------------
// Elimina las tareas de ejemplo que están en el HTML por defecto.
function removeExampleTasks() {
    document.querySelectorAll('.tasks-list li').forEach(li => li.remove());
}

// 🔒 Gestión de datos
// --------------------------------------------------------------------------
// Recupera las tareas almacenadas en localStorage y las asigna al objeto `tasks`.
function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// 🔒 Gestión de datos
// --------------------------------------------------------------------------
// Almacena el estado actual de las tareas en localStorage.
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 📅 Inicialización del calendario
// --------------------------------------------------------------------------
// Configura e inicializa el calendario de FullCalendar con sus opciones.
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('No se encontró el elemento del calendario');
        return;
    }

    try {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            height: 'auto',
            firstDay: 1,
            locale: document.documentElement.lang || 'es',
            buttonText: {
                today: translations[document.documentElement.lang || 'es']['calendar.today'],
                month: translations[document.documentElement.lang || 'es']['calendar.month']
            },
            dayHeaderFormat: { weekday: 'long' },
            eventClick: function(info) {
                showTaskDetails(info.event);
            },
            eventClassNames: function(arg) {
                return [`task-${arg.event.extendedProps.state}`];
            },
            eventDidMount: function(info) {
                info.el.title = `
                    ${info.event.title}
                    Inicio: ${new Date(info.event.start).toLocaleDateString()}
                    Entrega: ${new Date(info.event.end).toLocaleDateString()}
                    Estado: ${getStateLabel(info.event.extendedProps.state)}
                `;
            }
        });

        calendar.render();
        console.log('Calendario inicializado correctamente');
        updateCalendarEvents();
    } catch (error) {
        console.error('Error al inicializar el calendario:', error);
    }
}

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Muestra los detalles de una tarea al hacer clic en un evento del calendario.
function showTaskDetails(event) {
    const task = event.extendedProps;
    alert(`
        Tarea: ${task.text}
        Estado: ${getStateLabel(task.state)}
        Fecha inicio: ${new Date(task.startDate).toLocaleDateString()}
        Fecha entrega: ${new Date(task.endDate).toLocaleDateString()}
    `);
}

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Devuelve la etiqueta traducida del estado de la tarea.
function getStateLabel(state) {
    const labels = {
        'pending': 'Pendiente',
        'in_progress': 'En Ejecución',
        'completed': 'Realizada'
    };
    return labels[state] || state;
}

// 📅 Sincronización del calendario
// --------------------------------------------------------------------------
// Actualiza los eventos del calendario con las tareas actuales.
function updateCalendarEvents() {
    if (!calendar) {
        console.error('El calendario no está inicializado');
        return;
    }

    try {
        calendar.removeAllEvents();

        Object.entries(tasks).forEach(([state, taskList]) => {
            taskList.forEach(task => {
                const eventEnd = new Date(task.endDate);
                eventEnd.setDate(eventEnd.getDate() + 1);

                calendar.addEvent({
                    title: task.text,
                    start: task.startDate,
                    end: eventEnd.toISOString().split('T')[0],
                    allDay: true,
                    extendedProps: {
                        id: task.id,
                        text: task.text,
                        state: state,
                        startDate: task.startDate,
                        endDate: task.endDate
                    }
                });
            });
        });

        calendar.render();
        console.log('Eventos del calendario actualizados');
    } catch (error) {
        console.error('Error al actualizar eventos del calendario:', error);
    }
}

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Maneja la creación de nuevas tareas a través del formulario.
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskInput = document.getElementById('task');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const stateSelect = document.getElementById('state');
    
    const taskText = taskInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const taskState = stateSelect.value;
    
    if (taskText && startDate && endDate) {
        if (endDate < startDate) {
            alert('La fecha de entrega no puede ser anterior a la fecha de inicio');
            return;
        }

        addTask(taskText, taskState, startDate, endDate);
        taskInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        stateSelect.value = 'pending';
        taskInput.focus();
    }
});

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Añade una nueva tarea al sistema.
function addTask(text, state, startDate, endDate) {
    const task = {
        id: Date.now().toString(),
        text: text,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date().toISOString()
    };
    
    tasks[state].push(task);
    saveTasksToStorage();
    renderAllTasks();
    updateCalendarEvents();
}

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Renderiza todas las listas de tareas en la interfaz.
function renderAllTasks() {
    renderTaskList('pending', 'pendingTasks');
    renderTaskList('in_progress', 'inProgressTasks');
    renderTaskList('completed', 'completedTasks');
}

// 📝 Gestión de tareas
// --------------------------------------------------------------------------
// Renderiza una lista específica de tareas.
function renderTaskList(state, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    tasks[state].forEach(task => {
        const li = document.createElement('li');
        li.dataset.taskId = task.id;
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        
        const taskDates = document.createElement('small');
        taskDates.innerHTML = `
            <br>Inicio: ${new Date(task.startDate).toLocaleDateString()}
            <br>Entrega: ${new Date(task.endDate).toLocaleDateString()}
        `;
        taskDates.style.color = '#666';
        
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskDates);
        li.appendChild(taskContent);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';
        
        // Añadir botones según el estado
        switch(state) {
            case 'pending':
                addButton(buttonsDiv, 'arrow-right', 'Mover a en ejecución', () => moveTask(task.id, 'pending', 'in_progress'));
                break;
            case 'in_progress':
                addButton(buttonsDiv, 'check', 'Mover a completadas', () => moveTask(task.id, 'in_progress', 'completed'));
                addButton(buttonsDiv, 'arrow-left', 'Mover a pendientes', () => moveTask(task.id, 'in_progress', 'pending'));
                break;
            case 'completed':
                addButton(buttonsDiv, 'arrow-left', 'Mover a en ejecución', () => moveTask(task.id, 'completed', 'in_progress'));
                break;
        }
        
        // Añadir botón de eliminar para todos los estados
        addButton(buttonsDiv, 'trash', 'Eliminar tarea', () => deleteTask(task.id, state));
        
        li.appendChild(buttonsDiv);
        container.appendChild(li);
    });
}

// 🛠️ Funciones auxiliares
// --------------------------------------------------------------------------
// Crea un botón con icono y maneja su evento de clic.
function addButton(container, icon, title, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = title;
    button.innerHTML = `<i class="fas fa-${icon}"></i>`;
    button.addEventListener('click', onClick);
    container.appendChild(button);
}

// 🔄 Gestión de estados
// --------------------------------------------------------------------------
// Mueve una tarea entre diferentes estados.
function moveTask(taskId, fromState, toState) {
    const taskIndex = tasks[fromState].findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        const task = tasks[fromState].splice(taskIndex, 1)[0];
        tasks[toState].push(task);
        saveTasksToStorage();
        renderAllTasks();
        updateCalendarEvents();
    }
}

// 🗑️ Gestión de tareas
// --------------------------------------------------------------------------
// Elimina una tarea del sistema.
function deleteTask(taskId, state) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        const taskIndex = tasks[state].findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[state].splice(taskIndex, 1);
            saveTasksToStorage();
            renderAllTasks();
            updateCalendarEvents();
        }
    }
}