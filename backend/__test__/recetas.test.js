const request = require("supertest");
const express = require("express");
const { MongoClient } = require("mongodb");
const app = require("../path/to/your/app"); // Reemplaza con la ruta de tu archivo principal

// Mock de MongoDB URI para evitar que se conecte a producción
const mockUri = "mongodb://localhost:27017/testDB";

let server;
let db;
let collection;

beforeAll(async () => {
  const client = new MongoClient(mockUri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db("testDB");
  collection = db.collection("recetas");

  // Configura el servidor para pruebas
  app.locals.db = db; // Pasar db al app para que use el mock
  server = app.listen(3000); // Puerto para pruebas
});

afterAll(async () => {
  await db.dropDatabase(); // Limpia la base de datos después de pruebas
  await db.client.close();
  server.close();
});

describe("API de recetas", () => {
  test("GET /recetas devuelve todas las recetas", async () => {
    await collection.insertOne({ titulo: "Receta 1", ingredientes: ["Ingrediente 1"], proceso: "Proceso 1" });

    const res = await request(app).get("/recetas");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("titulo", "Receta 1");
  });

  test("POST /recetas agrega una nueva receta", async () => {
    const nuevaReceta = { titulo: "Receta 2", ingredientes: ["Ingrediente 2"], proceso: "Proceso 2" };

    const res = await request(app).post("/recetas").send(nuevaReceta);
    expect(res.statusCode).toBe(200);
    expect(res.body.insertedId).toBeDefined();

    const recetaEnDB = await collection.findOne({ _id: res.body.insertedId });
    expect(recetaEnDB).toHaveProperty("titulo", "Receta 2");
  });

  test("DELETE /recetas/:id elimina una receta existente", async () => {
    const receta = await collection.insertOne({ titulo: "Receta a eliminar", ingredientes: [], proceso: "" });

    const res = await request(app).delete(`/recetas/${receta.insertedId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Receta eliminada correctamente");

    const recetaEliminada = await collection.findOne({ _id: receta.insertedId });
    expect(recetaEliminada).toBeNull();
  });

  test("DELETE /recetas/:id devuelve 404 si la receta no existe", async () => {
    const nonExistentId = "64e95b4d3f9e3b00f8c3d123";

    const res = await request(app).delete(`/recetas/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Receta no encontrada");
  });
});
