const DAILY_TEXTS = [
  'SAP es un sistema empresarial que integra los procesos de negocio en una plataforma unica y centralizada para toda la organizacion',
  'ABAP es el lenguaje de programacion principal del ecosistema SAP orientado a objetos eventos y permite crear aplicaciones empresariales robustas',
  'la transaccion SE38 permite crear editar y ejecutar programas ABAP en el entorno de desarrollo y test del sistema SAP',
  'los informes ABAP utilizan el componente ALV Grid para mostrar datos tabulares con opciones de filtrado ordenacion y exportacion al usuario final',
  'la tabla MARA en SAP contiene los datos maestros de materiales como numero descripcion unidad de medida y categoria de material',
  'un BAPI es una interfaz estandar de SAP para acceder a los objetos de negocio desde sistemas externos mediante llamadas de funcion remotas',
  'los modulos de SAP incluyen finanzas logistica recursos humanos produccion gestion de calidad ventas y distribucion integrados en una sola plataforma',
  'el customizing en SAP permite configurar el sistema segun las necesidades especificas de cada empresa cliente sin modificar el codigo estandar',
  'en ABAP una clase se define con la sentencia CLASS y sus metodos se implementan con la instruccion METHOD dentro del bloque de implementacion',
  'el sistema de transporte en SAP permite mover objetos entre los sistemas de desarrollo calidad y produccion de forma controlada y auditada',
  'los exits y BADIs son puntos de mejora estandar de SAP para anadir logica personalizada sin modificar el nucleo del sistema',
  'la transaccion SM30 se utiliza para mantener las tablas de customizing y configuracion en el sistema SAP con control de versiones',
  'en SAP el mandante representa una unidad organizativa independiente con sus propios datos maestros configuracion y parametros de empresa completamente aislados',
  'los programas de tipo reporte en ABAP se ejecutan con la sentencia SUBMIT y pueden recibir parametros de seleccion del usuario en pantalla',
  'la instruccion SELECT en ABAP permite consultar datos de las tablas de base de datos del sistema SAP con filtros y ordenaciones',
  'un function module en SAP es una funcion reutilizable que puede ser llamada desde cualquier programa ABAP del sistema con parametros de entrada y salida',
  'el debugging en ABAP permite ejecutar el codigo paso a paso y examinar el contenido de las variables internas en cada punto de ruptura',
  'la gestion de materiales en SAP cubre los procesos de compras recepcion de mercancias gestion de inventario y planificacion de necesidades de materiales',
  'las ordenes de compra en SAP se crean mediante la transaccion ME21N y permiten gestionar el proceso completo de aprovisionamiento de materiales y servicios',
  'el modulo de ventas SD en SAP gestiona todo el ciclo desde la oferta comercial hasta la factura pasando por el pedido y el alguilan de mercancias',
  'la programacion orientada a objetos en ABAP permite crear clases interfaces y metodos que encapsulan la logica de negocio de forma modular y reutilizable',
  'las tablas transparentes en SAP corresponden directamente a tablas de la base de datos subyacente y almacenan datos maestros y de transacciones del negocio',
  'el lenguaje SQL embebido en ABAP permite realizar consultas complejas con joins subconsultas y agregaciones directamente sobre las tablas del sistema SAP',
  'los perfiles de autorizacion en SAP controlan el acceso de los usuarios a las transacciones datos y funciones del sistema basandose en roles y puestos',
  'la arquitectura cliente servidor de SAP separa la capa de presentacion la logica de aplicacion y la base de datos para mayor escalabilidad y rendimiento',
  'los batch jobs en SAP permiten programar la ejecucion automatica de programas ABAP en segundo plano sin intervencion del usuario en horarios definidos',
  'el workflow de SAP permite automatizar los procesos de negocio mediante la definicion de tareas roles responsables y condiciones de paso entre etapas',
  'la gestion de proyectos en SAP PS permite planificar controlar y monitorizar proyectos con estructura de desglose de trabajo hitos y control de costes',
]

function hashDate(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (Math.imul(31, hash) + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getDailyText(): string {
  const today = new Date().toISOString().slice(0, 10)
  const idx = hashDate(today) % DAILY_TEXTS.length
  return DAILY_TEXTS[idx]
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
