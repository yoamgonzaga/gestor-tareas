#!/usr/bin/env node
// gestor-tareas.js
// Uso: node gestor-tareas.js <comando> [opciones]
// Comandos: add "texto", list [all|pending|done], done <id>, del <id>

const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname, "tareas.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch (e) {
    return [];
  }
}
function save(tareas) {
  fs.writeFileSync(DB, JSON.stringify(tareas, null, 2), "utf8");
}

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
  console.log(
    'Comandos: add "texto", list [all|pending|done], done <id>, del <id>'
  );
  process.exit(0);
}

let tareas = load();

function nextId(arr) {
  return arr.length ? Math.max(...arr.map((t) => t.id)) + 1 : 1;
}

switch (cmd) {
  case "add": {
    const texto = args[1] || "";
    if (!texto) {
      console.error('Uso: add "texto de la tarea"');
      process.exit(1);
    }
    const tarea = {
      id: nextId(tareas),
      texto: texto.replace(/^"|"$/g, ""),
      creada: new Date().toISOString(),
      completada: false,
      prioridad: "media",
    };
    tareas.push(tarea);
    save(tareas);
    console.log(`Tarea añadida (id: ${tarea.id}): ${tarea.texto}`);
    break;
  }
  case "list": {
    const filtro = args[1] || "all";
    let mostradas = tareas;
    if (filtro === "pending") mostradas = tareas.filter((t) => !t.completada);
    if (filtro === "done") mostradas = tareas.filter((t) => t.completada);
    if (!mostradas.length) {
      console.log("No hay tareas.");
    } else {
      mostradas.forEach((t) => {
        console.log(
          `#${t.id} [${t.completada ? "x" : " "}] ${t.texto} (${
            t.prioridad
          }) - ${t.creada}`
        );
      });
    }
    break;
  }
  case "done": {
    const id = Number(args[1]);
    if (!id) {
      console.error("Uso: done <id>");
      process.exit(1);
    }
    const t = tareas.find((x) => x.id === id);
    if (!t) {
      console.error("Id no encontrado.");
      process.exit(1);
    }
    t.completada = true;
    t.completadaEn = new Date().toISOString();
    save(tareas);
    console.log(`Tarea #${id} marcada como completada.`);
    break;
  }
  case "del": {
    const id = Number(args[1]);
    if (!id) {
      console.error("Uso: del <id>");
      process.exit(1);
    }
    const before = tareas.length;
    tareas = tareas.filter((x) => x.id !== id);
    if (tareas.length === before) {
      console.error("Id no encontrado.");
      process.exit(1);
    }
    save(tareas);
    console.log(`Tarea #${id} eliminada.`);
    break;
  }
  default:
    console.log("Comando no reconocido. Comandos: add, list, done, del");
}
