import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Recrear __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para generar CSV de propiedades
async function generateCSV() {
  try {
    console.log('🚀 Iniciando generación del CSV de propiedades...');
    
    // Obtener todas las propiedades desde la API
    console.log('📡 Obteniendo propiedades desde la API...');
    const response = await axios.get('https://remaxcin.com/api/propiedades');
    
    // Verificar estructura de respuesta
    if (!response.data || !response.data.data || !response.data.data.rows) {
      console.error('❌ Estructura de respuesta inesperada:', response.data);
      return;
    }
    
    const propiedades = response.data.data.rows;
    console.log(`📦 ${propiedades.length} propiedades encontradas`);
    
    if (propiedades.length === 0) {
      console.log('⚠️ No se encontraron propiedades para exportar');
      return;
    }

    // Inspeccionar la primera propiedad para ver todos los campos disponibles
    console.log('📋 Campos disponibles en la primera propiedad:');
    console.log(Object.keys(propiedades[0]));
    
    // Definir campos principales para el CSV basado en la estructura real de la API
    const campos = [
      'propiedad_id',
      'clave',
      'titulo',
      'operacion',
      'sector',
      'tipo',
      'mxn_original',
      'mxn_corriente',
      'usd_original', 
      'usd_corriente',
      'calle',
      'numero_exterior',
      'numero_interior',
      'postal',
      'longitud',
      'latitud',
      'banos',
      'medios_banos',
      'cuartos',
      'estacionamientos',
      'm2_terreno_',
      'm2_construccion',
      'zona',
      'fecha_inicio',
      'fecha_expiracion',
      'fecha_publica',
      'fecha_modificada',
      'imagenes',
      'descripcion_meta',
      'm2_terreno_meta',
      'uso_suelo_meta',
      'numero_recamaras_meta',
      'forma_terreno_meta',
      'conservacion_meta',
      'agente_nombre',
      'agente_celular',
      'agente_telefono',
      'agente_whatsapp',
      'agente_email',
      'oficina_nombre',
      'tipo_nombre',
      'estado_nombre',
      'ciudad_nombre',
      'colonia_nombre',
      'municipio_nombre'
    ];
    
    // Función para limpiar valores CSV
    function limpiarValorCSV(valor) {
      if (valor === null || valor === undefined) {
        return '';
      }
      
      // Convertir a string
      let valorStr = String(valor);
      
      // Limpiar saltos de línea, comillas y comas
      valorStr = valorStr.replace(/\n|\r/g, ' '); // Reemplazar saltos de línea
      valorStr = valorStr.replace(/"/g, '""'); // Escapar comillas dobles
      
      // Si contiene comas, espacios o comillas, envolver en comillas
      if (valorStr.includes(',') || valorStr.includes('"') || valorStr.includes('\n')) {
        valorStr = `"${valorStr}"`;
      }
      
      return valorStr;
    }
    
    // Crear encabezado CSV
    let csv = campos.join(',') + '\n';
    
    // Procesar cada propiedad
    propiedades.forEach((propiedad, index) => {
      try {
        const fila = campos.map(campo => {
          let valor;
          
          // Extraer valores según el campo
          switch(campo) {
            case 'descripcion_meta':
              valor = propiedad.propiedades_meta?.descripcion;
              break;
            case 'm2_terreno_meta':
              valor = propiedad.propiedades_meta?.m2_terreno;
              break;
            case 'uso_suelo_meta':
              valor = propiedad.propiedades_meta?.uso_suelo;
              break;
            case 'numero_recamaras_meta':
              valor = propiedad.propiedades_meta?.numero_recamaras;
              break;
            case 'forma_terreno_meta':
              valor = propiedad.propiedades_meta?.forma_terreno;
              break;
            case 'conservacion_meta':
              valor = propiedad.propiedades_meta?.conservacion;
              break;
            case 'agente_nombre':
              valor = `${propiedad.agentes?.nombre || ''} ${propiedad.agentes?.apellidos || ''}`.trim();
              break;
            case 'agente_celular':
              valor = propiedad.agentes?.celular;
              break;
            case 'agente_telefono':
              valor = propiedad.agentes?.telefono;
              break;
            case 'agente_whatsapp':
              valor = propiedad.agentes?.whatsapp;
              break;
            case 'agente_email':
              valor = propiedad.agentes?.email;
              break;
            case 'oficina_nombre':
              valor = propiedad.oficinas?.oficina_nombre;
              break;
            case 'tipo_nombre':
              valor = propiedad.tipos?.tipo_nombre;
              break;
            case 'estado_nombre':
              valor = propiedad.estados?.estado_nombre;
              break;
            case 'ciudad_nombre':
              valor = propiedad.ciudades?.ciudad_nombre;
              break;
            case 'colonia_nombre':
              valor = propiedad.colonias?.colonia_nombre;
              break;
            case 'municipio_nombre':
              valor = propiedad.municipios?.municipio_nombre;
              break;
            default:
              valor = propiedad[campo];
          }
          
          return limpiarValorCSV(valor);
        }).join(',');
        
        csv += fila + '\n';
      } catch (error) {
        console.error(`❌ Error procesando propiedad ${index + 1}:`, error);
      }
    });
    
    // Guardar archivo CSV
    const csvPath = path.join(__dirname, '../frontend/public/propiedades.csv');
    fs.writeFileSync(csvPath, csv, 'utf8');
    
    console.log('✅ CSV generado exitosamente');
    console.log(`📊 Total de propiedades exportadas: ${propiedades.length}`);
    console.log(`📅 Fecha de generación: ${new Date().toISOString()}`);
    console.log(`📁 Ubicación: ${csvPath}`);
    console.log(`💾 Tamaño del archivo: ${(csv.length / 1024).toFixed(2)} KB`);
    
    // Mostrar estadísticas básicas
    const estadisticas = {
      total: propiedades.length,
      conPrecioMXN: propiedades.filter(p => p.mxn_corriente && parseFloat(p.mxn_corriente) > 0).length,
      conPrecioUSD: propiedades.filter(p => p.usd_corriente && parseFloat(p.usd_corriente) > 0).length,
      tipos: [...new Set(propiedades.map(p => p.tipos?.tipo_nombre).filter(Boolean))],
      sectores: [...new Set(propiedades.map(p => p.sector).filter(Boolean))],
      operaciones: [...new Set(propiedades.map(p => p.operacion).filter(Boolean))],
      estados: [...new Set(propiedades.map(p => p.estados?.estado_nombre).filter(Boolean))],
      ciudades: [...new Set(propiedades.map(p => p.ciudades?.ciudad_nombre).filter(Boolean))],
      oficinas: [...new Set(propiedades.map(p => p.oficinas?.oficina_nombre).filter(Boolean))]
    };
    
    console.log('\n📊 ESTADÍSTICAS DETALLADAS:');
    console.log(`- Total de propiedades: ${estadisticas.total}`);
    console.log(`- Con precio en MXN: ${estadisticas.conPrecioMXN}`);
    console.log(`- Con precio en USD: ${estadisticas.conPrecioUSD}`);
    console.log(`- Tipos: ${estadisticas.tipos.join(', ')}`);
    console.log(`- Sectores: ${estadisticas.sectores.join(', ')}`);
    console.log(`- Operaciones: ${estadisticas.operaciones.join(', ')}`);
    console.log(`- Estados: ${estadisticas.estados.join(', ')}`);
    console.log(`- Ciudades: ${estadisticas.ciudades.slice(0, 5).join(', ')}${estadisticas.ciudades.length > 5 ? '...' : ''}`);
    console.log(`- Oficinas: ${estadisticas.oficinas.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error al generar el CSV:', error.message);
    if (error.response) {
      console.error('📡 Error de API:', error.response.status, error.response.statusText);
    }
    if (error.code === 'ENOENT') {
      console.error('📁 Error de archivo: No se pudo encontrar el directorio de destino');
    }
    process.exit(1);
  }
}

// Ejecutar la función
generateCSV();

export { generateCSV };
