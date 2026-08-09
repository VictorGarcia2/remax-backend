import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
let cachedSitemap = '';

// Middlewares
app.use(cors());
app.use(express.json());

// Función para generar el sitemap
async function updateSitemap() {
  try {
   
    
    // Obtener todas las propiedades desde la API
    const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
      headers: {
        Authorization: 'Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t',
        Accept: 'application/json'
      }
    });
    
    const propiedades = response.data.data.rows;
  

    // Crear el encabezado del sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Páginas Principales -->
  <url>
    <loc>https://remaxcin.mx/</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/inicio</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/propiedades</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/NuestroEquipo</loc>
    <priority>0.7</priority>
  </url>
  
  <!-- Páginas Legales -->
  <url>
    <loc>https://remaxcin.mx/Polizas-de-renta</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/terminos-y-condiciones</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/codigo-de-etica</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/politica-de-privacidad</loc>
    <priority>0.5</priority>
  </url>

  <!-- Propiedades Dinámicas -->`;

    // Agregar cada propiedad al sitemap
    propiedades.forEach(propiedad => {
      sitemap += `
  <url>
    <loc>https://remaxcin.mx/propiedades/seleccion/${propiedad.propiedad_id}</loc>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Cerrar el sitemap
    sitemap += `
</urlset>`;

    cachedSitemap = sitemap;

    // Guardar el sitemap en el directorio público si existe la carpeta
    try {
      const sitemapPath = path.join(__dirname, '../frontend/public/sitemap.xml');
      const dir = path.dirname(sitemapPath);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(sitemapPath, sitemap);
        console.log('✅ Sitemap local actualizado con éxito');
      }
    } catch (e) {
      // Ignorar de forma segura si no existe el directorio frontend en producción
    }
 
    return true;
  } catch (error) {
    console.error('Error al actualizar el sitemap:', error);
    return false;
  }
}

// Ruta de API para propiedades
app.get('/api/propiedades', async (req, res) => {
  try {
    const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
      headers: {
        Authorization: 'Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t',
        Accept: 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener propiedades:', error.message);
    res.status(500).json({ error: 'Error al obtener propiedades', message: error.message });
  }
});

// Ruta para actualizar el sitemap manualmente
app.get('/api/update-sitemap', async (req, res) => {
  try {
    const result = await updateSitemap();
    if (result) {
      res.status(200).json({ success: true, message: 'Sitemap actualizado correctamente' });
    } else {
      res.status(500).json({ success: false, message: 'Error al actualizar el sitemap' });
    }
  } catch (error) {
    console.error('Error al actualizar el sitemap:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el sitemap' });
  }
});

// Ruta para servir el sitemap dinámico
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.status(200).send(cachedSitemap);
});
 
// Actualizar el sitemap al iniciar el servidor
updateSitemap().catch(error => {
  console.error('Error al actualizar el sitemap durante el inicio:', error);
});

// Programar actualización automática del sitemap (cada 24 horas)
const SITEMAP_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
setInterval(async () => {
  try {
   
    await updateSitemap();
   
  } catch (error) {
    console.error('Error en la actualización programada del sitemap:', error);
  }
}, SITEMAP_UPDATE_INTERVAL);

// Escuchar en HTTP (Nginx se encargará del SSL)
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
  console.log('✅ Generación de sitemap activada');
});