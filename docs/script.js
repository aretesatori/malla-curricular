// Función para cargar el JSON y crear la malla
async function loadCurriculum() {
    try {
        const response = await fetch('./carreras/ing-civil-electronica.json');
        if (!response.ok) {
            throw new Error(`Error al cargar los datos: ${response.status}`);
        }
        const curriculumData = await response.json();
        createCurriculum(curriculumData);
        calculateTotalCredits(curriculumData);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('curriculumContainer').innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e53e3e;">
                        <h3>Error al cargar los datos de la malla curricular</h3>
                        <p>${error.message}</p>
                        <p>Verifique que el archivo malla.json exista y sea válido.</p>
                    </div>
                `;
    }
}

// Variables para control de selección
let selectedSubject = null;
let lastHighlightedSubjects = [];

// Función para crear la malla curricular
function createCurriculum(curriculumData) {
    const container = document.getElementById('curriculumContainer');
    container.innerHTML = '';

    curriculumData.semestres.forEach(semestre => {
        const semesterDiv = document.createElement('div');
        semesterDiv.className = 'semester';

        const header = document.createElement('div');
        header.className = 'semester-header';
        header.textContent = `Semestre ${semestre.numero}`;

        semesterDiv.appendChild(header);

        semestre.asignaturas.forEach(asignatura => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'subject';
            subjectDiv.dataset.code = asignatura.codigo;
            subjectDiv.dataset.requisites = asignatura.requisitos.join(',');
            subjectDiv.dataset.creditos = asignatura.creditos;

            // Agregar clase según categoría
            if (asignatura.categoria) {
                subjectDiv.classList.add(asignatura.categoria.toLowerCase());
            }

            const codeDiv = document.createElement('div');
            codeDiv.className = 'subject-code';
            codeDiv.innerHTML = `${asignatura.codigo}`;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'subject-name';
            nameDiv.innerHTML = `${asignatura.nombre} <p class="subject-credits">SCT: ${asignatura.creditos}</p>`

            subjectDiv.appendChild(codeDiv);
            subjectDiv.appendChild(nameDiv);

            // Eventos para hover
            subjectDiv.addEventListener('mouseenter', handleSubjectHover);
            subjectDiv.addEventListener('mouseleave', resetHover);

            // Evento para clic
            subjectDiv.addEventListener('click', handleSubjectClick);

            semesterDiv.appendChild(subjectDiv);
        });

        container.appendChild(semesterDiv);
    });
}

// Manejador para el hover sobre una asignatura
function handleSubjectHover(event) {
    // Si ya hay una selección, no hacer nada con el hover
    if (selectedSubject) return;

    const subject = event.currentTarget;
    highlightSubject(subject);
}

// Función para resaltar una asignatura y sus relaciones
function highlightSubject(subject) {
    const code = subject.dataset.code;
    const requisites = subject.dataset.requisites ? subject.dataset.requisites.split(',') : [];

    // Resetear cualquier resaltado previo
    resetHover();

    // Resaltar la asignatura actual
    subject.classList.add('current');
    lastHighlightedSubjects.push(subject);

    // Resaltar requisitos directos
    requisites.forEach(req => {
        const requisiteElement = document.querySelector(`.subject[data-code="${req}"]`);
        if (requisiteElement) {
            requisiteElement.classList.add('highlighted');
            lastHighlightedSubjects.push(requisiteElement);
        }
    });

    // Resaltar asignaturas que tienen esta como requisito (prerequisito)
    const allSubjects = document.querySelectorAll('.subject');
    allSubjects.forEach(sub => {
        const subRequisites = sub.dataset.requisites ? sub.dataset.requisites.split(',') : [];

        // Verificar si esta asignatura es requisito de otra
        if (subRequisites.includes(code)) {
            sub.classList.add('requisite-for');
            lastHighlightedSubjects.push(sub);
        }

        // Verificar si esta asignatura tiene a la actual como requisito
        if (requisites.includes(sub.dataset.code)) {
            sub.classList.add('requisite');
            lastHighlightedSubjects.push(sub);
        }
    });
}

// Manejador para el clic en una asignatura
function handleSubjectClick(event) {
    event.stopPropagation(); // Prevenir propagación al documento

    const subject = event.currentTarget;

    // Si ya está seleccionada, deseleccionar
    if (selectedSubject === subject) {
        resetSelection();
        return;
    }

    // Resetear cualquier selección previa
    resetSelection();

    // Establecer nueva selección
    selectedSubject = subject;
    highlightSubject(subject);
}

// Función para resetear el hover (no afecta a la selección)
function resetHover() {
    // Solo resetear si no hay selección activa
    if (!selectedSubject) {
        lastHighlightedSubjects.forEach(subject => {
            subject.classList.remove('current', 'highlighted', 'requisite', 'requisite-for');
        });
        lastHighlightedSubjects = [];
    }
}

// Función para resetear la selección
function resetSelection() {
    lastHighlightedSubjects.forEach(subject => {
        subject.classList.remove('current', 'highlighted', 'requisite', 'requisite-for');
    });
    lastHighlightedSubjects = [];
    selectedSubject = null;
}

// Evento para resetear al hacer clic fuera de la malla
document.addEventListener('click', function (event) {
    if (!event.target.closest('.subject')) {
        resetSelection();
    }
});

// Función para calcular créditos totales
function calculateTotalCredits(curriculumData) {
    let total = 0;

    curriculumData.semestres.forEach(semestre => {
        semestre.asignaturas.forEach(asignatura => {
            const creditos = parseInt(asignatura.creditos) || 0;
            total += creditos;
        })
    });

    document.getElementById('totalCredits').innerHTML = `
        <div class="total-credits">
            <strong>Total de Créditos SCT:</strong> ${total}
        </div>
    `;
}

// Inicializar la malla al cargar la página
document.addEventListener('DOMContentLoaded', loadCurriculum);

