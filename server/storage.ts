import {
  users, explotaciones, caballos, pasaportes, guiasMovimiento, certificadosSalud,
  documentosTransporteUe, librosRegistro,
  type User, type InsertUser, type Explotacion, type InsertExplotacion,
  type Caballo, type InsertCaballo, type Pasaporte, type InsertPasaporte,
  type GuiaMovimiento, type InsertGuiaMovimiento, type CertificadoSalud, type InsertCertificadoSalud,
  type DocumentoTransporteUe, type InsertDocumentoTransporteUe,
  type LibroRegistro, type InsertLibroRegistro
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Explotaciones
  getExplotacion(id: number): Promise<Explotacion | undefined>;
  getExplotacionesByUser(userId: number): Promise<Explotacion[]>;
  getAllExplotaciones(): Promise<Explotacion[]>;
  createExplotacion(explotacion: InsertExplotacion): Promise<Explotacion>;
  updateExplotacion(id: number, explotacion: Partial<InsertExplotacion>): Promise<Explotacion | undefined>;

  // Caballos
  getCaballo(id: number): Promise<Caballo | undefined>;
  getCaballosByUser(userId: number): Promise<Caballo[]>;
  getCaballosByExplotacion(explotacionId: number): Promise<Caballo[]>;
  getAllCaballos(): Promise<Caballo[]>;
  createCaballo(caballo: InsertCaballo): Promise<Caballo>;
  updateCaballo(id: number, caballo: Partial<InsertCaballo>): Promise<Caballo | undefined>;

  // Pasaportes
  getPasaporte(id: number): Promise<Pasaporte | undefined>;
  getPasaportesByCaballo(caballoId: number): Promise<Pasaporte[]>;
  getPasaportesExpiringSoon(): Promise<Pasaporte[]>;
  getAllPasaportes(): Promise<Pasaporte[]>;
  createPasaporte(pasaporte: InsertPasaporte): Promise<Pasaporte>;
  updatePasaporte(id: number, pasaporte: Partial<InsertPasaporte>): Promise<Pasaporte | undefined>;

  // Guias de Movimiento
  getGuiaMovimiento(id: number): Promise<GuiaMovimiento | undefined>;
  getGuiasMovimientoByCaballo(caballoId: number): Promise<GuiaMovimiento[]>;
  getAllGuiasMovimiento(): Promise<GuiaMovimiento[]>;
  createGuiaMovimiento(guia: InsertGuiaMovimiento): Promise<GuiaMovimiento>;
  updateGuiaMovimiento(id: number, guia: Partial<InsertGuiaMovimiento>): Promise<GuiaMovimiento | undefined>;

  // Certificados de Salud
  getCertificadoSalud(id: number): Promise<CertificadoSalud | undefined>;
  getCertificadosSaludByCaballo(caballoId: number): Promise<CertificadoSalud[]>;
  getCertificadosExpiringSoon(): Promise<CertificadoSalud[]>;
  getAllCertificadosSalud(): Promise<CertificadoSalud[]>;
  createCertificadoSalud(certificado: InsertCertificadoSalud): Promise<CertificadoSalud>;
  updateCertificadoSalud(id: number, certificado: Partial<InsertCertificadoSalud>): Promise<CertificadoSalud | undefined>;

  // Documentos Transporte UE
  getDocumentoTransporteUe(id: number): Promise<DocumentoTransporteUe | undefined>;
  getDocumentosTransporteUeByCaballo(caballoId: number): Promise<DocumentoTransporteUe[]>;
  getAllDocumentosTransporteUe(): Promise<DocumentoTransporteUe[]>;
  createDocumentoTransporteUe(documento: InsertDocumentoTransporteUe): Promise<DocumentoTransporteUe>;
  updateDocumentoTransporteUe(id: number, documento: Partial<InsertDocumentoTransporteUe>): Promise<DocumentoTransporteUe | undefined>;

  // Libros de Registro
  getLibroRegistro(id: number): Promise<LibroRegistro | undefined>;
  getLibrosRegistroByExplotacion(explotacionId: number): Promise<LibroRegistro[]>;
  getAllLibrosRegistro(): Promise<LibroRegistro[]>;
  createLibroRegistro(libro: InsertLibroRegistro): Promise<LibroRegistro>;
  updateLibroRegistro(id: number, libro: Partial<InsertLibroRegistro>): Promise<LibroRegistro | undefined>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    totalCaballos: number;
    documentosActivos: number;
    proximosVencer: number;
    explotaciones: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private explotaciones: Map<number, Explotacion>;
  private caballos: Map<number, Caballo>;
  private pasaportes: Map<number, Pasaporte>;
  private guiasMovimiento: Map<number, GuiaMovimiento>;
  private certificadosSalud: Map<number, CertificadoSalud>;
  private documentosTransporteUe: Map<number, DocumentoTransporteUe>;
  private librosRegistro: Map<number, LibroRegistro>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.explotaciones = new Map();
    this.caballos = new Map();
    this.pasaportes = new Map();
    this.guiasMovimiento = new Map();
    this.certificadosSalud = new Map();
    this.documentosTransporteUe = new Map();
    this.librosRegistro = new Map();
    this.currentId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      fechaRegistro: new Date(),
      ultimoAcceso: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Explotaciones
  async getExplotacion(id: number): Promise<Explotacion | undefined> {
    return this.explotaciones.get(id);
  }

  async getExplotacionesByUser(userId: number): Promise<Explotacion[]> {
    return Array.from(this.explotaciones.values()).filter(exp => exp.idPropietario === userId);
  }

  async getAllExplotaciones(): Promise<Explotacion[]> {
    return Array.from(this.explotaciones.values());
  }

  async createExplotacion(insertExplotacion: InsertExplotacion): Promise<Explotacion> {
    const id = this.currentId++;
    const explotacion: Explotacion = {
      ...insertExplotacion,
      id,
      fechaRegistro: new Date(),
    };
    this.explotaciones.set(id, explotacion);
    return explotacion;
  }

  async updateExplotacion(id: number, explotacionData: Partial<InsertExplotacion>): Promise<Explotacion | undefined> {
    const explotacion = this.explotaciones.get(id);
    if (!explotacion) return undefined;
    
    const updatedExplotacion = { ...explotacion, ...explotacionData };
    this.explotaciones.set(id, updatedExplotacion);
    return updatedExplotacion;
  }

  // Caballos
  async getCaballo(id: number): Promise<Caballo | undefined> {
    return this.caballos.get(id);
  }

  async getCaballosByUser(userId: number): Promise<Caballo[]> {
    return Array.from(this.caballos.values()).filter(caballo => caballo.idPropietario === userId);
  }

  async getCaballosByExplotacion(explotacionId: number): Promise<Caballo[]> {
    return Array.from(this.caballos.values()).filter(caballo => caballo.idExplotacion === explotacionId);
  }

  async getAllCaballos(): Promise<Caballo[]> {
    return Array.from(this.caballos.values());
  }

  async createCaballo(insertCaballo: InsertCaballo): Promise<Caballo> {
    const id = this.currentId++;
    const caballo: Caballo = {
      ...insertCaballo,
      id,
      fechaRegistro: new Date(),
    };
    this.caballos.set(id, caballo);
    return caballo;
  }

  async updateCaballo(id: number, caballoData: Partial<InsertCaballo>): Promise<Caballo | undefined> {
    const caballo = this.caballos.get(id);
    if (!caballo) return undefined;
    
    const updatedCaballo = { ...caballo, ...caballoData };
    this.caballos.set(id, updatedCaballo);
    return updatedCaballo;
  }

  // Pasaportes
  async getPasaporte(id: number): Promise<Pasaporte | undefined> {
    return this.pasaportes.get(id);
  }

  async getPasaportesByCaballo(caballoId: number): Promise<Pasaporte[]> {
    return Array.from(this.pasaportes.values()).filter(pasaporte => pasaporte.idCaballo === caballoId);
  }

  async getPasaportesExpiringSoon(): Promise<Pasaporte[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return Array.from(this.pasaportes.values()).filter(pasaporte => {
      if (!pasaporte.fechaValidez) return false;
      const validezDate = new Date(pasaporte.fechaValidez);
      return validezDate <= thirtyDaysFromNow && validezDate >= new Date();
    });
  }

  async getAllPasaportes(): Promise<Pasaporte[]> {
    return Array.from(this.pasaportes.values());
  }

  async createPasaporte(insertPasaporte: InsertPasaporte): Promise<Pasaporte> {
    const id = this.currentId++;
    const pasaporte: Pasaporte = {
      ...insertPasaporte,
      id,
      fechaRegistro: new Date(),
    };
    this.pasaportes.set(id, pasaporte);
    return pasaporte;
  }

  async updatePasaporte(id: number, pasaporteData: Partial<InsertPasaporte>): Promise<Pasaporte | undefined> {
    const pasaporte = this.pasaportes.get(id);
    if (!pasaporte) return undefined;
    
    const updatedPasaporte = { ...pasaporte, ...pasaporteData };
    this.pasaportes.set(id, updatedPasaporte);
    return updatedPasaporte;
  }

  // Guias de Movimiento
  async getGuiaMovimiento(id: number): Promise<GuiaMovimiento | undefined> {
    return this.guiasMovimiento.get(id);
  }

  async getGuiasMovimientoByCaballo(caballoId: number): Promise<GuiaMovimiento[]> {
    return Array.from(this.guiasMovimiento.values()).filter(guia => guia.idCaballo === caballoId);
  }

  async getAllGuiasMovimiento(): Promise<GuiaMovimiento[]> {
    return Array.from(this.guiasMovimiento.values());
  }

  async createGuiaMovimiento(insertGuia: InsertGuiaMovimiento): Promise<GuiaMovimiento> {
    const id = this.currentId++;
    const guia: GuiaMovimiento = {
      ...insertGuia,
      id,
      fechaRegistro: new Date(),
    };
    this.guiasMovimiento.set(id, guia);
    return guia;
  }

  async updateGuiaMovimiento(id: number, guiaData: Partial<InsertGuiaMovimiento>): Promise<GuiaMovimiento | undefined> {
    const guia = this.guiasMovimiento.get(id);
    if (!guia) return undefined;
    
    const updatedGuia = { ...guia, ...guiaData };
    this.guiasMovimiento.set(id, updatedGuia);
    return updatedGuia;
  }

  // Certificados de Salud
  async getCertificadoSalud(id: number): Promise<CertificadoSalud | undefined> {
    return this.certificadosSalud.get(id);
  }

  async getCertificadosSaludByCaballo(caballoId: number): Promise<CertificadoSalud[]> {
    return Array.from(this.certificadosSalud.values()).filter(cert => cert.idCaballo === caballoId);
  }

  async getCertificadosExpiringSoon(): Promise<CertificadoSalud[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return Array.from(this.certificadosSalud.values()).filter(cert => {
      const validezDate = new Date(cert.fechaValidez);
      return validezDate <= thirtyDaysFromNow && validezDate >= new Date();
    });
  }

  async getAllCertificadosSalud(): Promise<CertificadoSalud[]> {
    return Array.from(this.certificadosSalud.values());
  }

  async createCertificadoSalud(insertCertificado: InsertCertificadoSalud): Promise<CertificadoSalud> {
    const id = this.currentId++;
    const certificado: CertificadoSalud = {
      ...insertCertificado,
      id,
      fechaRegistro: new Date(),
    };
    this.certificadosSalud.set(id, certificado);
    return certificado;
  }

  async updateCertificadoSalud(id: number, certificadoData: Partial<InsertCertificadoSalud>): Promise<CertificadoSalud | undefined> {
    const certificado = this.certificadosSalud.get(id);
    if (!certificado) return undefined;
    
    const updatedCertificado = { ...certificado, ...certificadoData };
    this.certificadosSalud.set(id, updatedCertificado);
    return updatedCertificado;
  }

  // Documentos Transporte UE
  async getDocumentoTransporteUe(id: number): Promise<DocumentoTransporteUe | undefined> {
    return this.documentosTransporteUe.get(id);
  }

  async getDocumentosTransporteUeByCaballo(caballoId: number): Promise<DocumentoTransporteUe[]> {
    return Array.from(this.documentosTransporteUe.values()).filter(doc => doc.idCaballo === caballoId);
  }

  async getAllDocumentosTransporteUe(): Promise<DocumentoTransporteUe[]> {
    return Array.from(this.documentosTransporteUe.values());
  }

  async createDocumentoTransporteUe(insertDocumento: InsertDocumentoTransporteUe): Promise<DocumentoTransporteUe> {
    const id = this.currentId++;
    const documento: DocumentoTransporteUe = {
      ...insertDocumento,
      id,
      fechaRegistro: new Date(),
    };
    this.documentosTransporteUe.set(id, documento);
    return documento;
  }

  async updateDocumentoTransporteUe(id: number, documentoData: Partial<InsertDocumentoTransporteUe>): Promise<DocumentoTransporteUe | undefined> {
    const documento = this.documentosTransporteUe.get(id);
    if (!documento) return undefined;
    
    const updatedDocumento = { ...documento, ...documentoData };
    this.documentosTransporteUe.set(id, updatedDocumento);
    return updatedDocumento;
  }

  // Libros de Registro
  async getLibroRegistro(id: number): Promise<LibroRegistro | undefined> {
    return this.librosRegistro.get(id);
  }

  async getLibrosRegistroByExplotacion(explotacionId: number): Promise<LibroRegistro[]> {
    return Array.from(this.librosRegistro.values()).filter(libro => libro.idExplotacion === explotacionId);
  }

  async getAllLibrosRegistro(): Promise<LibroRegistro[]> {
    return Array.from(this.librosRegistro.values());
  }

  async createLibroRegistro(insertLibro: InsertLibroRegistro): Promise<LibroRegistro> {
    const id = this.currentId++;
    const libro: LibroRegistro = {
      ...insertLibro,
      id,
      fechaUltimaActualizacion: new Date(),
    };
    this.librosRegistro.set(id, libro);
    return libro;
  }

  async updateLibroRegistro(id: number, libroData: Partial<InsertLibroRegistro>): Promise<LibroRegistro | undefined> {
    const libro = this.librosRegistro.get(id);
    if (!libro) return undefined;
    
    const updatedLibro = { ...libro, ...libroData, fechaUltimaActualizacion: new Date() };
    this.librosRegistro.set(id, updatedLibro);
    return updatedLibro;
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    totalCaballos: number;
    documentosActivos: number;
    proximosVencer: number;
    explotaciones: number;
  }> {
    const userCaballos = await this.getCaballosByUser(userId);
    const userExplotaciones = await this.getExplotacionesByUser(userId);
    
    const totalPasaportes = Array.from(this.pasaportes.values()).filter(p => 
      userCaballos.some(c => c.id === p.idCaballo)
    ).length;
    
    const totalCertificados = Array.from(this.certificadosSalud.values()).filter(c => 
      userCaballos.some(cab => cab.id === c.idCaballo)
    ).length;
    
    const pasaportesExpiring = await this.getPasaportesExpiringSoon();
    const certificadosExpiring = await this.getCertificadosExpiringSoon();
    
    const userExpiringPasaportes = pasaportesExpiring.filter(p => 
      userCaballos.some(c => c.id === p.idCaballo)
    ).length;
    
    const userExpiringCertificados = certificadosExpiring.filter(c => 
      userCaballos.some(cab => cab.id === c.idCaballo)
    ).length;

    return {
      totalCaballos: userCaballos.length,
      documentosActivos: totalPasaportes + totalCertificados,
      proximosVencer: userExpiringPasaportes + userExpiringCertificados,
      explotaciones: userExplotaciones.length,
    };
  }
}

export const storage = new MemStorage();
