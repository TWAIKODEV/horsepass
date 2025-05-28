import { pgTable, text, serial, integer, boolean, date, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  apellidos: varchar("apellidos", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  tipoUsuario: varchar("tipo_usuario", { length: 20 }).notNull(), // 'propietario', 'veterinario', 'transportista', 'autoridad'
  numColegiado: varchar("num_colegiado", { length: 50 }),
  numLicenciaTransporte: varchar("num_licencia_transporte", { length: 50 }),
  idAutoridad: varchar("id_autoridad", { length: 50 }),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  ultimoAcceso: timestamp("ultimo_acceso"),
  activo: boolean("activo").default(true),
});

// Farms/Explotaciones table
export const explotaciones = pgTable("explotaciones", {
  id: serial("id").primaryKey(),
  codigoRega: varchar("codigo_rega", { length: 50 }).notNull().unique(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  direccion: text("direccion").notNull(),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  provincia: varchar("provincia", { length: 100 }).notNull(),
  codigoPostal: varchar("codigo_postal", { length: 10 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  tipoExplotacion: varchar("tipo_explotacion", { length: 20 }).notNull(),
  capacidadMaxima: integer("capacidad_maxima").notNull(),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  idPropietario: integer("id_propietario").references(() => users.id),
  activa: boolean("activa").default(true),
});

// Horses table
export const caballos = pgTable("caballos", {
  id: serial("id").primaryKey(),
  ueln: varchar("ueln", { length: 15 }).notNull().unique(),
  microchip: varchar("microchip", { length: 23 }).notNull().unique(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  sexo: varchar("sexo", { length: 10 }).notNull(), // 'macho', 'hembra', 'castrado'
  raza: varchar("raza", { length: 100 }).notNull(),
  capa: varchar("capa", { length: 50 }).notNull(),
  paisOrigen: varchar("pais_origen", { length: 50 }).notNull(),
  idExplotacion: integer("id_explotacion").references(() => explotaciones.id),
  idPropietario: integer("id_propietario").references(() => users.id),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  activo: boolean("activo").default(true),
});

// Passports table
export const pasaportes = pgTable("pasaportes", {
  id: serial("id").primaryKey(),
  idCaballo: integer("id_caballo").references(() => caballos.id),
  numeroPasaporte: varchar("numero_pasaporte", { length: 50 }).notNull().unique(),
  fechaEmision: date("fecha_emision").notNull(),
  autoridadEmisora: varchar("autoridad_emisora", { length: 100 }).notNull(),
  fechaValidez: date("fecha_validez"),
  urlDocumento: varchar("url_documento", { length: 255 }),
  estado: varchar("estado", { length: 20 }).notNull(), // 'vigente', 'caducado', 'suspendido', 'extraviado'
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  idEmisor: integer("id_emisor").references(() => users.id),
});

// Movement guides table
export const guiasMovimiento = pgTable("guias_movimiento", {
  id: serial("id").primaryKey(),
  idCaballo: integer("id_caballo").references(() => caballos.id),
  numeroGuia: varchar("numero_guia", { length: 50 }).notNull().unique(),
  fechaEmision: date("fecha_emision").notNull(),
  explotacionOrigen: integer("explotacion_origen").references(() => explotaciones.id),
  explotacionDestino: integer("explotacion_destino").references(() => explotaciones.id),
  fechaSalida: timestamp("fecha_salida").notNull(),
  fechaLlegada: timestamp("fecha_llegada"),
  motivoTraslado: text("motivo_traslado").notNull(),
  medioTransporte: varchar("medio_transporte", { length: 100 }).notNull(),
  matriculaVehiculo: varchar("matricula_vehiculo", { length: 20 }),
  idTransportista: integer("id_transportista").references(() => users.id),
  estado: varchar("estado", { length: 20 }).notNull(), // 'emitida', 'en_transito', 'finalizada', 'cancelada'
  urlDocumento: varchar("url_documento", { length: 255 }),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  idEmisor: integer("id_emisor").references(() => users.id),
});

// Health certificates table
export const certificadosSalud = pgTable("certificados_salud", {
  id: serial("id").primaryKey(),
  idCaballo: integer("id_caballo").references(() => caballos.id),
  numeroCertificado: varchar("numero_certificado", { length: 50 }).notNull().unique(),
  fechaEmision: date("fecha_emision").notNull(),
  fechaValidez: date("fecha_validez").notNull(),
  idVeterinario: integer("id_veterinario").references(() => users.id),
  resultado: varchar("resultado", { length: 30 }).notNull(), // 'apto', 'no_apto', 'apto_con_restricciones'
  observaciones: text("observaciones"),
  vacunasAplicadas: text("vacunas_aplicadas"),
  pruebasRealizadas: text("pruebas_realizadas"),
  urlDocumento: varchar("url_documento", { length: 255 }),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
});

// EU Transport documents table
export const documentosTransporteUe = pgTable("documentos_transporte_ue", {
  id: serial("id").primaryKey(),
  idCaballo: integer("id_caballo").references(() => caballos.id),
  numeroDocumento: varchar("numero_documento", { length: 50 }).notNull().unique(),
  fechaEmision: date("fecha_emision").notNull(),
  paisOrigen: varchar("pais_origen", { length: 50 }).notNull(),
  paisDestino: varchar("pais_destino", { length: 50 }).notNull(),
  puntoControlFronterizo: varchar("punto_control_fronterizo", { length: 100 }),
  idCertificadoSalud: integer("id_certificado_salud").references(() => certificadosSalud.id),
  idGuiaMovimiento: integer("id_guia_movimiento").references(() => guiasMovimiento.id),
  urlDocumento: varchar("url_documento", { length: 255 }),
  fechaRegistro: timestamp("fecha_registro").defaultNow(),
  idEmisor: integer("id_emisor").references(() => users.id),
});

// Registry books table
export const librosRegistro = pgTable("libros_registro", {
  id: serial("id").primaryKey(),
  idExplotacion: integer("id_explotacion").references(() => explotaciones.id),
  fechaApertura: date("fecha_apertura").notNull(),
  fechaUltimaActualizacion: timestamp("fecha_ultima_actualizacion").defaultNow(),
  urlDocumento: varchar("url_documento", { length: 255 }),
  observaciones: text("observaciones"),
  idResponsable: integer("id_responsable").references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  fechaRegistro: true,
  ultimoAcceso: true,
});

export const insertExplotacionSchema = createInsertSchema(explotaciones).omit({
  id: true,
  fechaRegistro: true,
});

export const insertCaballoSchema = createInsertSchema(caballos).omit({
  id: true,
  fechaRegistro: true,
});

export const insertPasaporteSchema = createInsertSchema(pasaportes).omit({
  id: true,
  fechaRegistro: true,
});

export const insertGuiaMovimientoSchema = createInsertSchema(guiasMovimiento).omit({
  id: true,
  fechaRegistro: true,
});

export const insertCertificadoSaludSchema = createInsertSchema(certificadosSalud).omit({
  id: true,
  fechaRegistro: true,
});

export const insertDocumentoTransporteUeSchema = createInsertSchema(documentosTransporteUe).omit({
  id: true,
  fechaRegistro: true,
});

export const insertLibroRegistroSchema = createInsertSchema(librosRegistro).omit({
  id: true,
  fechaUltimaActualizacion: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Explotacion = typeof explotaciones.$inferSelect;
export type InsertExplotacion = z.infer<typeof insertExplotacionSchema>;
export type Caballo = typeof caballos.$inferSelect;
export type InsertCaballo = z.infer<typeof insertCaballoSchema>;
export type Pasaporte = typeof pasaportes.$inferSelect;
export type InsertPasaporte = z.infer<typeof insertPasaporteSchema>;
export type GuiaMovimiento = typeof guiasMovimiento.$inferSelect;
export type InsertGuiaMovimiento = z.infer<typeof insertGuiaMovimientoSchema>;
export type CertificadoSalud = typeof certificadosSalud.$inferSelect;
export type InsertCertificadoSalud = z.infer<typeof insertCertificadoSaludSchema>;
export type DocumentoTransporteUe = typeof documentosTransporteUe.$inferSelect;
export type InsertDocumentoTransporteUe = z.infer<typeof insertDocumentoTransporteUeSchema>;
export type LibroRegistro = typeof librosRegistro.$inferSelect;
export type InsertLibroRegistro = z.infer<typeof insertLibroRegistroSchema>;
