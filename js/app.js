// Datos de ejemplo. En esta actividad no usamos una base de datos.
const partidosIniciales = [
  { id: 1, deporte: "Fútbol", ubicacion: "Complejo Unión La Calera", fecha: "2026-09-07", hora: "20:00", nivel: "Amateur", cupos: 1 },
  { id: 2, deporte: "Fútbol", ubicacion: "Canchas San Luis de Quillota", fecha: "2026-09-08", hora: "18:30", nivel: "Intermedio", cupos: 2 },
  { id: 3, deporte: "Pádel", ubicacion: "Pádel Club Centro", fecha: "2026-09-07", hora: "19:00", nivel: "Amateur", cupos: 1 },
  { id: 4, deporte: "Básquetbol", ubicacion: "Gimnasio Municipal", fecha: "2026-09-09", hora: "17:30", nivel: "Amateur", cupos: 1 }
];

let partidos = [...partidosIniciales];
let filtroActual = "Todos";
let textoBusqueda = "";
let misPartidos = [];

const listaPartidos = document.querySelector("#listaPartidos");
const listaMisPartidos = document.querySelector("#misPartidosLista");
const formCrearPartido = document.querySelector("#formCrearPartido");
const modalCrearPartido = document.querySelector("#modalCrearPartido");

// Estas clases cambian el color de la tarjeta según el deporte.
const letrasDeporte = { Fútbol: "F", Básquetbol: "B", Pádel: "P" };
const clasesDeporte = { Fútbol: "sport-futbol", Básquetbol: "sport-basquetbol", Pádel: "sport-padel" };

function escaparHTML(texto) {
  return String(texto).replace(/[&<>'"]/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[caracter]));
}

function formatearFecha(fecha) {
  const partes = fecha.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerPartidosFiltrados() {
  return partidos.filter((partido) => {
    const coincideDeporte = filtroActual === "Todos" || partido.deporte === filtroActual;
    const contenido = `${partido.deporte} ${partido.ubicacion} ${partido.nivel}`.toLowerCase();
    return coincideDeporte && contenido.includes(textoBusqueda.toLowerCase());
  });
}

function mostrarPartidos() {
  const resultados = obtenerPartidosFiltrados();
  if (resultados.length === 0) {
    listaPartidos.innerHTML = '<div class="col-12"><div class="empty-state"><p class="mb-1 fw-bold">No encontramos partidos</p><p class="small mb-0">Prueba con otro deporte o ubicación.</p></div></div>';
    return;
  }
  listaPartidos.innerHTML = resultados.map((partido) => {
    const inscrito = misPartidos.includes(partido.id);
    const lleno = partido.cupos === 0;
    return `<div class="col-12 col-md-6">
      <article class="match-card card">
        <div class="card-body p-4 d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="sport-icon ${clasesDeporte[partido.deporte]}" aria-hidden="true">${letrasDeporte[partido.deporte]}</div>
            <span class="badge level-badge rounded-pill">${escaparHTML(partido.nivel)}</span>
          </div>
          <h3 class="h5 fw-bold mb-3">${escaparHTML(partido.deporte)}</h3>
          <p class="match-location mb-2">Lugar: ${escaparHTML(partido.ubicacion)}</p>
          <p class="match-meta mb-1">Fecha: ${formatearFecha(partido.fecha)} - ${escaparHTML(partido.hora)} hrs</p>
          <p class="slots mb-4">${lleno ? "Partido completo" : `Falta${partido.cupos === 1 ? " " : "n "}${partido.cupos} jugador${partido.cupos === 1 ? "" : "es"}`}</p>
          <button class="btn ${inscrito ? "btn-success" : "btn-primary"} w-100 rounded-pill mt-auto" data-action="${inscrito ? "cancelar" : "unirse"}" data-id="${partido.id}" ${lleno && !inscrito ? "disabled" : ""}>
            ${inscrito ? "Inscrito - Dar de baja" : lleno ? "Sin cupos" : "Yo apaño"}
          </button>
        </div>
      </article>
    </div>`;
  }).join("");
}

function mostrarMisPartidos() {
  const cantidad = misPartidos.length;
  document.querySelector("#misPartidosCount").textContent = `${cantidad} ${cantidad === 1 ? "inscrito" : "inscritos"}`;
  document.querySelector("#misPartidosBadge").textContent = cantidad;
  if (cantidad === 0) {
    listaMisPartidos.innerHTML = '<div class="empty-state py-4"><p class="small mb-0">Aún no te has inscrito.</p></div>';
    return;
  }
  listaMisPartidos.innerHTML = misPartidos.map((id) => {
    const partido = partidos.find((item) => item.id === id);
    if (!partido) return "";
    return `<div class="my-match-item">
      <div class="d-flex justify-content-between gap-2"><strong class="small">${letrasDeporte[partido.deporte]} - ${escaparHTML(partido.deporte)}</strong><span class="badge text-bg-success rounded-pill">Confirmado</span></div>
      <p class="small text-secondary mb-0 mt-1">${escaparHTML(partido.ubicacion)} - ${formatearFecha(partido.fecha)}</p>
      <button class="btn btn-link btn-sm text-danger p-0 mt-2" data-action="cancelar" data-id="${partido.id}">Dar de baja</button>
    </div>`;
  }).join("");
}

function mostrarAlerta(mensaje, tipo = "success") {
  document.querySelector("#alertas").innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button></div>`;
}

function actualizarInterfaz() {
  mostrarPartidos();
  mostrarMisPartidos();
  activarBotonesDeAccion();
}

function activarBotonesDeAccion() {
  const botones = document.querySelectorAll("[data-action]");
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      if (boton.dataset.action === "unirse") unirseAPartido(id);
      if (boton.dataset.action === "cancelar") cancelarPartido(id);
    });
  });
}

function unirseAPartido(id) {
  const partido = partidos.find((item) => item.id === id);
  if (!partido || partido.cupos === 0 || misPartidos.includes(id)) return;
  partido.cupos -= 1;
  misPartidos.push(id);
  actualizarInterfaz();
  mostrarAlerta(`Te has unido al partido de ${escaparHTML(partido.deporte)} en ${escaparHTML(partido.ubicacion)}. Nos vemos en la cancha.`);
}

function cancelarPartido(id) {
  const partido = partidos.find((item) => item.id === id);
  if (!partido || !misPartidos.includes(id)) return;
  partido.cupos += 1;
  misPartidos = misPartidos.filter((partidoId) => partidoId !== id);
  actualizarInterfaz();
  mostrarAlerta("Tu inscripción fue cancelada y el cupo quedó disponible.", "warning");
}

// Eventos de los filtros y del buscador.
document.querySelectorAll(".filter-pill").forEach((boton) => boton.addEventListener("click", () => {
  filtroActual = boton.dataset.filter;
  document.querySelectorAll(".filter-pill").forEach((item) => item.classList.toggle("active", item === boton));
  actualizarInterfaz();
}));

document.querySelector("#buscarPartidos").addEventListener("input", (event) => {
  textoBusqueda = event.target.value.trim();
  actualizarInterfaz();
});

// Validación y publicación del formulario.
formCrearPartido.addEventListener("submit", (event) => {
  event.preventDefault();
  formCrearPartido.classList.add("was-validated");
  const fecha = document.querySelector("#fecha").value;
  const fechaValida = fecha && new Date(`${fecha}T12:00:00`) >= new Date(new Date().toDateString());
  document.querySelector("#fecha").setCustomValidity(fechaValida ? "" : "La fecha debe ser hoy o posterior.");
  if (!formCrearPartido.checkValidity()) {
    document.querySelector("#errorFormulario").classList.remove("d-none");
    return;
  }
  const nuevoPartido = {
    id: Date.now(),
    deporte: document.querySelector("#deporte").value,
    nivel: document.querySelector("#nivel").value,
    fecha,
    hora: document.querySelector("#hora").value,
    ubicacion: document.querySelector("#ubicacion").value.trim(),
    cupos: Number(document.querySelector("#cupos").value)
  };
  partidos.unshift(nuevoPartido);
  actualizarInterfaz();
  formCrearPartido.reset();
  formCrearPartido.classList.remove("was-validated");
  document.querySelector("#errorFormulario").classList.add("d-none");
  bootstrap.Modal.getOrCreateInstance(modalCrearPartido).hide();
  mostrarAlerta("Partido publicado. Ya aparece en la lista de partidos disponibles.");
  document.querySelector("#partidos").scrollIntoView();
});

modalCrearPartido.addEventListener("hidden.bs.modal", () => {
  formCrearPartido.classList.remove("was-validated");
  document.querySelector("#errorFormulario").classList.add("d-none");
  formCrearPartido.reset();
});

actualizarInterfaz();
