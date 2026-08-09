import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Recrear __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar el sitemap
async function generateSitemap() {
  try {
    console.log('🚀 Iniciando generación del sitemap...');
    
    // Obtener todas las propiedades desde la API
    console.log('📡 Obteniendo propiedades desde la API...');
    const response = await axios.get('http://localhost:3001/api/propiedades');
    const propiedades = response.data.data.rows;
    console.log(`📦 ${propiedades.length} propiedades encontradas`);

    // Crear el encabezado del sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página Principal -->
  <url>
    <loc>https://remaxcin.com/</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <!-- Páginas de Búsqueda -->
  <url>
    <loc>https://remaxcin.com/residencial</loc>
    <priority>0.9</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/inicio</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/propiedades</loc>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <!-- Desarrollos -->
  <url>
    <loc>https://remaxcin.com/desarrollo-trebol-ii</loc>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/desarrollo-palma</loc>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <!-- Servicios -->
  <url>
    <loc>https://remaxcin.com/reclutamiento</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/valuador</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/creditos-hipotecarios</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/NuestroEquipo</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  
  <!-- Páginas Legales -->
  <url>
    <loc>https://remaxcin.com/Polizas-de-renta</loc>
    <priority>0.6</priority>
    <changefreq>yearly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/terminos-y-condiciones</loc>
    <priority>0.5</priority>
    <changefreq>yearly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/codigo-de-etica</loc>
    <priority>0.5</priority>
    <changefreq>yearly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
  <url>
    <loc>https://remaxcin.com/politica-de-privacidad</loc>
    <priority>0.5</priority>
    <changefreq>yearly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Propiedades Dinámicas -->`;

    // Agregar cada propiedad al sitemap
    propiedades.forEach(propiedad => {
      sitemap += `
  <url>
    <loc>https://remaxcin.com/propiedades/seleccion/${propiedad.propiedad_id}</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Cerrar el sitemap
    sitemap += `
</urlset>`;

    // Guardar el sitemap en el directorio público
    const sitemapPath = path.join(__dirname, '../frontend/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`✅ Sitemap generado exitosamente`);
    console.log(`📊 Total de URLs incluidas: ${propiedades.length + 12} (${propiedades.length} propiedades + 12 páginas estáticas)`);
    console.log(`📅 Fecha de generación: ${new Date().toISOString().split('T')[0]}`);
    console.log(`📁 Ubicación: ${sitemapPath}`);
    
  } catch (error) {
    console.error('❌ Error al generar el sitemap:', error.message);
    if (error.response) {
      console.error('📡 Error de API:', error.response.status, error.response.statusText);
      console.error('📡 Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error de conexión: El servidor backend no está ejecutándose en localhost:3001');
      console.error('💡 Solución: Ejecuta "npm start" en el directorio backend primero');
    }
    if (error.code === 'ENOENT') {
      console.error('📁 Error de archivo: No se pudo encontrar el directorio de destino');
    }
    console.error('🔍 Error completo:', error);
    process.exit(1);
  }
}

// Ejecutar la función
generateSitemap();

export { generateSitemap };