const express = require("express");
const { MongoClient, ObjectId } = require("mongodb"); // Asegúrate de importar ObjectId
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// URI de conexión a MongoDB
const uri = 'mongodb+srv://recetasadmin:Wuha09686qlevx826@mongo-recetas.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");

        const database = client.db('recetasDB');
        const collection = database.collection('recetas');

        // Obtener todas las recetas
        app.get("/recetas", async (req, res) => {
            try {
                const recetas = await collection.find().toArray();
                res.json(recetas);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Agregar una nueva receta
        app.post("/recetas", async (req, res) => {
            const { titulo, ingredientes, proceso } = req.body;
            const nuevaReceta = { titulo, ingredientes, proceso };

            try {
                const result = await collection.insertOne(nuevaReceta);
                res.status(200).json(result);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Eliminar una receta por su ID
         // Endpoint para eliminar una receta por ID
         app.delete("/recetas/:id", async (req, res) => {
            const recetaId = req.params.id; // ID enviado en la URL
      
            try {
              // Convierte el ID a ObjectId
              const result = await collection.deleteOne({ _id: new ObjectId(recetaId) });
      
              if (result.deletedCount === 0) {
                return res.status(404).json({ message: "Receta no encontrada" });
              }
      
              res.status(200).json({ message: "Receta eliminada correctamente" });
            } catch (error) {
              res.status(500).json({ message: "Error al eliminar la receta", error: error.message });
            }
          });


        // Servir el archivo HTML en la raíz
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(port, () => {
            console.log(`Servidor ejecutándose en http://localhost:${port}`);
        });
    } catch (err) {
        console.log("Error al conectar a MongoDB", err);
    }
}

run().catch(console.dir);
