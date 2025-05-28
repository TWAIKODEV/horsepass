import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema, insertExplotacionSchema, insertCaballoSchema,
  insertPasaporteSchema, insertGuiaMovimientoSchema, insertCertificadoSaludSchema,
  insertDocumentoTransporteUeSchema, insertLibroRegistroSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      await storage.updateUser(user.id, { ultimoAcceso: new Date() });
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario requerido" });
      }

      const stats = await storage.getDashboardStats(parseInt(userId));
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  // Users routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });

  // Explotaciones routes
  app.get("/api/explotaciones", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      let explotaciones;
      
      if (userId) {
        explotaciones = await storage.getExplotacionesByUser(parseInt(userId));
      } else {
        explotaciones = await storage.getAllExplotaciones();
      }
      
      res.json(explotaciones);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener explotaciones" });
    }
  });

  app.post("/api/explotaciones", async (req, res) => {
    try {
      const explotacionData = insertExplotacionSchema.parse(req.body);
      const explotacion = await storage.createExplotacion(explotacionData);
      res.json(explotacion);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.get("/api/explotaciones/:id", async (req, res) => {
    try {
      const explotacion = await storage.getExplotacion(parseInt(req.params.id));
      if (!explotacion) {
        return res.status(404).json({ message: "Explotación no encontrada" });
      }
      res.json(explotacion);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener explotación" });
    }
  });

  // Caballos routes
  app.get("/api/caballos", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const explotacionId = req.query.explotacionId as string;
      
      let caballos;
      if (userId) {
        caballos = await storage.getCaballosByUser(parseInt(userId));
      } else if (explotacionId) {
        caballos = await storage.getCaballosByExplotacion(parseInt(explotacionId));
      } else {
        caballos = await storage.getAllCaballos();
      }
      
      res.json(caballos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener caballos" });
    }
  });

  app.post("/api/caballos", async (req, res) => {
    try {
      const caballoData = insertCaballoSchema.parse(req.body);
      const caballo = await storage.createCaballo(caballoData);
      res.json(caballo);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  app.get("/api/caballos/:id", async (req, res) => {
    try {
      const caballo = await storage.getCaballo(parseInt(req.params.id));
      if (!caballo) {
        return res.status(404).json({ message: "Caballo no encontrado" });
      }
      res.json(caballo);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener caballo" });
    }
  });

  // Pasaportes routes
  app.get("/api/pasaportes", async (req, res) => {
    try {
      const caballoId = req.query.caballoId as string;
      const expiring = req.query.expiring as string;
      
      let pasaportes;
      if (caballoId) {
        pasaportes = await storage.getPasaportesByCaballo(parseInt(caballoId));
      } else if (expiring === 'true') {
        pasaportes = await storage.getPasaportesExpiringSoon();
      } else {
        pasaportes = await storage.getAllPasaportes();
      }
      
      res.json(pasaportes);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener pasaportes" });
    }
  });

  app.post("/api/pasaportes", async (req, res) => {
    try {
      const pasaporteData = insertPasaporteSchema.parse(req.body);
      const pasaporte = await storage.createPasaporte(pasaporteData);
      res.json(pasaporte);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Guías de movimiento routes
  app.get("/api/guias-movimiento", async (req, res) => {
    try {
      const caballoId = req.query.caballoId as string;
      let guias;
      
      if (caballoId) {
        guias = await storage.getGuiasMovimientoByCaballo(parseInt(caballoId));
      } else {
        guias = await storage.getAllGuiasMovimiento();
      }
      
      res.json(guias);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener guías de movimiento" });
    }
  });

  app.post("/api/guias-movimiento", async (req, res) => {
    try {
      const guiaData = insertGuiaMovimientoSchema.parse(req.body);
      const guia = await storage.createGuiaMovimiento(guiaData);
      res.json(guia);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Certificados de salud routes
  app.get("/api/certificados-salud", async (req, res) => {
    try {
      const caballoId = req.query.caballoId as string;
      const expiring = req.query.expiring as string;
      
      let certificados;
      if (caballoId) {
        certificados = await storage.getCertificadosSaludByCaballo(parseInt(caballoId));
      } else if (expiring === 'true') {
        certificados = await storage.getCertificadosExpiringSoon();
      } else {
        certificados = await storage.getAllCertificadosSalud();
      }
      
      res.json(certificados);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener certificados de salud" });
    }
  });

  app.post("/api/certificados-salud", async (req, res) => {
    try {
      const certificadoData = insertCertificadoSaludSchema.parse(req.body);
      const certificado = await storage.createCertificadoSalud(certificadoData);
      res.json(certificado);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Documentos transporte UE routes
  app.get("/api/documentos-transporte-ue", async (req, res) => {
    try {
      const caballoId = req.query.caballoId as string;
      let documentos;
      
      if (caballoId) {
        documentos = await storage.getDocumentosTransporteUeByCaballo(parseInt(caballoId));
      } else {
        documentos = await storage.getAllDocumentosTransporteUe();
      }
      
      res.json(documentos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener documentos de transporte UE" });
    }
  });

  app.post("/api/documentos-transporte-ue", async (req, res) => {
    try {
      const documentoData = insertDocumentoTransporteUeSchema.parse(req.body);
      const documento = await storage.createDocumentoTransporteUe(documentoData);
      res.json(documento);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Libros de registro routes
  app.get("/api/libros-registro", async (req, res) => {
    try {
      const explotacionId = req.query.explotacionId as string;
      let libros;
      
      if (explotacionId) {
        libros = await storage.getLibrosRegistroByExplotacion(parseInt(explotacionId));
      } else {
        libros = await storage.getAllLibrosRegistro();
      }
      
      res.json(libros);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener libros de registro" });
    }
  });

  app.post("/api/libros-registro", async (req, res) => {
    try {
      const libroData = insertLibroRegistroSchema.parse(req.body);
      const libro = await storage.createLibroRegistro(libroData);
      res.json(libro);
    } catch (error) {
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
