import { pgTable, serial, integer, varchar, date, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { caballos, users } from "./schema";

// TME (Tarjeta de Identificación Equina) según Real Decreto 577/2014
export const tarjetasIdentificacionEquina = pgTable("tarjetas_identificacion_equina", {
  id: serial("id").primaryKey(),
  
  // Datos obligatorios de identificación del animal (no modificables)
  idCaballo: integer("id_caballo").references(() => caballos.id).notNull(),
  ueln: varchar("ueln", { length: 15 }).notNull().unique(), // Número único de identificación del équido
  codigoTranspondedor: varchar("codigo_transpondedor", { length: 15 }).notNull(), // Microchip
  nombreEquido: varchar("nombre_equido", { length: 100 }).notNull(),
  sexo: varchar("sexo", { length: 10 }).notNull(), // Macho, Hembra, Castrado
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  capa: varchar("capa", { length: 50 }).notNull(), // Color del pelaje
  
  // Elementos gráficos obligatorios
  fotografiaUrl: varchar("fotografia_url", { length: 255 }), // Fotografía o reseña a color del équido
  codigoBarrasUeln: text("codigo_barras_ueln"), // Representación del UELN en código de barras
  
  // Datos de emisión y validez
  numeroTarjeta: varchar("numero_tarjeta", { length: 50 }).notNull().unique(),
  fechaEmision: date("fecha_emision").notNull(),
  autoridadEmisora: varchar("autoridad_emisora", { length: 100 }).notNull(),
  fechaValidez: date("fecha_validez"),
  
  // Elementos de seguridad gráfica
  tieneEscudoEspana: boolean("tiene_escudo_espana").default(true),
  tieneElementosSeguridad: boolean("tiene_elementos_seguridad").default(true),
  leyendaValidez: text("leyenda_validez").default("Válida solo para movimientos dentro de España"),
  
  // Datos del reverso
  numeroIdentificacionElectronico: varchar("numero_identificacion_electronico", { length: 20 }),
  fotografiaReversoUrl: varchar("fotografia_reverso_url", { length: 255 }),
  impresionCodificadaTme: text("impresion_codificada_tme"), // Palabra "TME" en impresión codificada
  
  // Datos adicionales (voluntarios)
  raza: varchar("raza", { length: 100 }),
  paisNacimiento: varchar("pais_nacimiento", { length: 50 }),
  criador: varchar("criador", { length: 200 }),
  propietario: varchar("propietario", { length: 200 }),
  observaciones: text("observaciones"),
  
  // Control de documento
  estado: varchar("estado", { length: 20 }).notNull().default("activa"), // activa, suspendida, extraviada, anulada
  motivoEstado: text("motivo_estado"),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  idEmisor: integer("id_emisor").references(() => users.id),
  
  // Validaciones específicas
  validaMovimientosEspana: boolean("valida_movimientos_espana").default(true),
  validaMovimientosUe: boolean("valida_movimientos_ue").default(false),
  validaMovimientosInternacionales: boolean("valida_movimientos_internacionales").default(false),
});

// Reseñas descriptivas del équido (parte de la TME)
export const resenasTme = pgTable("resenas_tme", {
  id: serial("id").primaryKey(),
  idTarjeta: integer("id_tarjeta").references(() => tarjetasIdentificacionEquina.id).notNull(),
  
  // Reseñas específicas
  cabeza: text("cabeza"), // Descripción de la cabeza
  cuello: text("cuello"), // Descripción del cuello
  tronco: text("tronco"), // Descripción del tronco
  extremidadesAnteriores: text("extremidades_anteriores"),
  extremidadesPosteriores: text("extremidades_posteriores"),
  
  // Marcas y señales particulares
  marcasNaturales: text("marcas_naturales"),
  marcasArtificiales: text("marcas_artificiales"),
  cicatrices: text("cicatrices"),
  remolinos: text("remolinos"),
  
  // Medidas
  alzadaCruz: varchar("alzada_cruz", { length: 10 }), // Altura a la cruz en cm
  perimetroToracico: varchar("perimetro_toracico", { length: 10 }),
  perimetroCana: varchar("perimetro_cana", { length: 10 }),
  
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
});

// Movimientos registrados en la TME
export const movimientosTme = pgTable("movimientos_tme", {
  id: serial("id").primaryKey(),
  idTarjeta: integer("id_tarjeta").references(() => tarjetasIdentificacionEquina.id).notNull(),
  
  fechaMovimiento: date("fecha_movimiento").notNull(),
  lugarOrigen: varchar("lugar_origen", { length: 200 }).notNull(),
  lugarDestino: varchar("lugar_destino", { length: 200 }).notNull(),
  motivoMovimiento: varchar("motivo_movimiento", { length: 100 }).notNull(),
  
  // Datos del transportista
  nombreTransportista: varchar("nombre_transportista", { length: 200 }),
  licenciaTransporte: varchar("licencia_transporte", { length: 50 }),
  vehiculoMatricula: varchar("vehiculo_matricula", { length: 20 }),
  
  // Autorización y validación
  autorizadoPor: varchar("autorizado_por", { length: 200 }),
  selloOficial: boolean("sello_oficial").default(false),
  
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
});

// Validaciones médico-veterinarias en la TME
export const validacionesVeterinarias = pgTable("validaciones_veterinarias", {
  id: serial("id").primaryKey(),
  idTarjeta: integer("id_tarjeta").references(() => tarjetasIdentificacionEquina.id).notNull(),
  
  fechaValidacion: date("fecha_validacion").notNull(),
  tipoValidacion: varchar("tipo_validacion", { length: 50 }).notNull(), // Vacunación, Reconocimiento, Tratamiento
  descripcion: text("descripcion").notNull(),
  
  // Datos del veterinario
  nombreVeterinario: varchar("nombre_veterinario", { length: 200 }).notNull(),
  numeroColegiadoVeterinario: varchar("numero_colegiado_veterinario", { length: 50 }).notNull(),
  
  // Validez temporal
  fechaValidezHasta: date("fecha_validez_hasta"),
  
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
});

// Esquemas de validación con Zod
export const insertTarjetaTmeSchema = createInsertSchema(tarjetasIdentificacionEquina, {
  ueln: z.string().length(15, "UELN debe tener exactamente 15 caracteres"),
  codigoTranspondedor: z.string().min(15, "Código de transpondedor debe tener al menos 15 caracteres"),
  nombreEquido: z.string().min(1, "Nombre del équido es obligatorio"),
  sexo: z.enum(["Macho", "Hembra", "Castrado"], { required_error: "Sexo es obligatorio" }),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es obligatoria"),
  capa: z.string().min(1, "Capa es obligatoria"),
  numeroTarjeta: z.string().min(1, "Número de tarjeta es obligatorio"),
  fechaEmision: z.string().min(1, "Fecha de emisión es obligatoria"),
  autoridadEmisora: z.string().min(1, "Autoridad emisora es obligatoria"),
}).omit({
  id: true,
  fechaRegistro: true,
});

export const insertResenaSchema = createInsertSchema(resenasTme).omit({
  id: true,
  fechaRegistro: true,
});

export const insertMovimientoTmeSchema = createInsertSchema(movimientosTme).omit({
  id: true,
  fechaRegistro: true,
});

export const insertValidacionVeterinariaSchema = createInsertSchema(validacionesVeterinarias).omit({
  id: true,
  fechaRegistro: true,
});

// Types
export type TarjetaTme = typeof tarjetasIdentificacionEquina.$inferSelect;
export type InsertTarjetaTme = z.infer<typeof insertTarjetaTmeSchema>;

export type ResenaTme = typeof resenasTme.$inferSelect;
export type InsertResenaTme = z.infer<typeof insertResenaSchema>;

export type MovimientoTme = typeof movimientosTme.$inferSelect;
export type InsertMovimientoTme = z.infer<typeof insertMovimientoTmeSchema>;

export type ValidacionVeterinaria = typeof validacionesVeterinarias.$inferSelect;
export type InsertValidacionVeterinaria = z.infer<typeof insertValidacionVeterinariaSchema>;