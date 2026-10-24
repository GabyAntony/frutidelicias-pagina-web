/**
 * Configuración por defecto de la ruleta.
 *
 * Estructura de cada item:
 *   label       -> Texto que aparece en la ruleta (obligatorio)
 *   descripcion -> Texto que se muestra al ganar (opcional)
 *   porcentaje  -> Peso/probabilidad relativa (opcional, por defecto 1)
 *   codigo      -> Prefijo del código que se emite (opcional)
 *   unico       -> true = el item se descarta tras salir una vez (opcional)
 */
window.CONFIG_RULETA = {
  titulo: 'Ruleta de la Senna',
  prefijoCodigo: 'SENNA',
  items: [
    {
      label: 'Café',
      descripcion: 'Café de la casa, sin azúcar',
      porcentaje: 25,
      codigo: 'CAF',
      unico: false
    },
    {
      label: 'Medialunas',
      descripcion: 'Medialunas de manteca',
      porcentaje: 20,
      codigo: 'MED',
      unico: false
    },
    {
      label: 'Empanada',
      descripcion: 'Empanada de carne cortada a cuchillo',
      porcentaje: 20,
      codigo: 'EMP',
      unico: false
    },
    {
      label: 'Vaso de agua',
      descripcion: 'Agua mineral sin gas',
      porcentaje: 15,
      codigo: 'AGU',
      unico: false
    },
    {
      label: 'Sorteo sorpresa',
      descripcion: 'Descuento del 15% en tu próxima compra',
      porcentaje: 10,
      codigo: 'SOR',
      unico: true
    },
    {
      label: 'Pescado frito',
      descripcion: 'Filete rebozado con papas',
      porcentaje: 10,
      codigo: 'PESC',
      unico: true
    }
  ]
};
