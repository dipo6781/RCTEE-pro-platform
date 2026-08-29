/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/data.ts
   Datos estáticos de la plataforma: metodología, personalidades,
   temas → subtemas → plantillas, nichos rentables e inteligencia de mercado.
   ──────────────────────────────────────────────────────────────────────────── */

export interface CamposRCTEE {
  rol: string;
  contexto: string;
  tarea: string;
  especificaciones: string;
  ejemplos: string;
}

export interface Plantilla {
  id: string;
  nombre: string;
  desc: string;
  campos: CamposRCTEE;
}
export interface Subtema {
  id: string;
  nombre: string;
  plantillas: Plantilla[];
}
export interface Tema {
  id: string;
  nombre: string;
  desc: string;
  subtemas: Subtema[];
}

export const VERSION = "2.1.0";

export const NAV = [
  { id: "dashboard", n: "01", label: "Dashboard", desc: "Consola central de arquitectura de prompts" },
  { id: "clasico", n: "02", label: "Generador Clásico", desc: "Ensambla prompts R-C-T-E-E con validación de campos" },
  { id: "enterprise", n: "03", label: "Enterprise JSON", desc: "Esquema estructurado con validación JSON en tiempo real" },
  { id: "plantillas", n: "04", label: "Plantillas", desc: "Temas → Subtemas → Plantillas con variables dinámicas" },
  { id: "rentables", n: "05", label: "Nichos Rentables", desc: "Servicios de prompt engineering listos para vender" },
  { id: "mercado", n: "06", label: "Mercado", desc: "Demanda, precios y señales del sector" },
  { id: "chatbot", n: "07", label: "Chatbot IA", desc: "8 personalidades especializadas, motor Groq u Ollama" },
  { id: "ajustes", n: "08", label: "Ajustes", desc: "Motor de IA, preferencias y gestión de datos" },
] as const;

export type SectionId = (typeof NAV)[number]["id"];

/* ── Metodología R-C-T-E-E ─────────────────────────────────────────────────── */

export const METODOLOGIA = [
  {
    key: "R",
    nombre: "Rol",
    color: "ember",
    hex: "#e4572e",
    peso: 15,
    desc: "Identidad experta que asume el modelo: cargo, trayectoria, sector y tono.",
    guia: "Ej. «Analista de riesgos senior con 12 años en banca comercial». Cuanta más especificidad de experiencia, más calibrada la salida.",
  },
  {
    key: "C",
    nombre: "Contexto",
    color: "cobalt",
    hex: "#2e5eaa",
    peso: 25,
    desc: "Situación de negocio, datos duros y restricciones del escenario real.",
    guia: "Incluye cifras, momento de la empresa y objetivo. Mínimo 80 caracteres: sin contexto, el modelo inventa el suyo.",
  },
  {
    key: "T",
    nombre: "Tarea",
    color: "jade",
    hex: "#0f7a55",
    peso: 25,
    desc: "Acción concreta y entregable esperado. Un verbo fuerte + resultado medible.",
    guia: "Ej. «Elaborar un informe de riesgo con dictamen aprobar/condicionar/rechazar». Evita verbos débiles como “hablar de”.",
  },
  {
    key: "E",
    nombre: "Especificaciones",
    color: "honey",
    hex: "#d99125",
    peso: 20,
    desc: "Formato de salida, extensión, estructura, estilo y reglas negativas.",
    guia: "Define estructura por secciones, longitud máxima, tono y qué está prohibido (inventar datos, omitir cifras…).",
  },
  {
    key: "E²",
    nombre: "Ejemplos",
    color: "berry",
    hex: "#b23a6b",
    peso: 15,
    desc: "Referencias few-shot entrada → salida que fijan el estándar de calidad.",
    guia: "Con 1–3 ejemplos calibrados la varianza de la respuesta cae drásticamente. Es el bloque con mayor ROI del método.",
  },
] as const;

export const FORMATOS = [
  { id: "markdown", label: "Markdown" },
  { id: "json", label: "JSON" },
  { id: "texto", label: "Texto plano" },
] as const;
export type FormatoId = (typeof FORMATOS)[number]["id"];

export const PRECISION = [
  { id: "cot", label: "Chain of Thought", desc: "Obliga al modelo a razonar paso a paso antes de responder." },
  { id: "autoverif", label: "Auto-verificación", desc: "El modelo audita su salida contra las especificaciones antes de entregar." },
  { id: "neg", label: "Restricciones negativas", desc: "Bloque explícito de lo que el modelo NO debe hacer." },
] as const;
export type PrecisionId = (typeof PRECISION)[number]["id"];

export const TICKER = [
  "PROMPT ENGINEERING",
  "R·C·T·E·E",
  "CHAIN OF THOUGHT",
  "FEW-SHOT CALIBRADO",
  "AUTO-VERIFICACIÓN",
  "LLAMA 3 · GROQ",
  "OLLAMA LOCAL",
  "ESQUEMA JSON",
  "CONTEXTO ≥ 80",
  "EXPORT MD / JSON",
  "ZERO DEUDA TÉCNICA",
];

/* ── Chatbot: 8 personalidades ─────────────────────────────────────────────── */

export interface Persona {
  id: string;
  nombre: string;
  area: string;
  tono: string;
  hex: string;
  system: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "vector",
    nombre: "Vector",
    area: "Ingeniería de Prompts",
    tono: "Preciso, técnico, obsesivo de la estructura",
    hex: "#0f7a55",
    system:
      "Eres Vector, ingeniero de prompts senior de la plataforma R-C-T-E-E Pro. Respondes en español, con estructura clara, ejemplos accionables y referencias constantes a la metodología Rol-Contexto-Tarea-Especificaciones-Ejemplos. Máximo 220 palabras.",
  },
  {
    id: "athena",
    nombre: "Athena",
    area: "Estrategia de Negocio",
    tono: "Ejecutiva, orientada a decisiones",
    hex: "#2e5eaa",
    system:
      "Eres Athena, estratega de negocio con experiencia en consultoría. Respondes en español con marcos de decisión, impacto esperado y próximos pasos. Conecta todo con la metodología R-C-T-E-E. Máximo 220 palabras.",
  },
  {
    id: "ledger",
    nombre: "Ledger",
    area: "Finanzas & Riesgo",
    tono: "Numérico, conservador, riguroso",
    hex: "#d99125",
    system:
      "Eres Ledger, analista financiero senior. Respondes en español con cifras, ratios y advertencias de riesgo. Siempre sugiere cómo documentar supuestos en un prompt R-C-T-E-E. Máximo 220 palabras.",
  },
  {
    id: "clausula",
    nombre: "Cláusula",
    area: "Legal & Compliance",
    tono: "Formal, cauteloso, metódico",
    hex: "#b23a6b",
    system:
      "Eres Cláusula, asesora legal y de cumplimiento. Respondes en español con checklists, riesgos contractuales y lenguaje preciso. Aclara que no sustituyes asesoría legal formal. Máximo 220 palabras.",
  },
  {
    id: "pixel",
    nombre: "Pixel",
    area: "UX Research",
    tono: "Empático, basado en evidencia",
    hex: "#e4572e",
    system:
      "Eres Pixel, UX researcher. Respondes en español con hipótesis, métodos de investigación y hallazgos accionables. Sugiere cómo convertir insights en prompts R-C-T-E-E. Máximo 220 palabras.",
  },
  {
    id: "galeno",
    nombre: "Galeno",
    area: "Gestión Clínica",
    tono: "Clínico, protocolizado, seguro",
    hex: "#0f7a55",
    system:
      "Eres Galeno, consultor de gestión clínica. Respondes en español con protocolos, indicadores y seguridad del paciente como prioridad. Recuerda que no das diagnóstico médico. Máximo 220 palabras.",
  },
  {
    id: "metro",
    nombre: "Metro",
    area: "Inmobiliario",
    tono: "Comercial, directo, orientado a cierre",
    hex: "#2e5eaa",
    system:
      "Eres Metro, especialista inmobiliario. Respondes en español con guiones de captación, análisis comparativos y tácticas de cierre. Ejemplifica con prompts R-C-T-E-E del sector. Máximo 220 palabras.",
  },
  {
    id: "dactilo",
    nombre: "Dáctilo",
    area: "Copywriting de Conversión",
    tono: "Persuasivo, rítmico, concreto",
    hex: "#d99125",
    system:
      "Eres Dáctilo, copywriter de conversión. Respondes en español con fórmulas de copy, ejemplos de antes/después y ángulos de venta. Traduce todo a estructura R-C-T-E-E. Máximo 220 palabras.",
  },
];

/* ── Temas → Subtemas → Plantillas (variables {dinamicas}) ─────────────────── */

const P = (id: string, nombre: string, desc: string, campos: CamposRCTEE): Plantilla => ({ id, nombre, desc, campos });

export const TEMAS: Tema[] = [
  {
    id: "fin",
    nombre: "Finanzas",
    desc: "Riesgo, crédito, cobranza e inversiones",
    subtemas: [
      {
        id: "credito",
        nombre: "Análisis de crédito",
        plantillas: [
          P(
            "fin-01",
            "Informe de riesgo crediticio PyME",
            "Dictamen técnico para comité de crédito",
            {
              rol: "Analista de riesgos senior con 12 años en banca comercial, especializado en crédito PyME y modelos de scoring interno.",
              contexto:
                "La entidad evalúa una solicitud de crédito de {monto_solicitado} para una empresa del sector {sector} con {anios_operando} años de operación. El comité de crédito sesiona esta semana y exige un dictamen defendible con datos verificables.",
              tarea: "Elaborar un informe de riesgo crediticio con probabilidad de incumplimiento estimada, análisis de capacidad de pago y dictamen explícito: aprobar, condicionar o rechazar, incluyendo condiciones sugeridas.",
              especificaciones:
                "Estructura: resumen ejecutivo (máx. 120 palabras), tabla de ratios clave, mínimo 5 factores de riesgo con su mitigante, y dictamen final. Tono técnico, sin ambigüedades. Moneda en formato local.",
              ejemplos:
                "Entrada: logística, $250.000, 6 años, score 620 → Salida: «Condicional: tasa base +180 pb, garantía líquida 20 %, revisión trimestral de covenants».",
            }
          ),
          P(
            "fin-02",
            "Plan de cobranza de cartera vencida",
            "Estrategia segmentada de recuperación",
            {
              rol: "Gerente de cobranzas con 10 años gestionando carteras vencidas en banca de consumo y microfinanzas.",
              contexto:
                "La cartera vencida alcanza {monto_cartera} con {dias_mora} días de mora promedio, concentrada en el segmento {segmento}. El objetivo de recuperación trimestral es del 38 % del saldo.",
              tarea: "Diseñar un plan de cobranza segmentado por tramos de mora, con guiones de contacto, esquema de incentivos de pago y metas semanales por gestor.",
              especificaciones:
                "Incluir: matriz de segmentación (tramo × acción), 2 guiones de llamada (tono preventivo y tono firme), tabla de metas semanales y KPIs de seguimiento. Extensión máxima: 900 palabras.",
              ejemplos:
                "Entrada: mora 31–60 días, segmento microempresa → Salida: «Contacto telefónico + plan de pagos en 3 cuotas con condonación parcial de intereses (15 %)».",
            }
          ),
        ],
      },
      {
        id: "inversiones",
        nombre: "Inversiones",
        plantillas: [
          P(
            "fin-03",
            "Comparativa de instrumentos de inversión",
            "Análisis riesgo-retorno para el cliente",
            {
              rol: "Asesor de inversiones certificado, con enfoque en asignación de activos para perfiles {perfil_riesgo}.",
              contexto:
                "Un cliente desea invertir {monto_invertir} con un horizonte de {horizonte_anios} años. Actualmente mantiene todo en depósitos a la vista y no tiene experiencia previa en mercados.",
              tarea: "Construir una comparativa de 4 instrumentos disponibles en el mercado local (renta fija, fondos indexados, ETFs, alternativas), con tabla de riesgo-retorno y una asignación sugerida.",
              especificaciones:
                "Tabla comparativa con columnas: instrumento, retorno esperado, volatilidad, liquidez, costo anual. Asignación sugerida en porcentajes que sumen 100 %. Incluir 3 advertencias de riesgo. Tono pedagógico.",
              ejemplos:
                "Entrada: perfil moderado, $50.000, 7 años → Salida: asignación 45 % renta fija corta / 35 % indexado global / 15 % ETF regional / 5 % liquidez táctica.",
            }
          ),
          P(
            "fin-04",
            "Informe de rebalanceo de portafolio",
            "Ajuste táctico con justificación",
            {
              rol: "Estratega de portafolios con experiencia en rebalanceos tácticos y control de tracking error.",
              contexto:
                "El portafolio actual es: {portafolio_actual}. El rendimiento objetivo anual es {rendimiento_objetivo} con tolerancia máxima de drawdown del 12 %.",
              tarea: "Proponer un rebalanceo del portafolio con movimientos concretos (vender X %, comprar Y %), justificación por clase de activo y calendario de ejecución en 2 semanas.",
              especificaciones:
                "Formato memo: situación actual (5 líneas), tabla de movimientos, justificación por activo, calendario y riesgos de ejecución. Sin jerga innecesaria; cada decisión con su porqué.",
              ejemplos:
                "Entrada: 70 % renta variable, objetivo 8 % anual → Salida: «Reducir RV local al 52 %, sumar 10 % en bonos ligados a inflación para proteger el drawdown».",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "inm",
    nombre: "Inmobiliaria",
    desc: "Captación, valuación y cierre de ventas",
    subtemas: [
      {
        id: "captacion",
        nombre: "Captación",
        plantillas: [
          P(
            "inm-01",
            "Guion de captación de propietarios",
            "Convierte propietarios fríos en exclusivas",
            {
              rol: "Agente inmobiliario top performer con 8 años captando exclusivas en la zona {zona}.",
              contexto:
                "La inmobiliaria necesita inventario de {tipo_propiedad} en {zona}, donde la rotación de listings es alta y los propietarios reciben múltiples ofertas de agencias.",
              tarea: "Escribir un guion telefónico de captación en 4 etapas (apertura, diagnóstico, propuesta de valor, cierre de cita), con 3 objeciones típicas y su respuesta.",
              especificaciones:
                "Tono consultivo, nunca vendedor agresivo. Cada etapa con texto literal entre comillas. Objeciones: «ya lo vendo solo», «qué comisión cobran», «tengo otra agencia». Extensión: 600–800 palabras.",
              ejemplos:
                "Objeción «ya lo vendo solo» → «Perfecto, señor Ruiz. Solo le propongo una comparación de 15 minutos con datos de ventas reales de su calle; si no le aporta, sigue con su plan sin compromiso».",
            }
          ),
          P(
            "inm-02",
            "Análisis comparativo de mercado (ACM)",
            "Valuación defendible con datos de zona",
            {
              rol: "Perito valuador inmobiliario con acceso mental a operaciones comparables y metodología de ajuste por características.",
              contexto:
                "Se requiere valuar un {tipo_propiedad} de {metros_cuadrados} m² con {antiguedad} años de antigüedad en {zona}. El propietario espera un precio 18 % por encima del mercado.",
              tarea: "Elaborar un ACM con 5 comparables, ajustes por ubicación/estado/antigüedad y un rango de precio sugerido con banda alta-media-baja.",
              especificaciones:
                "Tabla: comparable, precio, m², precio/m², ajuste neto. Rango final justificado en 3 líneas. Incluir párrafo para explicar al propietario por qué su expectativa es alta, con tono diplomático.",
              ejemplos:
                "Comparable a 300 m, +12 % por mejor fachada → «Precio/m² ajustado: $2.410; banda media de la propiedad: $289.200».",
            }
          ),
        ],
      },
      {
        id: "venta",
        nombre: "Venta & Listings",
        plantillas: [
          P(
            "inm-03",
            "Ficha de listing persuasiva",
            "Descripción que convierte visitas en ofertas",
            {
              rol: "Copywriter inmobiliario especializado en listings de alto valor conversivo.",
              contexto:
                "Se publica un {tipo_propiedad} en {zona} a {precio}. El anuncio compite con 40+ listings similares en el mismo portal; el tiempo medio de lectura es de 22 segundos.",
              tarea: "Redactar la ficha completa del listing: titular de 60 caracteres, descripción en 3 bloques (enganche, estilo de vida, datos duros) y cierre con llamada a la acción.",
              especificaciones:
                "Prohibido el vocabulario cliché («acogedor», «oportunidad única»). Incluir 5 datos duros (m², antigüedad, expensas, orientación, distancia a transporte). Tono aspiracional pero verificable.",
              ejemplos:
                "Titular: «Luz de tarde y 14 m² de terraza: el {tipo_propiedad} que {zona} no esperaba». Cierre: «Agenda una visita al atardecer: es cuando esta propiedad se explica sola».",
            }
          ),
          P(
            "inm-04",
            "Plan de open house de alto impacto",
            "Evento de 3 horas que genera ofertas",
            {
              rol: "Directora de marketing inmobiliario con experiencia en open houses que generan ofertas en 48 horas.",
              contexto:
                "Presupuesto del evento: {presupuesto_evento}. La propiedad es un {tipo_propiedad} en zona de alta competencia y el vendedor necesita una oferta en menos de 30 días.",
              tarea: "Diseñar el plan completo del open house: cronograma de 3 horas, experiencia sensorial por ambiente, sistema de registro de visitantes y secuencia de seguimiento post-evento.",
              especificaciones:
                "Cronograma en bloques de 30 minutos. Presupuesto desglosado por partida. Secuencia de seguimiento: mismo día, 24 h y 72 h, con guion de contacto. KPIs: registros, visitas calificadas, ofertas.",
              ejemplos:
                "Registro: «En lugar de libro de firmas, QR con 3 preguntas de calificación; quien responde recibe el dossier digital de la propiedad en su correo».",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "edu",
    nombre: "Educación",
    desc: "Diseño instruccional, evaluación y tutoría",
    subtemas: [
      {
        id: "diseno",
        nombre: "Diseño instruccional",
        plantillas: [
          P(
            "edu-01",
            "Secuencia didáctica por competencias",
            "Plan de unidad listo para el aula",
            {
              rol: "Diseñadora instruccional con 10 años creando secuencias didácticas por competencias para educación {nivel_educativo}.",
              contexto:
                "El docente imparte {asignatura} y dispone de {duracion_semanas} semanas. El grupo presenta heterogeneidad de niveles y un 20 % de estudiantes con rezago en comprensión lectora.",
              tarea: "Diseñar la secuencia didáctica completa: competencia, aprendizajes esperados, actividades de apertura-desarrollo-cierre por sesión y evaluación formativa.",
              especificaciones:
                "Formato tabla por sesión (fecha, actividad, tiempo, producto). Mínimo 2 estrategias de diferenciación para estudiantes con rezago. Incluir rúbrica resumida de 4 niveles.",
              ejemplos:
                "Sesión 1: apertura con caso real (10 min) → desarrollo en equipos con roles rotativos (25 min) → ticket de salida con 1 idea y 1 duda (5 min).",
            }
          ),
          P(
            "edu-02",
            "Rúbrica de evaluación analítica",
            "Criterios claros, calificación justa",
            {
              rol: "Especialista en evaluación del aprendizaje con dominio de rúbricas analíticas y calibración entre evaluadores.",
              contexto:
                "Se necesita evaluar la competencia «{competencia}» en estudiantes de nivel {nivel_educativo}. Tres docentes distintos calificarán, por lo que la rúbrica debe minimizar la subjetividad.",
              tarea: "Construir una rúbrica analítica con 4 criterios, 4 niveles de desempeño (excelente a insuficiente) y descriptores observables, más una guía de calibración para los evaluadores.",
              especificaciones:
                "Cada descriptor debe ser observable y medible, sin adjetivos vagos («bueno», «interesante»). Incluir ponderación por criterio y 2 ejemplos de trabajo anclado (nivel alto y medio).",
              ejemplos:
                "Nivel alto: «Argumenta con 3+ evidencias verificables y contraargumenta al menos una postura opuesta». Nivel medio: «Argumenta con 1–2 evidencias sin contraargumentación».",
            }
          ),
        ],
      },
      {
        id: "tutoria",
        nombre: "Tutoría personalizada",
        plantillas: [
          P(
            "edu-03",
            "Plan de tutoría personalizada",
            "Recuperación enfocada en 6 sesiones",
            {
              rol: "Tutor académico con enfoque de andamiaje y metacognición, especialista en {tema}.",
              contexto:
                "El estudiante presenta {dificultad_detectada} en {tema}. Las sesiones disponibles son 6, de 50 minutos, y la familia espera evidencia de avance medible.",
              tarea: "Diseñar el plan de 6 sesiones con diagnóstico inicial, objetivos por sesión, técnicas de andamiaje y una evaluación de progreso comparable entre la sesión 1 y la 6.",
              especificaciones:
                "Cada sesión: objetivo, actividad central, andamiaje previsto y criterio de avance. Prohibido «repasar el tema» sin método. Incluir un contrato de compromiso de 3 puntos para el estudiante.",
              ejemplos:
                "Sesión 2: «Si falla en el paso 2 del algoritmo, retroceder a ejercicio resuelto parcialmente (andamiaje de completado), no repetir la explicación completa».",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "leg",
    nombre: "Legal",
    desc: "Contratos, revisión y cumplimiento",
    subtemas: [
      {
        id: "contratos",
        nombre: "Contratos",
        plantillas: [
          P(
            "leg-01",
            "Cláusulas clave para contrato de servicios",
            "Protección balanceada para ambas partes",
            {
              rol: "Abogado corporativo con 15 años redactando contratos de {tipo_servicio} bajo la jurisdicción de {jurisdiccion}.",
              contexto:
                "Una empresa de servicios firma su primer contrato marco con un cliente corporativo. No existe historial entre las partes y el cliente impone su formato base, que es desbalanceado.",
              tarea: "Redactar 6 cláusulas clave (alcance, SLA, propiedad intelectual, limitación de responsabilidad, terminación anticipada, resolución de disputas) con lenguaje ejecutable y balanceado.",
              especificaciones:
                "Cada cláusula: texto formal + nota de negociación (qué ceder, qué no). Prohibido lenguaje ambiguo («en la medida de lo posible»). Incluir 3 señales de alerta del formato del cliente.",
              ejemplos:
                "Limitación de responsabilidad: «…limitada al 100 % de los honorarios pagados en los 12 meses previos» — Nota: no ceder daños indirectos; es la línea roja.",
            }
          ),
          P(
            "leg-02",
            "Checklist de revisión contractual",
            "Auditoría rápida de 40 puntos",
            {
              rol: "Paralegal senior especializado en revisión de contratos de {tipo_contrato} para la parte {parte_representada}.",
              contexto:
                "Llega un contrato de {tipo_contrato} de 24 páginas con plazo de respuesta de 48 horas. El equipo necesita priorizar riesgos sin leer con profundidad cada página.",
              tarea: "Construir un checklist de revisión de 40 puntos agrupado por nivel de riesgo (crítico/alto/medio), con el artículo típico donde suele esconderse cada riesgo.",
              especificaciones:
                "Formato tabla: punto de control, riesgo detectado, ubicación típica, acción sugerida. Los 8 puntos críticos primero. Incluir 5 «cláusulas trampa» frecuentes en este tipo de contrato.",
              ejemplos:
                "Crítico #3: renovación automática con ventana de denuncia < 30 días → Ubicación típica: «Vigencia» → Acción: ampliar ventana a 60 días o eliminar tácita reconducción.",
            }
          ),
        ],
      },
      {
        id: "compliance",
        nombre: "Compliance",
        plantillas: [
          P(
            "leg-03",
            "Matriz de cumplimiento normativo",
            "Mapa de obligaciones y responsables",
            {
              rol: "Oficial de cumplimiento con experiencia implementando marcos de {normativa} en empresas del sector {sector_empresa}.",
              contexto:
                "La empresa (180 empleados) enfrenta su primera auditoría externa de {normativa} en 6 meses. Hoy no existe inventario de obligaciones ni responsables asignados.",
              tarea: "Construir la matriz de cumplimiento: obligaciones clave, riesgo de incumplimiento, estado actual, responsable y plan de cierre de brechas priorizado.",
              especificaciones:
                "Matriz con mínimo 12 obligaciones. Columnas: obligación, base normativa, riesgo (alto/medio/bajo), estado, responsable, fecha límite. Plan de cierre en 3 olas (30/60/90 días).",
              ejemplos:
                "Obligación: registro de tratamientos de datos → Riesgo alto → Estado: inexistente → Responsable: DPO → Cierre: ola 1 (día 25) con herramienta de inventario.",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "mkt",
    nombre: "Marketing",
    desc: "Campañas, contenidos y email de conversión",
    subtemas: [
      {
        id: "campanas",
        nombre: "Campañas",
        plantillas: [
          P(
            "mkt-01",
            "Campaña de lanzamiento 360°",
            "Plan integrado con presupuesto asignado",
            {
              rol: "Directora de marketing con 12 años lanzando productos de consumo; especializada en campañas integradas de bajo presupuesto.",
              contexto:
                "Se lanza {producto} para {audiencia} con un presupuesto total de {presupuesto}. El objetivo es alcanzar 1.000 ventas en los primeros 45 días y una lista de espera de 5.000 leads.",
              tarea: "Diseñar la campaña de lanzamiento en 3 fases (expectativa, lanzamiento, sostenimiento) con asignación presupuestaria por canal y calendario de 6 semanas.",
              especificaciones:
                "Incluir: mensaje central en 12 palabras, 3 ángulos creativos, distribución de presupuesto en % y tabla semanal por canal. KPIs por fase. Prohibido depender de un solo canal.",
              ejemplos:
                "Fase expectativa (semanas 1–2): 25 % del presupuesto en contenido de problema, no de producto → KPI: 5.000 registros en lista de espera antes del día 14.",
            }
          ),
          P(
            "mkt-02",
            "Calendario de contenidos mensual",
            "30 días de contenido con sistema",
            {
              rol: "Content strategist que diseña calendarios sostenibles para marcas como {marca}, con sistema de pilares y formatos.",
              contexto:
                "La marca {marca} publica en {canal_principal} con recursos limitados: 1 creador, 6 horas semanales. El objetivo del mes es subir el engagement rate del 1,2 % al 2,5 %.",
              tarea: "Construir el calendario de 30 días con pilares de contenido, formato por publicación, guion base reutilizable y sistema de reciclaje de contenido.",
              especificaciones:
                "Tabla: día, pilar, formato, idea en 1 línea, CTA. Máximo 3 pilares. Incluir 4 plantillas de guion reutilizables y regla de reciclaje (cada contenido vive 3 veces).",
              ejemplos:
                "Pilar «errores del sector» · Martes · Carrusel · «Los 3 errores que vemos cada semana en {marca}» → CTA: «Guarda esto antes de tu próximo lanzamiento».",
            }
          ),
        ],
      },
      {
        id: "email",
        nombre: "Email & CRM",
        plantillas: [
          P(
            "mkt-03",
            "Secuencia de nurturing de 5 correos",
            "De lead frío a demo agendada",
            {
              rol: "Email marketer con tasas medias de apertura del 48 %; especialista en secuencias de nurturing para {segmento}.",
              contexto:
                "Los leads de {segmento} llegan fríos desde un lead magnet sobre {producto}. La tasa actual de conversión a demo es 3 %; el objetivo es llegar a 8 % en 60 días.",
              tarea: "Escribir la secuencia completa de 5 correos (asunto + cuerpo), con objetivo de conversión por correo y regla de cadencia entre envíos.",
              especificaciones:
                "Cada correo: asunto (< 45 caracteres), preview text, cuerpo ≤ 180 palabras, 1 solo CTA. Progreso narrativo: problema → costo de no actuar → prueba → objeción → oferta. Incluir 2 líneas A/B de asunto por correo.",
              ejemplos:
                "Correo 2 (costo): asunto «Lo que cuesta un mes sin resolverlo» → cuerpo con cálculo simple del costo del status quo → CTA: respuesta al correo (no link).",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "sal",
    nombre: "Salud",
    desc: "Gestión clínica, indicadores y bienestar",
    subtemas: [
      {
        id: "gestion",
        nombre: "Gestión clínica",
        plantillas: [
          P(
            "sal-01",
            "Protocolo de triage y priorización",
            "Flujo de atención seguro y auditable",
            {
              rol: "Consultora en gestión clínica con experiencia en servicios de {especialidad} con volumen de {volumen_pacientes} pacientes/día.",
              contexto:
                "El servicio de {especialidad} atiende {volumen_pacientes} pacientes diarios con 2 enfermeras en triage. Se han reportado 3 incidentes de priorización errónea en el trimestre.",
              tarea: "Diseñar el protocolo de triage: escala de 5 niveles con criterios observables, tiempos máximos de atención por nivel, árbol de decisión de escalación y registro auditable.",
              especificaciones:
                "Criterios sin interpretación subjetiva (signos, no impresiones). Incluir: tabla de niveles, flujograma de escalación en texto, formato de registro y plan de capacitación de 2 sesiones.",
              ejemplos:
                "Nivel 2 (emergencia, < 10 min): «SpO2 < 92 %, dolor torácico en curso, Glasgow < 14» → acción: box inmediato + aviso médico verbal obligatorio.",
            }
          ),
          P(
            "sal-02",
            "Informe narrativo de indicadores clínicos",
            "Datos que la dirección entiende y actúa",
            {
              rol: "Analista de indicadores en salud, experto en convertir tablas clínicas en narrativa de decisión.",
              contexto:
                "La dirección recibe mensualmente los indicadores {indicadores} del periodo {periodo}, pero el informe actual es una tabla sin lectura; ninguna decisión se toma a partir de él.",
              tarea: "Transformar los indicadores en un informe narrativo de 1 página: 3 hallazgos clave, tendencia por indicador, alertas y 2 decisiones recomendadas con su responsable.",
              especificaciones:
                "Cada hallazgo: dato → interpretación → acción. Prohibido listar más de 6 indicadores. Formato: titular ejecutivo, 3 hallazgos, semáforo visual en texto, decisiones con dueño y fecha.",
              ejemplos:
                "Hallazgo: «Reingresos a 30 días subieron de 4,1 % a 5,8 % (+1,7 pp). Driver: egresos de fin de semana sin cita de control. Acción: agenda de control a 72 h para egresos de sáb-dom».",
            }
          ),
        ],
      },
      {
        id: "bienestar",
        nombre: "Bienestar",
        plantillas: [
          P(
            "sal-03",
            "Plan de hábitos sostenible",
            "Cambio de conducta realista, no heroico",
            {
              rol: "Coach de hábitos con formación en psicología conductual; alérgico a los planes heroicos de enero.",
              contexto:
                "La persona busca {objetivo_salud} y dispone de {horas_disponibles} horas semanales reales. Ha fallado 3 intentos previos por planes demasiado ambiciosos.",
              tarea: "Diseñar un plan de 8 semanas con 1 solo hábito ancla, sistema de mínimos viables, registro semanal y regla de recuperación tras fallos.",
              especificaciones:
                "Semana a semana: hábito, versión mínima (2 min), versión completa, disparador contextual. Incluir «contrato de 2 líneas» y métrica única de éxito. Prohibido recomendar más de 1 hábito nuevo a la vez.",
              ejemplos:
                "Semana 3: hábito ancla «caminar tras almorzar» · mínima: 5 min a la manzana · completa: 25 min · disparador: «al colgar la servilleta, zapatos puestos».",
            }
          ),
        ],
      },
    ],
  },
];

/* ── Nichos rentables ──────────────────────────────────────────────────────── */

export interface Nicho {
  id: string;
  titulo: string;
  nicho: string;
  ticket: string;
  demanda: number; // 1–5
  dificultad: "Baja" | "Media" | "Alta";
  desc: string;
  campos: CamposRCTEE;
}

export const RENTABLES: Nicho[] = [
  {
    id: "r1",
    titulo: "Pack de auditoría de contratos",
    nicho: "Legal Tech",
    ticket: "$45–90 / pack",
    demanda: 5,
    dificultad: "Media",
    desc: "Checklist + matriz de riesgos contractuales para estudios jurídicos pequeños y startups sin abogado in-house.",
    campos: {
      rol: "Abogado corporativo senior con 15 años revisando contratos comerciales para startups de la región.",
      contexto:
        "Un estudio jurídico pequeño (3 abogados) recibe cada mes ~20 contratos de clientes startup que no saben priorizar. Necesitan un producto empaquetable: auditoría express de contratos de servicios SaaS con entregable estándar y precio cerrado.",
      tarea: "Crear el entregable completo de auditoría express: checklist de 25 puntos por nivel de riesgo, matriz de hallazgos y plantilla de informe final de 2 páginas para el cliente.",
      especificaciones:
        "Estructura: checklist agrupado (crítico/alto/medio), matriz con columnas hallazgo-riesgo-acción, informe final con semáforo ejecutivo. Tono formal pero legible por no abogados. Entregable reutilizable sin edición.",
      ejemplos:
        "Hallazgo crítico: «Renovación automática sin ventana de denuncia» → Riesgo alto → Acción: «Negociar ventana de 60 días; si se niegan, cotizar precio por permanencia forzada».",
    },
  },
  {
    id: "r2",
    titulo: "Informes de crédito PyME",
    nicho: "Fintech / Banca",
    ticket: "$120 / informe",
    demanda: 4,
    dificultad: "Alta",
    desc: "Dictámenes de riesgo crediticio listos para comité, para financieras no bancarias sin equipo de riesgos.",
    campos: {
      rol: "Analista de riesgos crediticios senior, 12 años en banca comercial, especializado en scoring PyME.",
      contexto:
        "Una financiera no bancaria otorga 30 créditos PyME al mes y no tiene analista de riesgos propio. Requiere un informe de riesgo estandarizado por solicitud que su comité pueda aprobar sin lectura técnica profunda.",
      tarea: "Diseñar el informe de riesgo estandarizado: estructura fija, ratios mínimos requeridos, escala de dictamen (aprobar/condicionar/rechazar) y guía de llenado de 1 página.",
      especificaciones:
        "El informe debe caber en 3 páginas: resumen ejecutivo de 120 palabras, tabla de 8 ratios, 5 factores de riesgo con mitigantes, dictamen con condiciones. Incluir 1 ejemplo completo con datos ficticios.",
      ejemplos:
        "Ratio cobertura de servicio de deuda < 1,2 → dictaminar «condicional» automático con garantías adicionales del 25 % del monto.",
    },
  },
  {
    id: "r3",
    titulo: "Listings inmobiliarios premium",
    nicho: "Real Estate",
    ticket: "$35 / listing",
    demanda: 5,
    dificultad: "Baja",
    desc: "Fichas de venta persuasivas con datos duros para agencias que publican en portales saturados.",
    campos: {
      rol: "Copywriter inmobiliario especializado en listings de alta conversión en portales saturados.",
      contexto:
        "Una agencia publica 25 listings mensuales en portales donde compite con 40+ anuncios similares. Su tasa de contacto por visita al anuncio es 1,8 %; el benchmark del sector es 3,5 %. Necesita un formato de ficha estandarizado y persuasivo.",
      tarea: "Crear la plantilla maestra de listing: estructura de titular, 3 bloques de descripción (enganche, estilo de vida, datos duros), cierre con CTA y 3 ejemplos aplicados a departamentos, casas y locales.",
      especificaciones:
        "Prohibido vocabulario cliché («acogedor», «oportunidad única»). Cada ficha con 5 datos duros verificables. Titular ≤ 60 caracteres. Entrega: plantilla + guía de uso de 1 página para los agentes.",
      ejemplos:
        "Antes: «Hermoso departamento con hermosa vista». Después: «Piso 11 con poniente libre: 2 horas de sol directo que la torre de enfrente no podrá quitarle».",
    },
  },
  {
    id: "r4",
    titulo: "Secuencias de email e-commerce",
    nicho: "E-commerce",
    ticket: "$200 / flujo",
    demanda: 4,
    dificultad: "Media",
    desc: "Flujos de abandono de carrito y post-compra que recuperan 8–15 % de ingresos perdidos.",
    campos: {
      rol: "Email marketer especializado en e-commerce con historial de recuperación del 12 % en carritos abandonados.",
      contexto:
        "Una tienda online de 8.000 visitas/mes abandona el 71 % de sus carritos. No tiene flujos automatizados: solo envía un correo genérico de descuento. El objetivo es recuperar al menos 8 % de los carritos en 90 días sin erosionar margen con descuentos.",
      tarea: "Escribir el flujo completo de carrito abandonado (4 correos) y el flujo de post-compra (3 correos), con asunto, cuerpo, cadencia y lógica de descuento progresivo.",
      especificaciones:
        "Cuerpos ≤ 150 palabras, 1 CTA por correo. Descuento solo en correo 3 y 4 (10 % máx.). Incluir línea A/B de asunto por correo y condiciones de supresión (quién NO recibe el correo).",
      ejemplos:
        "Correo 1 (hora 1): sin descuento, asunto «¿Se te cayó el wifi o el entusiasmo?» → recordatorio del beneficio del producto, no del precio.",
    },
  },
  {
    id: "r5",
    titulo: "Planeación docente por competencias",
    nicho: "EdTech",
    ticket: "$25 / pack",
    demanda: 3,
    dificultad: "Baja",
    desc: "Secuencias didácticas y rúbricas listas para docentes saturados de carga administrativa.",
    campos: {
      rol: "Diseñadora instruccional con 10 años creando planeaciones por competencias para docentes de secundaria.",
      contexto:
        "Los docentes de una red de 12 escuelas dedican 6 horas semanales a planeación administrativa. La dirección quiere un banco de secuencias didácticas editables por asignatura que reduzca ese tiempo a 2 horas sin sacrificar calidad pedagógica.",
      tarea: "Crear el pack base: 1 secuencia didáctica modelo de 5 sesiones, 1 rúbrica analítica de 4 criterios y la guía de adaptación de 1 página para que cada docente la ajuste a su grupo.",
      especificaciones:
        "Formato tabla por sesión: actividad, tiempo, producto, evaluación formativa. Rúbrica con descriptores observables (sin adjetivos vagos). Guía de adaptación en 5 pasos. Todo editable en Google Docs.",
      ejemplos:
        "Adaptación paso 2: «Sustituye el caso de apertura por uno del contexto local de tu grupo; mantén la misma estructura de pregunta detonadora».",
    },
  },
  {
    id: "r6",
    titulo: "Memorandos ejecutivos para CFOs",
    nicho: "SaaS B2B",
    ticket: "$150 / mes",
    demanda: 3,
    dificultad: "Alta",
    desc: "Conversión de tableros financieros en memos de decisión de 1 página, en suscripción mensual.",
    campos: {
      rol: "Redactor financiero ejecutivo: convierte dashboards en memos que los CFOs usan para decidir en 5 minutos.",
      contexto:
        "Una scale-up SaaS genera 14 reportes financieros mensuales que nadie lee completos. El CFO pierde 3 horas al mes reinterpretándolos para el comité. Busca un servicio que convierta los reportes clave en memos ejecutivos de decisión.",
      tarea: "Definir el servicio: formato estándar del memo (1 página), protocolo de insumos que el cliente entrega, SLA de entrega y 1 memo de muestra sobre métricas SaaS (MRR, churn, CAC/LTV).",
      especificaciones:
        "Memo: titular de decisión, 3 hallazgos (dato→lectura→acción), semáforo, decisión solicitada al comité. Protocolo de insumos en 5 líneas. SLA: 48 h. Incluir precio sugerido y anclaje de valor.",
      ejemplos:
        "Hallazgo: «Churn neto 3,9 % (+0,7 pp): 62 % de las bajas ocurren en el mes 2» → Acción: «Onboarding asistido para cuentas < 60 días» → Decisión: aprobar piloto de $4K.",
    },
  },
  {
    id: "r7",
    titulo: "Protocolos de atención clínica",
    nicho: "Salud privada",
    ticket: "$90 / protocolo",
    demanda: 3,
    dificultad: "Media",
    desc: "Protocolos de triage y flujo de pacientes para clínicas privadas en crecimiento.",
    campos: {
      rol: "Consultora en gestión clínica con 9 años optimizando flujos de atención en clínicas privadas de 5–20 consultorios.",
      contexto:
        "Una clínica privada de 8 consultorios creció 40 % en pacientes y su recepción colapsa entre 11:00 y 13:00. Los tiempos de espera pasaron de 15 a 45 minutos y las reseñas negativas mencionan «desorganización» en el 60 % de los casos.",
      tarea: "Diseñar el protocolo de recepción y triage: flujo de llegada, criterios de priorización de 4 niveles, guion de contención para esperas largas y tablero de indicadores semanal.",
      especificaciones:
        "Flujo en pasos numerados con responsable por paso. Criterios de prioridad observables (motivo, no percepción). Guion de contención en frases literales. Tablero con 5 indicadores y meta por indicador.",
      ejemplos:
        "Nivel 1 (prioridad inmediata): «sangrado activo, dolor torácico, dificultad respiratoria» → pasa a consultorio en < 5 min sin trámite administrativo previo.",
    },
  },
  {
    id: "r8",
    titulo: "Guiones de ventas high-ticket",
    nicho: "Servicios profesionales",
    ticket: "$60 / guion",
    demanda: 4,
    dificultad: "Media",
    desc: "Guiones de llamada de descubrimiento y cierre para servicios de $2K+ con objeciones mapeadas.",
    campos: {
      rol: "Closer de ventas high-ticket con 7 años cerrando servicios de consultoría de $2K–$15K por llamada.",
      contexto:
        "Una consultora vende programas de $4.500 y cierra hoy el 12 % de sus llamadas de descubrimiento. El benchmark del equipo top interno es 28 %. Los consultores técnicos improvisan la llamada y ceden descuentos del 20 % ante la primera objeción de precio.",
      tarea: "Escribir el guion completo de llamada de 45 minutos: apertura de marco, 8 preguntas de descubrimiento en orden, transición a oferta, manejo de las 5 objeciones frecuentes y cierre con próximos pasos.",
      especificaciones:
        "Frases literales entre comillas, con la intención de cada bloque entre corchetes. Prohibido mencionar precio antes del minuto 30. Política de descuentos: 0 %; alternativa de plan de pagos. Incluir métricas de llamada a registrar.",
      ejemplos:
        "Objeción «está caro» → «Entiendo, Ana. Caro comparado con qué, ¿con no resolverlo otro trimestre? Hagamos el número: [silencio de 4 segundos]».",
    },
  },
];

/* ── Inteligencia de mercado ───────────────────────────────────────────────── */

export const MERCADO_DEMANDA = [
  { sector: "Legal Tech", indice: 92, crecimiento: "+34 %", ticket: "$45–90" },
  { sector: "SaaS B2B", indice: 90, crecimiento: "+41 %", ticket: "$150–400" },
  { sector: "Fintech / Banca", indice: 88, crecimiento: "+29 %", ticket: "$120–250" },
  { sector: "Real Estate", indice: 84, crecimiento: "+22 %", ticket: "$25–60" },
  { sector: "E-commerce", indice: 81, crecimiento: "+27 %", ticket: "$180–350" },
  { sector: "Educación", indice: 76, crecimiento: "+18 %", ticket: "$20–45" },
  { sector: "Salud privada", indice: 73, crecimiento: "+15 %", ticket: "$80–150" },
  { sector: "Agroindustria", indice: 61, crecimiento: "+12 %", ticket: "$60–120" },
];

export const MERCADO_TIERS = [
  {
    nombre: "Analista freelance",
    rango: "$15–40 por prompt",
    badge: "Entrada",
    badgeColor: "cobalt",
    incluye: ["Packs de prompts por nicho", "Entrega en 24–48 h", "Marketplaces y referidos"],
  },
  {
    nombre: "Consultor R-C-T-E-E",
    rango: "$90–250 por paquete",
    badge: "Consolidado",
    badgeColor: "jade",
    incluye: ["Auditoría + plantillas + capacitación", "Contratos marco mensuales", "Clientes corporativos medianos"],
  },
  {
    nombre: "Partner Enterprise",
    rango: "$1.5K–6K por mes",
    badge: "Escala",
    badgeColor: "ember",
    incluye: ["Biblioteca de prompts a medida", "SLA y versionado de prompts", "Integración con flujos del cliente"],
  },
];

export const MERCADO_SENALES = [
  { texto: "Las empresas pasan de «probar IA» a exigir prompts auditables y versionados", delta: "+41 %", dir: "up" },
  { texto: "La validación de contexto (≥ 80 caracteres con datos) se vuelve estándar de calidad", delta: "+27 %", dir: "up" },
  { texto: "Cae la demanda de prompts genéricos de un solo uso", delta: "−19 %", dir: "down" },
  { texto: "Sube el pago por plantillas con variables dinámicas por sector", delta: "+33 %", dir: "up" },
  { texto: "Los equipos legales piden cláusulas de propiedad intelectual sobre prompts", delta: "+24 %", dir: "up" },
];
