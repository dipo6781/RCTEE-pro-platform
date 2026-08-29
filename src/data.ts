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
  {
    id: "tec",
    nombre: "Tecnología",
    desc: "Software, soporte y producto digital",
    subtemas: [
      {
        id: "desarrollo",
        nombre: "Desarrollo de software",
        plantillas: [
          P(
            "tec-01",
            "Especificación técnica de feature",
            "PRD técnico que evita retrabajo en el sprint",
            {
              rol: "Tech lead con 10 años en producto SaaS B2B; especialista en especificaciones que eliminan ambigüedad.",
              contexto:
                "El equipo de {nombre_equipo} debe entregar {feature} en un sprint de {duracion_sprint}. Hoy las specs llegan como frases sueltas y el 30 % del sprint se pierde en aclaraciones.",
              tarea: "Redactar la especificación técnica: problema, criterios de aceptación en Given-When-Then, decisiones de diseño, no-objetivos, dependencias con owner y riesgos.",
              especificaciones:
                "Mínimo 4 criterios de aceptación; sección de no-objetivos obligatoria; cada dependencia con responsable y fecha. Prohibido «debería funcionar bien».",
              ejemplos:
                "Criterio: «Given usuario en plan básico, When exporta más de 1.000 filas, Then el sistema encola la tarea y notifica por email al terminar».",
            }
          ),
          P(
            "tec-02",
            "Code review con rúbrica",
            "Revisiones consistentes, rápidas y formativas",
            {
              rol: "Ingeniera staff que usa el code review como herramienta de calidad y mentoría, no como trámite.",
              contexto:
                "En {nombre_equipo} las revisiones no tienen criterio común: unas tardan 4 horas, otras 4 minutos. Se busca un estándar auditable sin burocratizar el flujo.",
              tarea: "Definir la rúbrica de revisión: niveles de severidad con acción requerida, checklist por tipo de cambio (feature, hotfix, refactor) y SLA de respuesta, más 5 comentarios modelo.",
              especificaciones:
                "Severidades blocker/major/minor/nit definidas en una línea cada una. SLA de primera respuesta < 4 h hábiles. Comentarios modelo con patrón problema → impacto → sugerencia.",
              ejemplos:
                "Comentario major: «Este catch silencioso oculta fallos de red: propone reintento con backoff o un error accionable para el usuario».",
            }
          ),
        ],
      },
      {
        id: "soporte",
        nombre: "Soporte técnico",
        plantillas: [
          P(
            "tec-03",
            "Protocolo de escalamiento a nivel 2",
            "Escalamientos con criterio, no por pánico",
            {
              rol: "Gerente de soporte con 8 años operando mesas escalonadas en productos SaaS de alto volumen.",
              contexto:
                "Los tickets de {producto_software} crecieron {porcentaje_crecimiento} % y el 40 % de los casos de nivel 1 se escalan sin diagnóstico previo, saturando a ingeniería.",
              tarea: "Diseñar el protocolo de escalamiento: criterios objetivos de paso a nivel 2, información mínima obligatoria del ticket y SLA por severidad.",
              especificaciones:
                "Matriz severidad × criterio × SLA; plantilla de escalamiento con 6 campos obligatorios; 3 ejemplos de escalamiento correcto vs incorrecto.",
              ejemplos:
                "Correcto: «Error 500 reproducible, ID de correlación, pasos documentados y log adjunto». Incorrecto: «no funciona, urge».",
            }
          ),
          P(
            "tec-04",
            "Artículo de base de conocimiento",
            "Self-service que reduce tickets repetidos",
            {
              rol: "Technical writer con experiencia en bases de conocimiento que desvían el 30 % de los tickets.",
              contexto:
                "El 25 % de los tickets de {producto_software} son variantes del mismo problema: {problema_frecuente}. No existe artículo de autoayuda y el equipo repite la respuesta a diario.",
              tarea: "Escribir el artículo de resolución: diagnóstico en 3 preguntas, solución paso a paso, causas raíz y cuándo escalar.",
              especificaciones:
                "Lenguaje para usuario no técnico; máximo 500 palabras; pasos numerados sin saltos; incluir sección «Si esto no funcionó» con datos a recopilar antes de contactar soporte.",
              ejemplos:
                "Paso 3: «Abre Configuración → Sincronización y pulsa Forzar resincronización; el proceso tarda 90 segundos y no debes cerrar la app».",
            }
          ),
        ],
      },
    ],
  },
  {
    id: "rrhh",
    nombre: "RRHH",
    desc: "Reclutamiento, cultura y retención de talento",
    subtemas: [
      {
        id: "reclutamiento",
        nombre: "Reclutamiento",
        plantillas: [
          P(
            "rrh-01",
            "Descripción de puesto estructurada",
            "Vacantes que filtran en vez de inflar la tubería",
            {
              rol: "Especialista en atracción de talento con 9 años escribiendo vacantes que atraen perfiles calificados y disuaden a los que no encajan.",
              contexto:
                "La vacante de {puesto} en {empresa} recibe 400 aplicaciones y solo 8 califican; el equipo pierde 20 horas semanales filtrando CVs que no cumplen lo esencial.",
              tarea: "Redactar la descripción de puesto: propósito en 2 líneas, 5 responsabilidades con entregable, requisitos separados en esenciales vs deseables, y 3 señales de éxito a 6 meses.",
              especificaciones:
                "Máximo 600 palabras; cero lenguaje genérico («proactivo» sin definición); incluir rango salarial o justificación de omisión; tono directo.",
              ejemplos:
                "Señal de éxito 6 meses: «Ha llevado 2 features a producción sin rollbacks mayores y mentoriza a un junior del equipo».",
            }
          ),
          P(
            "rrh-02",
            "Entrevista técnica con rúbrica",
            "Evaluaciones comparables entre entrevistadores",
            {
              rol: "Engineering manager que calibró su proceso de entrevistas para reducir el sesgo entre evaluadores.",
              contexto:
                "Para el puesto de {puesto}, tres entrevistadores evalúan con criterios distintos: un candidato recibe «fuerte» de uno y «débil» de otro por la misma entrevista.",
              tarea: "Diseñar la entrevista técnica de 60 minutos: agenda por bloques, 4 ejercicios con rúbrica de 4 niveles y preguntas de sondeo por competencia.",
              especificaciones:
                "Cada ejercicio con resultado esperado y señales de nivel alto/medio/bajo. Prohibidos los acertijos sin relación con el trabajo real. Incluir guía de calibración de 1 página.",
              ejemplos:
                "Señal alta en diseño: «Pregunta por restricciones de escala antes de proponer arquitectura; menciona trade-offs sin que se le pidan».",
            }
          ),
        ],
      },
      {
        id: "cultura",
        nombre: "Cultura & retención",
        plantillas: [
          P(
            "rrh-03",
            "Onboarding 30-60-90",
            "Incorporaciones que retienen el talento nuevo",
            {
              rol: "People operations lead con programas de onboarding que redujeron la rotación temprana del 22 % al 9 %.",
              contexto:
                "En {empresa}, el 18 % de las contrataciones de {area} renuncia antes del mes 4; las salidas mencionan «falta de claridad sobre expectativas» como causa principal.",
              tarea: "Diseñar el plan de onboarding 30-60-90: hitos de aprendizaje, entregas esperadas por periodo, rituales de feedback y red de contactos internos asignada.",
              especificaciones:
                "Cada periodo con 3 hitos medibles y 1 entrega visible; buddy asignado desde el día 1; checkpoints de feedback en días 15, 45 y 80 con guion de conversación.",
              ejemplos:
                "Día 30: «Haber cerrado su primer ticket de punta a punta en producción, con revisión de su buddy y demo de 10 minutos al equipo».",
            }
          ),
          P(
            "rrh-04",
            "Encuesta de clima y plan de acción",
            "Datos de clima convertidos en decisiones",
            {
              rol: "Consultora de cultura organizacional experta en convertir encuestas de clima en planes que sí se ejecutan.",
              contexto:
                "El clima de {empresa} (240 personas) se mide cada año y cada año los resultados se archivan: la participación cayó del 84 % al 57 % porque «nada cambia».",
              tarea: "Diseñar la encuesta de 12 preguntas por dimensión, el protocolo de lectura de resultados y un plan de acción con owners, presupuesto y fecha de revisión.",
              especificaciones:
                "Máximo 12 preguntas en escala 1-5 + 2 abiertas; resultados por equipo con mínimo 5 respuestas para anonimato; máximo 3 iniciativas priorizadas, no 20.",
              ejemplos:
                "Dimensión claridad: «Sé exactamente qué se espera de mi trabajo en los próximos 3 meses» → si < 3,5: iniciativa de OKRs visibles con owner y fecha.",
            }
          ),
        ],
      },
    ],
  },
];

/* ── Sistema de Extensiones · módulos opcionales de plantillas ─────────────── */

export interface ExtensionDef {
  id: string;
  nombre: string;
  version: string;
  desc: string;
  hex: string;
  icono: string;
  temaDestino: string;
  subtema: Subtema;
}

export const EXTENSIONES: ExtensionDef[] = [
  {
    id: "ext-whatsapp",
    nombre: "WhatsApp Business",
    version: "1.2",
    desc: "Comercio conversacional: recuperación de carritos, cierre por catálogo y respuestas guardadas.",
    hex: "#128c7e",
    icono: "wa",
    temaDestino: "mkt",
    subtema: {
      id: "wa-conversacional",
      nombre: "Comercio conversacional",
      plantillas: [
        P(
          "wa-01",
          "Recuperación de carrito por WhatsApp",
          "Secuencia de 3 toques sin sonar a spam",
          {
            rol: "Especialista en comercio conversacional con 6 años recuperando carritos vía WhatsApp sin bloqueos de cuenta ni quejas de spam.",
            contexto:
              "La tienda de {producto} abandona el 74 % de sus carritos. El cliente ya dio su número en checkout pero no compró. Hay una ventana legal de 24 h para escribirle tras su última interacción y un descuento máximo autorizado de {descuento_max} %.",
            tarea: "Escribir la secuencia de 3 mensajes de recuperación (hora 1, hora 24, hora 72) con personalización por {nombre_cliente}, prueba social y cierre directo al pago.",
            especificaciones:
              "Cada mensaje en 3 burbujas máximas de 3 líneas. El descuento solo aparece en el mensaje 3. Prohibido el texto-wall y los emojis en cadena. Incluir las condiciones de supresión: quién NO recibe el mensaje 2.",
            ejemplos:
              "Mensaje 1 (h1): «{nombre_cliente}, tu {producto} sigue apartado 🙌 ¿Te quedó alguna duda con el envío?» → sin descuento, abre conversación.",
          }
        ),
        P(
          "wa-02",
          "Guion de cierre por catálogo",
          "Convierte el chat en pedido con el catálogo en pantalla",
          {
            rol: "Closer de ventas por WhatsApp para comercios de {rubro} con ticket promedio de {ticket_promedio}; cierro mostrando el catálogo, no recitando precios.",
            contexto:
              "El equipo de 3 vendedores atiende 90 chats diarios y cierra el 9 %. El cliente llega frío desde un anuncio y el catálogo de WhatsApp ya está configurado con fotos y precios, pero nadie lo usa como herramienta de cierre.",
            tarea: "Diseñar el guion de cierre en 5 pasos: calificación en 2 preguntas, anclaje con el catálogo, comparación de 2 opciones, manejo de «está caro» y cierre con {metodo_pago}.",
            especificaciones:
              "Incluir el momento exacto para enviar el link del catálogo (no antes del minuto 2). Frases literales entre comillas. Cierre con link de pago o transferencia, nunca «avísame si te interesa».",
            ejemplos:
              "Comparación: «Mira, el modelo A es el que más sale [catálogo, ítem 4]; el B tiene garantía extendida. ¿Cuál se parece más a lo que buscabas?» → pregunta binaria, no abierta.",
          }
        ),
        P(
          "wa-03",
          "Respuestas guardadas y menú de atención",
          "Respuestas en 30 segundos, 24/7",
          {
            rol: "Operadora de atención al cliente por WhatsApp que estandarizó el servicio de {negocio}: 90 % de consultas resueltas sin intervención humana.",
            contexto:
              "{negocio} recibe 60 consultas diarias repetitivas (horarios, envíos, cambios) y tarda 45 minutos en responder porque cada agente redacta desde cero. El horario real es {horario} y el punto de retiro es {ubicacion}.",
            tarea: "Construir el set de 10 respuestas guardadas con atajos (/envio, /horario, /cambio…) + el mensaje de bienvenida con menú numerado de opciones + el mensaje fuera de horario.",
            especificaciones:
              "Cada respuesta: atajo, texto final con variables entre corchetes, y regla de escalamiento a humano. El menú de bienvenida con máximo 5 opciones numeradas. Tono cálido pero sin diminutivos.",
            ejemplos:
              "Atajo /envio → «¡Hola! 🚚 Hacemos envíos a todo el país en 24–72 h. El costo se calcula en checkout según tu código postal. ¿Me pasas el tuyo y te cotizo al instante?»",
          }
        ),
      ],
    },
  },
  {
    id: "ext-legal",
    nombre: "Legal Shield",
    version: "1.0",
    desc: "Protección avanzada: cláusula LGPD, NDA mutuo y términos SaaS con SLA ejecutable.",
    hex: "#475569",
    icono: "shield",
    temaDestino: "leg",
    subtema: {
      id: "ls-proteccion",
      nombre: "Protección de datos",
      plantillas: [
        P(
          "ls-01",
          "Cláusula de tratamiento de datos",
          "Cumplimiento LGPD/GDPR listo para contrato",
          {
            rol: "Abogada de privacidad de datos con 9 años redactando cláusulas de tratamiento conforme a la normativa de {pais} y auditorías de cumplimiento.",
            contexto:
              "{empresa} firma contratos de servicio que incluyen acceso a datos personales de clientes del contratante, pero sus contratos actuales no mencionan el tratamiento de datos. La primera auditoría de un cliente enterprise es en 60 días.",
            tarea: "Redactar la cláusula completa de tratamiento de datos: definiciones, finalidad limitada a {finalidad_datos}, obligaciones del encargado, subencargados, notificación de incidentes en 72 h y devolución/destrucción al término.",
            especificaciones:
              "Lenguaje contractual ejecutable, numeración correlativa para insertar en contrato marco. Prohibido copiar literalmente artículos de ley sin referencia. Incluir nota de negociación: qué puntos son innegociables.",
            ejemplos:
              "Incidentes: «El Encargado notificará al Responsable en un plazo máximo de 72 horas desde la detección, indicando naturaleza, categorías de datos afectados y medidas de contención aplicadas».",
          }
        ),
        P(
          "ls-02",
          "NDA mutuo para alianzas",
          "Confidencialidad balanceada en 2 páginas",
          {
            rol: "Abogado corporativo especializado en acuerdos de confidencialidad para alianzas tecnológicas; 14 años, más de 300 NDAs negociados.",
            contexto:
              "{parte_a} y {parte_b} exploran una alianza comercial que implica compartir roadmap, precios y datos de clientes durante la evaluación. Se requiere un NDA mutuo de {vigencia_anios} años que ninguna de las dos partes sienta desbalanceado.",
            tarea: "Redactar el NDA mutuo completo: definición de información confidencial con 5 exclusiones estándar, obligaciones de cuidado razonable, plazo de confidencialidad, remedios por incumplimiento y ley aplicable.",
            especificaciones:
              "Máximo 2 páginas. Cláusulas espejo: lo que aplica a una parte aplica a la otra. Incluir la exclusión de información ya pública y desarrollo independiente. Señalar 2 «trampas» comunes en NDAs de la contraparte.",
            ejemplos:
              "Exclusión estándar: «Información que la Parte Receptora pueda demostrar que desarrolló independientemente, sin uso ni referencia a la Información Confidencial de la Parte Reveladora».",
          }
        ),
        P(
          "ls-03",
          "Términos de uso SaaS con SLA",
          "ToS que el enterprise acepta sin renegociar",
          {
            rol: "Abogada de producto SaaS que redacta términos de uso aprobados por comités de compras enterprise; 11 años en software B2B.",
            contexto:
              "{saas} vende a empresas medianas y su área legal recibe 5 revisiones contractuales al mes porque los términos actuales generan dudas de seguridad y disponibilidad. El objetivo de disponibilidad comprometido es {disponibilidad_objetivo} % y la jurisdicción es {jurisdiccion}.",
            tarea: "Redactar los términos de uso: licencia de uso, SLA con créditos de servicio escalonados, propiedad intelectual del contenido del cliente, limitación de responsabilidad, suspensión por impago y terminación con portabilidad de datos.",
            especificaciones:
              "SLA en tabla: disponibilidad × crédito × mecanismo de reclamo. Prohibido lenguaje unilateral abusivo («podemos cambiar todo en cualquier momento» sin aviso). Incluir cláusula de portabilidad de datos en 30 días.",
            ejemplos:
              "SLA: «< 99.0 % mensual → crédito del 10 % de la factura del mes; < 95.0 % → crédito del 30 % y derecho de terminación sin penalidad».",
          }
        ),
      ],
    },
  },
  {
    id: "ext-kpi",
    nombre: "KPIs Avanzados",
    version: "2.0",
    desc: "Analítica ejecutiva: forecast de caja 13 semanas, cohortes de retención y tablero OKR.",
    hex: "#e11d48",
    icono: "gauge",
    temaDestino: "fin",
    subtema: {
      id: "kpi-analitica",
      nombre: "Analítica ejecutiva",
      plantillas: [
        P(
          "kpi-01",
          "Forecast de caja a 13 semanas",
          "El tablero semanal que evita la sorpresa de caja",
          {
            rol: "Tesorero corporativo con 13 años gestionando liquidez; experto en forecasts rodantes de 13 semanas que la dirección realmente usa.",
            contexto:
              "{empresa} opera con visibilidad de caja de solo 2 semanas y ha sufrido 2 sorpresas de liquidez este año. Su ciclo de cobro es de {ciclo_cobro_dias} días y el runway actual es de {runway_meses} meses al ritmo de gasto vigente.",
            tarea: "Diseñar el forecast de caja a 13 semanas: estructura de entradas/salidas por categoría, supuestos por línea, semáforo de alertas y el ritual semanal de actualización de 30 minutos.",
            especificaciones:
              "Plantilla en formato tabla semanal (13 columnas). Cada categoría con su driver (no montos fijos). Semáforo: rojo si caja proyectada < 6 semanas de gastos fijos. Incluir 3 escenarios: base, pesimista (−20 % cobros), optimista.",
            ejemplos:
              "Línea modelo: «Cobros = facturación semana N−{ciclo_cobro_dias}/7 × probabilidad de cobro 92 %; ajustar manualmente los 10 clientes top por fecha prometida».",
          }
        ),
        P(
          "kpi-02",
          "Análisis de cohortes de retención",
          "Retención mes a mes sin engañarse con promedios",
          {
            rol: "Analista de producto especializado en cohortes de retención para {producto}; convierto tablas de cohortes en decisiones de roadmap.",
            contexto:
              "{producto} reporta una retención promedio del 78 %, pero el número esconde que los clientes que llegan por el canal de descuentos abandonan al doble de velocidad. Se analizarán las cohortes desde {cohorte_inicial} durante {meses_analisis} meses.",
            tarea: "Construir el análisis de cohortes: matriz mes 0 a {meses_analisis} por cohorte mensual, curva de retención por canal de adquisición, identificación del punto de estabilización y 3 hipótesis accionables.",
            especificaciones:
              "Matriz con colores por intensidad (verde > 70 %, ámbar 50–70 %, rojo < 50 %). Prohibido el promedio simple como métrica única. Incluir definición exacta de «activo» y las cohortes mínimas por canal para que sean comparables (n ≥ 30).",
            ejemplos:
              "Lectura modelo: «La cohorte de marzo cae al 41 % en el mes 2 vs 58 % del benchmark interno; driver: 70 % de esa cohorte entró por la promo de −40 %».",
          }
        ),
        P(
          "kpi-03",
          "Tablero OKR trimestral",
          "Objetivos que se revisan, no que se archivan",
          {
            rol: "Coach de OKRs con 8 años implementando el sistema en empresas de {empresa} a escala; alérgico a los OKRs de decoración.",
            contexto:
              "{empresa} definirá {objetivo_principal} como prioridad del trimestre con {equipos} equipos participando. En los 2 ciclos previos, el 60 % de los key results quedaron sin actualizar después de la semana 3 y la revisión trimestral se canceló.",
            tarea: "Diseñar el tablero OKR del trimestre: 2–3 objetivos por equipo con 3 resultados clave medibles cada uno, sistema de semáforo semanal, plantilla de check-in de 15 minutos y reglas de cierre de ciclo.",
            especificaciones:
              "Cada KR: métrica, línea base, meta y owner. Prohibido KRs binarios («lanzar X»); todo con número. Check-in semanal: qué movió la métrica, qué se bloquea, qué se pide. Incluir la pregunta anti-decoración del cierre: «¿cambiamos alguna decisión con esto?».",
            ejemplos:
              "KR modelo: «Reducir churn mensual de 3,9 % a 2,8 % (base 3,9 %, meta 2,8 %, owner: Head de CS)» → verde ≥ 85 % del avance esperado, ámbar 60–85 %, rojo < 60 %.",
          }
        ),
      ],
    },
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
  {
    id: "r9",
    titulo: "Especificaciones técnicas para equipos dev",
    nicho: "SaaS B2B",
    ticket: "$75 / spec",
    demanda: 4,
    dificultad: "Media",
    desc: "PRDs técnicos con criterios de aceptación Gherkin para equipos que pierden sprints en aclaraciones.",
    campos: {
      rol: "Tech lead con 10 años en producto SaaS B2B; escribo especificaciones que eliminan el retrabajo.",
      contexto:
        "Un equipo de producto SaaS pierde el 30 % de cada sprint en aclaraciones porque las especificaciones llegan como frases sueltas de negocio. Necesita un formato de spec reutilizable que ingeniería pueda ejecutar sin reuniones extra: problema, criterios de aceptación, no-objetivos y dependencias con owner.",
      tarea: "Crear la plantilla maestra de especificación técnica: estructura fija, guía de criterios en Given-When-Then y 2 specs de ejemplo (feature e integración) listas para sprint.",
      especificaciones:
        "Estructura: problema en 3 líneas, 4+ criterios Gherkin, no-objetivos, dependencias con responsable y fecha. Incluir anti-ejemplo comentado de una spec ambigua y su corrección.",
      ejemplos:
        "Criterio modelo: «Given un usuario en plan básico, When intenta exportar más de 1.000 filas, Then el sistema encola la exportación y notifica al finalizar».",
    },
  },
  {
    id: "r10",
    titulo: "Vacantes que filtran talento",
    nicho: "HR Tech",
    ticket: "$40 / pack",
    demanda: 3,
    dificultad: "Baja",
    desc: "Descripciones de puesto + rúbricas de entrevista que reducen a la mitad el filtrado manual de CVs.",
    campos: {
      rol: "Especialista en atracción de talento con 9 años escribiendo vacantes que filtran en origen.",
      contexto:
        "Una empresa de 80 personas publica vacantes genéricas y recibe 400 aplicaciones por puesto de las cuales solo 8 califican; el equipo dedica 20 horas semanales a filtrar CVs. Necesita descripciones de puesto estructuradas y rúbricas de entrevista comparables entre entrevistadores.",
      tarea: "Diseñar el pack de contratación: plantilla de descripción de puesto (propósito, responsabilidades con entregable, esenciales vs deseables, señales de éxito a 6 meses) y rúbrica de entrevista de 4 niveles para 3 competencias clave.",
      especificaciones:
        "Cero lenguaje genérico («proactivo» sin definición). Rango salarial obligatorio o justificación de omisión. Rúbrica con señales observables por nivel, no adjetivos.",
      ejemplos:
        "Señal alta: «Pregunta por restricciones de escala antes de proponer; menciona trade-offs sin que se le pidan». Señal baja: «Describe soluciones sin explorar el problema».",
    },
  },
  {
    id: "r11",
    titulo: "Informes de campo agroindustriales",
    nicho: "Agroindustria",
    ticket: "$55 / informe",
    demanda: 3,
    dificultad: "Media",
    desc: "Reportes de inspección estandarizados para cooperativas y agroexportadoras con datos de campo dispersos.",
    campos: {
      rol: "Ingeniero agrónomo consultor con 11 años estandarizando reportes de campo para agroexportadoras.",
      contexto:
        "Una cooperativa de {cultivo} con 340 productores recibe reportes de campo en formatos libres (fotos de WhatsApp, notas de voz) y pierde 3 días por semana consolidándolos para el comprador internacional, que exige trazabilidad auditable.",
      tarea: "Crear el informe de inspección estandarizado: ficha de lote, indicadores fenológicos y sanitarios con umbrales de alerta, registro fotográfico mínimo y resumen ejecutivo para el comprador.",
      especificaciones:
        "Formato llenable en móvil en menos de 15 minutos por lote. Umbrales con semáforo y acción por nivel. Resumen ejecutivo de 120 palabras con dictamen de riesgo.",
      ejemplos:
        "Umbral amarillo: «Incidencia de plaga 8–15 % → re-aplicar en 72 h y re-monitorear en 5 días». Rojo: «> 15 % → cuarentena de lote y aviso al comprador en 24 h».",
    },
  },
  {
    id: "r12",
    titulo: "Guiones de venta por WhatsApp",
    nicho: "Retail & consumo",
    ticket: "$30 / pack",
    demanda: 5,
    dificultad: "Baja",
    desc: "Secuencias conversacionales de WhatsApp que convierten chats en pedidos sin sonar a spam.",
    campos: {
      rol: "Especialista en comercio conversacional con 6 años diseñando guiones de WhatsApp que convierten sin bloqueos de cuenta.",
      contexto:
        "Un comercio de {rubro} atiende 90 chats diarios por WhatsApp con 3 vendedores que improvisan cada conversación; la tasa de cierre es 9 % y los clientes se enfrían entre respuesta y respuesta. El objetivo es subir el cierre a 20 % estandarizando la conversación.",
      tarea: "Escribir el pack de guiones: saludo con calificación en 2 preguntas, secuencia de seguimiento en 3 toques (2 h, 24 h, 72 h), manejo de «está caro» y «lo voy a pensar», y cierre con método de pago.",
      especificaciones:
        "Mensajes de máximo 3 líneas, uno por burbuja; emojis solo donde marcan tono. Prohibido el texto-wall. Incluir reglas de respuesta rápida y 5 respuestas guardadas.",
      ejemplos:
        "Seguimiento 24 h: «Hola Marta, ¿pudiste ver las fotos del modelo azul? Te lo separo hasta mañana a las 6 pm sin compromiso» → urgencia real + salida digna.",
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

/* ── Actividades de mercado · 32 plantillas por categoría ──────────────────── */

export type ActividadCat = "Lanzamiento" | "Crecimiento" | "Operaciones" | "Ventas";

export interface Actividad {
  id: string;
  cat: ActividadCat;
  nombre: string;
  prompt: string;
}

export const MERCADO_ACTIVIDADES: Actividad[] = [
  { id: "a01", cat: "Lanzamiento", nombre: "Validación de problema con 10 entrevistas", prompt: "Tarea: diseñar guion de 10 entrevistas de descubrimiento para validar {problema}. Contexto: etapa pre-MVP, sin pauta. Formato: guion + matriz de señales de validación." },
  { id: "a02", cat: "Lanzamiento", nombre: "Landing con 3 propuestas de valor", prompt: "Tarea: redactar landing con 3 hipótesis de propuesta de valor para {producto}. Contexto: tráfico frío, 200 visitas/semana. Formato: titular, sub, 3 bloques y CTA por hipótesis." },
  { id: "a03", cat: "Lanzamiento", nombre: "Plan de lanzamiento en 45 días", prompt: "Tarea: cronograma de lanzamiento en 3 fases (expectativa, día D, sostenimiento). Contexto: presupuesto {presupuesto}, objetivo 1.000 ventas. Formato: tabla semanal por canal con KPI." },
  { id: "a04", cat: "Lanzamiento", nombre: "Lista de espera beta con incentivo", prompt: "Tarea: secuencia de captación y nurturing para lista de espera de la beta de {producto}. Contexto: meta 5.000 registros antes del día 14. Formato: 4 correos + incentivo por hito." },
  { id: "a05", cat: "Lanzamiento", nombre: "Prueba de precios con 3 anclas", prompt: "Tarea: diseñar test de precios con 3 anclas para {producto}. Contexto: sin referencia de willingness-to-pay. Formato: variantes A/B/C con métrica de decisión y regla de parada." },
  { id: "a06", cat: "Lanzamiento", nombre: "Kit de prensa de lanzamiento", prompt: "Tarea: escribir nota de prensa + 5 ángulos para medios del sector {sector}. Contexto: lanzamiento sin agencia de PR. Formato: nota de 400 palabras con cita del fundador." },
  { id: "a07", cat: "Lanzamiento", nombre: "Onboarding de early adopters", prompt: "Tarea: diseñar onboarding de los primeros 100 usuarios de {producto}. Contexto: alto riesgo de abandono en semana 1. Formato: hitos día 1/7/14 + guion de entrevista de activación." },
  { id: "a08", cat: "Lanzamiento", nombre: "Retrospectiva post-lanzamiento", prompt: "Tarea: facilitar retrospectiva de lanzamiento de {producto} con 4 equipos. Contexto: resultados mixtos, culpas cruzadas. Formato: agenda de 90 min + matriz hechos→aprendizajes→acciones." },
  { id: "a09", cat: "Crecimiento", nombre: "Programa de referidos con doble incentivo", prompt: "Tarea: diseñar programa de referidos para {producto}. Contexto: CAC actual {cac}, base de 3.000 clientes activos. Formato: mecánica, incentivos emisor/receptor, reglas antifraude y KPIs." },
  { id: "a10", cat: "Crecimiento", nombre: "Calendario SEO de 12 artículos", prompt: "Tarea: plan de contenidos SEO trimestral para {sitio}. Contexto: dominio nuevo, autoridad baja. Formato: 12 títulos con intención de búsqueda, dificultad estimada y brief de 5 líneas." },
  { id: "a11", cat: "Crecimiento", nombre: "Mapa de alianzas estratégicas", prompt: "Tarea: identificar 8 socios potenciales para {producto} y diseñar el pitch de alianza. Contexto: sin equipo de partnerships. Formato: matriz socio × valor mutuo × propuesta concreta." },
  { id: "a12", cat: "Crecimiento", nombre: "Sistema de reseñas y reputación", prompt: "Tarea: automatizar la generación de reseñas para {negocio}. Contexto: nota actual 3,9/5, 60 reseñas. Formato: secuencia post-servicio + protocolo de respuesta a reseñas negativas." },
  { id: "a13", cat: "Crecimiento", nombre: "Activación de comunidad dormida", prompt: "Tarea: campaña de reactivación de comunidad de {marca} (12.000 miembros, 4 % activos). Contexto: 18 meses sin gestión. Formato: calendario de 30 días + 3 formatos de contenido." },
  { id: "a14", cat: "Crecimiento", nombre: "Adquisición pagada con tope de CAC", prompt: "Tarea: plan de pauta para {producto} con tope de CAC {cac_max}. Contexto: presupuesto mensual limitado. Formato: distribución por canal, creatividades por ángulo y reglas de pausa." },
  { id: "a15", cat: "Crecimiento", nombre: "Expansión de LTV con productos anexos", prompt: "Tarea: diseñar escalera de valor para clientes de {producto}. Contexto: LTV actual {ltv}, churn del 3 % mensual. Formato: 3 productos anexos con precio, momento de oferta y guion." },
  { id: "a16", cat: "Crecimiento", nombre: "Plan de reducción de churn", prompt: "Tarea: diagnosticar y reducir churn mensual del {churn} % en {producto}. Contexto: 62 % de las bajas ocurren en el mes 2. Formato: cohortes, 3 hipótesis priorizadas y experimentos." },
  { id: "a17", cat: "Operaciones", nombre: "SLA con proveedores críticos", prompt: "Tarea: redactar SLA para proveedor de {servicio}. Contexto: 2 incidentes graves sin penalización en el año. Formato: niveles de servicio, penalizaciones progresivas y revisión trimestral." },
  { id: "a18", cat: "Operaciones", nombre: "Inventario de procesos y owners", prompt: "Tarea: mapear los 20 procesos clave de {empresa}. Contexto: dependencia de 3 personas que concentran conocimiento. Formato: proceso × owner × frecuencia × riesgo de bus factor." },
  { id: "a19", cat: "Operaciones", nombre: "Rediseño de reuniones recurrentes", prompt: "Tarea: auditar y rediseñar el calendario de reuniones de {equipo}. Contexto: 14 h semanales por persona en reuniones. Formato: matriz conservar/fusionar/eliminar + formato nuevo por reunión." },
  { id: "a20", cat: "Operaciones", nombre: "Tablero semanal de KPIs operativos", prompt: "Tarea: definir tablero de 6 KPIs para la operación de {negocio}. Contexto: los datos existen pero nadie los mira. Formato: métrica × fórmula × owner × umbral de alerta × ritual de revisión." },
  { id: "a21", cat: "Operaciones", nombre: "Base de conocimiento interna", prompt: "Tarea: estructurar la wiki interna de {empresa} (35 personas). Contexto: las respuestas viven en chats dispersos. Formato: taxonomía de 5 secciones + plantilla de artículo + ritual de mantenimiento." },
  { id: "a22", cat: "Operaciones", nombre: "Plan de contingencia ante caídas", prompt: "Tarea: plan de contingencia para {servicio_critico}. Contexto: última caída costó 6 h de operación. Formato: matriz de escenarios × responsables × comunicación × checklist de recuperación." },
  { id: "a23", cat: "Operaciones", nombre: "Política de compras y aprobación", prompt: "Tarea: política de compras para {empresa} en crecimiento. Contexto: gastos no autorizados crecieron 40 %. Formato: umbrales por monto, aprobadores por nivel y flujo de reembolso en 5 pasos." },
  { id: "a24", cat: "Operaciones", nombre: "OKRs trimestrales por equipo", prompt: "Tarea: facilitar la definición de OKRs de {equipos} equipos. Contexto: primer ciclo, escepticismo alto. Formato: 2-3 objetivos por equipo con 3 resultados medibles + ritual de check-in semanal." },
  { id: "a25", cat: "Ventas", nombre: "Guion de descubrimiento de 25 min", prompt: "Tarea: guion de llamada de descubrimiento para {servicio} de ticket {ticket}. Contexto: los vendedores hablan 80 % del tiempo. Formato: 8 preguntas en orden + regla de silencio de 4 segundos." },
  { id: "a26", cat: "Ventas", nombre: "Battlecard de objeciones top 5", prompt: "Tarea: battlecard con las 5 objeciones más frecuentes para {producto}. Contexto: cada vendedor improvisa respuestas distintas. Formato: objeción × respuesta literal × prueba × pregunta de rebote." },
  { id: "a27", cat: "Ventas", nombre: "Plantilla de propuesta en 3 niveles", prompt: "Tarea: propuesta comercial en 3 niveles para {servicio}. Contexto: se pierde el 70 % de propuestas enviadas. Formato: diagnóstico, 3 opciones con ancla premium y plan de implementación." },
  { id: "a28", cat: "Ventas", nombre: "Secuencia de seguimiento sin ser pesado", prompt: "Tarea: secuencia de 5 toques post-propuesta para {producto}. Contexto: el «¿pudiste ver mi propuesta?» mata la venta. Formato: cada toque aporta valor nuevo + canal alternado + retiro digno." },
  { id: "a29", cat: "Ventas", nombre: "Guion de renovación con expansión", prompt: "Tarea: guion de renovación anual para clientes de {producto}. Contexto: renovación base 82 %, expansión 8 %. Formato: repaso de valor cuantificado + 2 opciones de expansión + urgencia real." },
  { id: "a30", cat: "Ventas", nombre: "Matriz de precios y descuentos", prompt: "Tarea: política de descuentos para {empresa}. Contexto: descuentos del 20 % ante la primera objeción. Formato: matriz condición × descuento máximo × aprobador + alternativas sin precio." },
  { id: "a31", cat: "Ventas", nombre: "Higiene de pipeline semanal", prompt: "Tarea: ritual de limpieza de pipeline para equipo de {n_vendedores} vendedores. Contexto: 40 % de oportunidades llevan 60+ días sin avance. Formato: criterios de cierre forzado + forecast ponderado." },
  { id: "a32", cat: "Ventas", nombre: "Análisis win/loss de 20 cierres", prompt: "Tarea: entrevistar 10 ganados y 10 perdidos de {producto}. Contexto: se desconoce por qué se pierde. Formato: guion de 15 min + matriz de patrones + 3 cambios accionables al proceso." },
];
