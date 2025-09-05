const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Conexión a MongoDB Atlas ======
mongoose.connect("mongodb+srv://<USUARIO>:<PASSWORD>@<CLUSTER>.mongodb.net/encuestaDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB Atlas"))
.catch(err => console.error("❌ Error de conexión:", err));

// ====== Definir esquema ======
const RespuestaSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    edad: Number,
    opinion: String,
    juegos: [String],
    fecha: { type: Date, default: Date.now }
});
const Respuesta = mongoose.model("Respuesta", RespuestaSchema);

// ====== Middlewares ======
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== Ruta para guardar respuestas ======
app.post("/api/registro", async (req, res) => {
    try {
        const nuevaRespuesta = new Respuesta(req.body);
        await nuevaRespuesta.save();
        res.json({ ok: true, msg: "Guardado en la base de datos" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: "Error en el servidor" });
    }
});

// ====== Ruta admin para ver todas las respuestas ======
app.get("/admin", async (req, res) => {
    try {
        const respuestas = await Respuesta.find().sort({ fecha: -1 });
        res.send(`
            <h1>📊 Panel de Administración</h1>
            <ul>
                ${respuestas.map(r => `<li>
                    <b>${r.nombre} ${r.apellido}</b> (${r.edad} años)<br>
                    Opinión: ${r.opinion}<br>
                    Juegos: ${r.juegos.join(", ")}<br>
                    Fecha: ${r.fecha.toLocaleString()}
                </li><hr>`).join("")}
            </ul>
        `);
    } catch (err) {
        res.status(500).send("Error al cargar respuestas");
    }
});

// ====== Iniciar servidor ======
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
