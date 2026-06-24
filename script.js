// --- Datos de ejemplo (todo inventado, sin datos reales de pacientes) ---

const pautas = [
  {
    id: 1,
    titulo: "Pauta 24 de junio",
    estado: "Activa",
    clickable: true,
    tips: [
      "Descansa 30s entre series",
      "Si sientes dolor agudo, detén el ejercicio y avísanos",
    ],
    ejercicios: [
      { nombre: "Retracción cervical (chin tuck)", reps: "10 x 3", descanso: "20s descanso" },
      { nombre: "Báscula pélvica", reps: "12 x 3", descanso: "30s descanso" },
      { nombre: "Puente de glúteos", reps: "12 x 3", descanso: "30s descanso" },
      { nombre: "Bird-dog", reps: "8 x 3", descanso: "30s descanso" },
    ],
  },
  {
    id: 2,
    titulo: "Pauta 10 de junio",
    estado: "Completada",
    clickable: false,
    tips: [],
    ejercicios: [],
  },
];

let reservas = [
  { id: 1, dia: "Lunes 29 de junio", hora: "10:00", fisio: "Dra. Marta Soler", centro: "Clínica Fisio Manresa", estado: "confirmada" },
  { id: 2, dia: "Jueves 9 de julio", hora: "17:30", fisio: "Dra. Marta Soler", centro: "Clínica Fisio Manresa", estado: "confirmada" },
];

let nextReservaId = 3;

// --- Navegación entre vistas ---

const tabbar = document.getElementById("tabbar");
const topbar = document.getElementById("topbar");
const backBtn = document.getElementById("backBtn");
const brand = document.getElementById("brand");
const screenTitle = document.getElementById("screenTitle");

const DETAIL_VIEWS = new Set(["pauta-detail", "reserva-nueva"]);

function showView(viewId, opts = {}) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const target = document.getElementById("view-" + viewId);
  target.classList.add("active");

  const isDetail = DETAIL_VIEWS.has(viewId);
  tabbar.classList.toggle("hidden", isDetail);
  backBtn.style.display = isDetail ? "flex" : "none";
  brand.style.display = isDetail ? "none" : "flex";
  screenTitle.style.display = isDetail ? "block" : "none";
  screenTitle.textContent = isDetail ? target.dataset.title : "";

  if (!isDetail) {
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === viewId);
    });
  }

  if (opts.onBack) backBtn.onclick = opts.onBack;
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

// --- Pautas ---

const pautasList = document.getElementById("pautasList");

function renderPautas() {
  pautasList.innerHTML = "";
  pautas.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pauta-card" + (p.clickable ? "" : " disabled");
    card.innerHTML = `
      <div class="pauta-info">
        <span class="pauta-titulo">${p.titulo}</span>
        <span class="pauta-meta">${p.ejercicios.length ? p.ejercicios.length + " ejercicios" : "Sesión finalizada"}</span>
      </div>
      <div class="pauta-right">
        <span class="badge ${p.estado === "Activa" ? "badge-activa" : "badge-completada"}">${p.estado}</span>
        ${p.clickable ? '<span class="chevron">&#8250;</span>' : ""}
      </div>
    `;
    if (p.clickable) {
      card.addEventListener("click", () => openPautaDetail(p));
    }
    pautasList.appendChild(card);
  });
}

function openPautaDetail(pauta) {
  document.getElementById("pautaDetailTitle").textContent = pauta.titulo;

  const tipsEl = document.getElementById("pautaTips");
  tipsEl.innerHTML = pauta.tips
    .map((t) => `<div class="tip-row"><span class="tip-dot">&#9679;</span><span>${t}</span></div>`)
    .join("");

  const list = document.getElementById("ejerciciosList");
  list.innerHTML = pauta.ejercicios
    .map(
      (e) => `
      <div class="exercise-card">
        <div class="exercise-media">&#128247;</div>
        <div class="exercise-body">
          <p class="exercise-title">${e.nombre}</p>
          <div class="exercise-stats">
            <span><b>${e.reps}</b> reps x series</span>
            <span>${e.descanso}</span>
          </div>
        </div>
      </div>`
    )
    .join("");

  showView("pauta-detail", { onBack: () => showView("pautas-list") });
}

// --- Reservas ---

const reservasList = document.getElementById("reservasList");

function renderReservas() {
  reservasList.innerHTML = "";
  reservas.forEach((r) => {
    const card = document.createElement("div");
    card.className = "reserva-card" + (r.estado === "cancelada" ? " cancelada" : "");
    card.innerHTML = `
      <div class="reserva-info">
        <span class="reserva-fecha">${r.dia} · ${r.hora}</span>
        <span class="reserva-meta">${r.fisio}</span>
        <span class="reserva-meta">${r.centro}</span>
        ${r.estado === "cancelada" ? '<span class="badge badge-completada" style="margin-top:4px; width:fit-content;">Cancelada</span>' : ""}
      </div>
      ${r.estado !== "cancelada" ? '<button class="menu-btn" aria-label="Opciones">&#8942;</button>' : ""}
    `;
    if (r.estado !== "cancelada") {
      card.querySelector(".menu-btn").addEventListener("click", () => openReservaModal(r));
    }
    reservasList.appendChild(card);
  });
}

document.getElementById("btnNuevaReserva").addEventListener("click", () => {
  reprogramandoId = null;
  resetFlow();
  showView("reserva-nueva", { onBack: () => showView("reservas-list") });
});

// --- Modal cancelar / reprogramar ---

const modalOverlay = document.getElementById("modalOverlay");
let modalReservaId = null;
let reprogramandoId = null;

function openReservaModal(r) {
  modalReservaId = r.id;
  document.getElementById("modalTitle").textContent = `${r.dia} · ${r.hora}`;
  modalOverlay.classList.add("active");
}

document.getElementById("modalCerrar").addEventListener("click", () => {
  modalOverlay.classList.remove("active");
});

document.getElementById("modalCancelar").addEventListener("click", () => {
  const r = reservas.find((x) => x.id === modalReservaId);
  if (r) r.estado = "cancelada";
  modalOverlay.classList.remove("active");
  renderReservas();
});

document.getElementById("modalReprogramar").addEventListener("click", () => {
  reprogramandoId = modalReservaId;
  modalOverlay.classList.remove("active");
  resetFlow();
  showView("reserva-nueva", { onBack: () => showView("reservas-list") });
});

// --- Flujo nueva reserva / reprogramar ---

const fechas = (() => {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(`${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`);
  }
  return out;
})();

const horas = ["09:00", "10:00", "11:30", "13:00", "16:00", "17:30"];

let flowFecha = null;
let flowHora = null;

function resetFlow() {
  flowFecha = null;
  flowHora = null;
  document.getElementById("step-fecha").classList.remove("hidden");
  document.getElementById("step-hora").classList.add("hidden");
  document.getElementById("step-confirmacion").classList.add("hidden");
  document.getElementById("btnFechaSiguiente").disabled = true;
  document.getElementById("btnConfirmarReserva").disabled = true;
  renderChips("fechaChips", fechas, (v) => { flowFecha = v; document.getElementById("btnFechaSiguiente").disabled = false; });
  renderChips("horaChips", horas, (v) => { flowHora = v; document.getElementById("btnConfirmarReserva").disabled = false; });
}

function renderChips(containerId, items, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((item) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = item;
    chip.addEventListener("click", () => {
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      onSelect(item);
    });
    container.appendChild(chip);
  });
}

document.getElementById("btnFechaSiguiente").addEventListener("click", () => {
  document.getElementById("step-fecha").classList.add("hidden");
  document.getElementById("step-hora").classList.remove("hidden");
});

document.getElementById("btnConfirmarReserva").addEventListener("click", () => {
  if (reprogramandoId) {
    const r = reservas.find((x) => x.id === reprogramandoId);
    if (r) { r.dia = flowFecha; r.hora = flowHora; }
  } else {
    reservas.push({
      id: nextReservaId++,
      dia: flowFecha,
      hora: flowHora,
      fisio: "Dra. Marta Soler",
      centro: "Clínica Fisio Manresa",
      estado: "confirmada",
    });
  }
  renderReservas();

  document.getElementById("confirmDetail").textContent = `${flowFecha} a las ${flowHora}, con Dra. Marta Soler en Clínica Fisio Manresa.`;
  document.getElementById("step-hora").classList.add("hidden");
  document.getElementById("step-confirmacion").classList.remove("hidden");
});

document.getElementById("btnVolverCitas").addEventListener("click", () => {
  showView("reservas-list");
});

// --- Init ---

renderPautas();
renderReservas();
showView("pautas-list");
