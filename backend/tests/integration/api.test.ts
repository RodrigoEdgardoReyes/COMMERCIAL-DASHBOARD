import request from 'supertest';
import express from 'express';

// Creamos una app Express aislada para probar la integración HTTP
const app = express();
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Test de integración básico para verificar que el endpoint /health funciona correctamente.
describe('Integración básica del API', () => {
  it('GET /health debe devolver 200 y status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});