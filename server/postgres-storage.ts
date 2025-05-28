import { eq, and, sql, gte } from "drizzle-orm";
import { db } from "./db";
import { 
  users, explotaciones, caballos, pasaportes, guiasMovimiento, 
  certificadosSalud, documentosTransporteUe, librosRegistro,
  type User, type InsertUser, type Explotacion, type InsertExplotacion,
  type Caballo, type InsertCaballo, type Pasaporte, type InsertPasaporte,
  type GuiaMovimiento, type InsertGuiaMovimiento, type CertificadoSalud, type InsertCertificadoSalud,
  type DocumentoTransporteUe, type InsertDocumentoTransporteUe,
  type LibroRegistro, type InsertLibroRegistro
} from "../shared/schema";
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...user,
      fechaRegistro: new Date(),
      ultimoAcceso: null,
      activo: true
    }).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set({
      ...userData,
      ultimoAcceso: new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Explotaciones
  async getExplotacion(id: number): Promise<Explotacion | undefined> {
    const result = await db.select().from(explotaciones).where(eq(explotaciones.id, id)).limit(1);
    return result[0];
  }

  async getExplotacionesByUser(userId: number): Promise<Explotacion[]> {
    return await db.select().from(explotaciones).where(eq(explotaciones.idPropietario, userId));
  }

  async getAllExplotaciones(): Promise<Explotacion[]> {
    return await db.select().from(explotaciones);
  }

  async createExplotacion(explotacion: InsertExplotacion): Promise<Explotacion> {
    const result = await db.insert(explotaciones).values({
      ...explotacion,
      fechaRegistro: new Date(),
      activa: true
    }).returning();
    return result[0];
  }

  async updateExplotacion(id: number, explotacionData: Partial<InsertExplotacion>): Promise<Explotacion | undefined> {
    const result = await db.update(explotaciones).set(explotacionData).where(eq(explotaciones.id, id)).returning();
    return result[0];
  }

  // Caballos
  async getCaballo(id: number): Promise<Caballo | undefined> {
    const result = await db.select().from(caballos).where(eq(caballos.id, id)).limit(1);
    return result[0];
  }

  async getCaballosByUser(userId: number): Promise<Caballo[]> {
    return await db.select().from(caballos).where(eq(caballos.idPropietario, userId));
  }

  async getCaballosByExplotacion(explotacionId: number): Promise<Caballo[]> {
    return await db.select().from(caballos).where(eq(caballos.idExplotacion, explotacionId));
  }

  async getAllCaballos(): Promise<Caballo[]> {
    return await db.select().from(caballos);
  }

  async createCaballo(caballo: InsertCaballo): Promise<Caballo> {
    const result = await db.insert(caballos).values({
      ...caballo,
      fechaRegistro: new Date(),
      activo: true
    }).returning();
    return result[0];
  }

  async updateCaballo(id: number, caballoData: Partial<InsertCaballo>): Promise<Caballo | undefined> {
    const result = await db.update(caballos).set(caballoData).where(eq(caballos.id, id)).returning();
    return result[0];
  }

  // Pasaportes
  async getPasaporte(id: number): Promise<Pasaporte | undefined> {
    const result = await db.select().from(pasaportes).where(eq(pasaportes.id, id)).limit(1);
    return result[0];
  }

  async getPasaportesByCaballo(caballoId: number): Promise<Pasaporte[]> {
    return await db.select().from(pasaportes).where(eq(pasaportes.idCaballo, caballoId));
  }

  async getPasaportesExpiringSoon(): Promise<Pasaporte[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return await db.select().from(pasaportes)
      .where(and(
        sql`${pasaportes.fechaValidez}::date <= ${thirtyDaysFromNow.toISOString().split('T')[0]}`,
        eq(pasaportes.estado, "activo")
      ));
  }

  async getAllPasaportes(): Promise<Pasaporte[]> {
    return await db.select().from(pasaportes);
  }

  async createPasaporte(pasaporte: InsertPasaporte): Promise<Pasaporte> {
    const result = await db.insert(pasaportes).values({
      ...pasaporte,
      fechaRegistro: new Date()
    }).returning();
    return result[0];
  }

  async updatePasaporte(id: number, pasaporteData: Partial<InsertPasaporte>): Promise<Pasaporte | undefined> {
    const result = await db.update(pasaportes).set(pasaporteData).where(eq(pasaportes.id, id)).returning();
    return result[0];
  }

  // Guías de Movimiento
  async getGuiaMovimiento(id: number): Promise<GuiaMovimiento | undefined> {
    const result = await db.select().from(guiasMovimiento).where(eq(guiasMovimiento.id, id)).limit(1);
    return result[0];
  }

  async getGuiasMovimientoByCaballo(caballoId: number): Promise<GuiaMovimiento[]> {
    return await db.select().from(guiasMovimiento).where(eq(guiasMovimiento.idCaballo, caballoId));
  }

  async getAllGuiasMovimiento(): Promise<GuiaMovimiento[]> {
    return await db.select().from(guiasMovimiento);
  }

  async createGuiaMovimiento(guia: InsertGuiaMovimiento): Promise<GuiaMovimiento> {
    const result = await db.insert(guiasMovimiento).values({
      ...guia,
      fechaRegistro: new Date()
    }).returning();
    return result[0];
  }

  async updateGuiaMovimiento(id: number, guiaData: Partial<InsertGuiaMovimiento>): Promise<GuiaMovimiento | undefined> {
    const result = await db.update(guiasMovimiento).set(guiaData).where(eq(guiasMovimiento.id, id)).returning();
    return result[0];
  }

  // Certificados de Salud
  async getCertificadoSalud(id: number): Promise<CertificadoSalud | undefined> {
    const result = await db.select().from(certificadosSalud).where(eq(certificadosSalud.id, id)).limit(1);
    return result[0];
  }

  async getCertificadosSaludByCaballo(caballoId: number): Promise<CertificadoSalud[]> {
    return await db.select().from(certificadosSalud).where(eq(certificadosSalud.idCaballo, caballoId));
  }

  async getCertificadosExpiringSoon(): Promise<CertificadoSalud[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return await db.select().from(certificadosSalud)
      .where(sql`${certificadosSalud.fechaValidez}::date <= ${thirtyDaysFromNow.toISOString().split('T')[0]}`);
  }

  async getAllCertificadosSalud(): Promise<CertificadoSalud[]> {
    return await db.select().from(certificadosSalud);
  }

  async createCertificadoSalud(certificado: InsertCertificadoSalud): Promise<CertificadoSalud> {
    const result = await db.insert(certificadosSalud).values({
      ...certificado,
      fechaRegistro: new Date()
    }).returning();
    return result[0];
  }

  async updateCertificadoSalud(id: number, certificadoData: Partial<InsertCertificadoSalud>): Promise<CertificadoSalud | undefined> {
    const result = await db.update(certificadosSalud).set(certificadoData).where(eq(certificadosSalud.id, id)).returning();
    return result[0];
  }

  // Documentos Transporte UE
  async getDocumentoTransporteUe(id: number): Promise<DocumentoTransporteUe | undefined> {
    const result = await db.select().from(documentosTransporteUe).where(eq(documentosTransporteUe.id, id)).limit(1);
    return result[0];
  }

  async getDocumentosTransporteUeByCaballo(caballoId: number): Promise<DocumentoTransporteUe[]> {
    return await db.select().from(documentosTransporteUe).where(eq(documentosTransporteUe.idCaballo, caballoId));
  }

  async getAllDocumentosTransporteUe(): Promise<DocumentoTransporteUe[]> {
    return await db.select().from(documentosTransporteUe);
  }

  async createDocumentoTransporteUe(documento: InsertDocumentoTransporteUe): Promise<DocumentoTransporteUe> {
    const result = await db.insert(documentosTransporteUe).values({
      ...documento,
      fechaRegistro: new Date()
    }).returning();
    return result[0];
  }

  async updateDocumentoTransporteUe(id: number, documentoData: Partial<InsertDocumentoTransporteUe>): Promise<DocumentoTransporteUe | undefined> {
    const result = await db.update(documentosTransporteUe).set(documentoData).where(eq(documentosTransporteUe.id, id)).returning();
    return result[0];
  }

  // Libros de Registro
  async getLibroRegistro(id: number): Promise<LibroRegistro | undefined> {
    const result = await db.select().from(librosRegistro).where(eq(librosRegistro.id, id)).limit(1);
    return result[0];
  }

  async getLibrosRegistroByExplotacion(explotacionId: number): Promise<LibroRegistro[]> {
    return await db.select().from(librosRegistro).where(eq(librosRegistro.idExplotacion, explotacionId));
  }

  async getAllLibrosRegistro(): Promise<LibroRegistro[]> {
    return await db.select().from(librosRegistro);
  }

  async createLibroRegistro(libro: InsertLibroRegistro): Promise<LibroRegistro> {
    const result = await db.insert(librosRegistro).values({
      ...libro,
      fechaUltimaActualizacion: new Date()
    }).returning();
    return result[0];
  }

  async updateLibroRegistro(id: number, libroData: Partial<InsertLibroRegistro>): Promise<LibroRegistro | undefined> {
    const result = await db.update(librosRegistro).set({
      ...libroData,
      fechaUltimaActualizacion: new Date()
    }).where(eq(librosRegistro.id, id)).returning();
    return result[0];
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    totalCaballos: number;
    documentosActivos: number;
    proximosVencer: number;
    explotaciones: number;
  }> {
    const [caballosCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(caballos)
      .where(eq(caballos.idPropietario, userId));

    const [pasaportesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pasaportes);

    const [certificadosCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(certificadosSalud);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const [expiringCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pasaportes)
      .where(sql`${pasaportes.fechaValidez}::date <= ${thirtyDaysFromNow.toISOString().split('T')[0]}`);

    const [explotacionesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(explotaciones)
      .where(eq(explotaciones.idPropietario, userId));

    return {
      totalCaballos: caballosCount?.count || 0,
      documentosActivos: (pasaportesCount?.count || 0) + (certificadosCount?.count || 0),
      proximosVencer: expiringCount?.count || 0,
      explotaciones: explotacionesCount?.count || 0
    };
  }
}