import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    nombre: v.string(),
    apellidos: v.string(),
    email: v.string(),
    password: v.string(),
    tipoUsuario: v.string(),
    numColegiado: v.optional(v.string()),
    numLicenciaTransporte: v.optional(v.string()),
    idAutoridad: v.optional(v.string()),
    fechaRegistro: v.number(),
    ultimoAcceso: v.optional(v.number()),
    activo: v.boolean()
  }).index("by_email", ["email"]),

  explotaciones: defineTable({
    nombre: v.string(),
    email: v.optional(v.string()),
    fechaRegistro: v.number(),
    codigoRega: v.string(),
    direccion: v.string(),
    municipio: v.string(),
    provincia: v.string(),
    codigoPostal: v.string(),
    telefono: v.string(),
    tipoExplotacion: v.string(),
    capacidadMaxima: v.number(),
    idPropietario: v.id("users"),
    activa: v.boolean()
  }).index("by_propietario", ["idPropietario"]),

  caballos: defineTable({
    nombre: v.string(),
    fechaRegistro: v.number(),
    activo: v.boolean(),
    idPropietario: v.id("users"),
    ueln: v.string(),
    microchip: v.string(),
    fechaNacimiento: v.string(),
    sexo: v.string(),
    raza: v.string(),
    capa: v.string(),
    paisOrigen: v.string(),
    idExplotacion: v.optional(v.id("explotaciones"))
  })
    .index("by_propietario", ["idPropietario"])
    .index("by_explotacion", ["idExplotacion"])
    .index("by_ueln", ["ueln"])
    .index("by_microchip", ["microchip"]),

  pasaportes: defineTable({
    fechaRegistro: v.number(),
    idCaballo: v.id("caballos"),
    numeroPasaporte: v.string(),
    fechaEmision: v.string(),
    autoridadEmisora: v.string(),
    fechaValidez: v.optional(v.string()),
    urlDocumento: v.optional(v.string()),
    estado: v.string(),
    idEmisor: v.optional(v.id("users"))
  })
    .index("by_caballo", ["idCaballo"])
    .index("by_numero", ["numeroPasaporte"])
    .index("by_estado", ["estado"]),

  guiasMovimiento: defineTable({
    fechaRegistro: v.number(),
    idCaballo: v.id("caballos"),
    fechaEmision: v.string(),
    urlDocumento: v.optional(v.string()),
    estado: v.string(),
    idEmisor: v.optional(v.id("users")),
    numeroGuia: v.string(),
    fechaSalida: v.number(),
    fechaLlegada: v.optional(v.number()),
    origenDireccion: v.string(),
    destinoDireccion: v.string(),
    motivoTraslado: v.string(),
    medioTransporte: v.string(),
    idTransportista: v.optional(v.id("users")),
    observaciones: v.optional(v.string())
  })
    .index("by_caballo", ["idCaballo"])
    .index("by_numero", ["numeroGuia"])
    .index("by_estado", ["estado"]),

  certificadosSalud: defineTable({
    fechaRegistro: v.number(),
    idCaballo: v.id("caballos"),
    fechaEmision: v.string(),
    fechaValidez: v.string(),
    urlDocumento: v.optional(v.string()),
    numeroCertificado: v.string(),
    idVeterinario: v.optional(v.id("users")),
    resultado: v.string(),
    observaciones: v.optional(v.string()),
    vacunasAplicadas: v.optional(v.string()),
    pruebasRealizadas: v.optional(v.string())
  })
    .index("by_caballo", ["idCaballo"])
    .index("by_numero", ["numeroCertificado"])
    .index("by_veterinario", ["idVeterinario"]),

  documentosTransporteUe: defineTable({
    fechaRegistro: v.number(),
    paisOrigen: v.string(),
    idCaballo: v.id("caballos"),
    fechaEmision: v.string(),
    urlDocumento: v.optional(v.string()),
    idEmisor: v.optional(v.id("users")),
    numeroDocumento: v.string(),
    paisDestino: v.string(),
    puntoControlFronterizo: v.optional(v.string()),
    idCertificadoSalud: v.optional(v.id("certificadosSalud")),
    idGuiaMovimiento: v.optional(v.id("guiasMovimiento"))
  })
    .index("by_caballo", ["idCaballo"])
    .index("by_numero", ["numeroDocumento"]),

  librosRegistro: defineTable({
    idExplotacion: v.id("explotaciones"),
    urlDocumento: v.optional(v.string()),
    observaciones: v.optional(v.string()),
    fechaApertura: v.string(),
    fechaUltimaActualizacion: v.number(),
    idResponsable: v.optional(v.id("users"))
  }).index("by_explotacion", ["idExplotacion"])
});