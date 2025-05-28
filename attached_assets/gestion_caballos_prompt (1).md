# Aplicación de Gestión de Documentación Equina (AGDE)

## 1. Descripción General

La Aplicación de Gestión de Documentación Equina (AGDE) es una solución integral diseñada para facilitar la gestión, seguimiento y cumplimiento normativo de toda la documentación obligatoria relacionada con caballos en España. Esta aplicación web permite a propietarios, veterinarios, transportistas y autoridades gestionar de forma eficiente los cinco bloques principales de documentación:

1. **Tarjeta de Identificación Equina (TIE/Pasaporte Equino)**: Documento oficial que identifica al animal durante toda su vida.
2. **Guía de Movimiento Pecuario (GMP)**: Documento necesario para el traslado de animales entre diferentes ubicaciones.
3. **Certificado de Salud Veterinaria**: Documento que acredita el estado sanitario del animal.
4. **Documento de Acompañamiento al Transporte UE**: Requerido para el transporte de equinos dentro de la Unión Europea.
5. **Libro de Registro de Explotaciones Ganaderas**: Registro obligatorio para explotaciones que mantienen equinos.

### Características principales:

- **Formularios digitales** para la creación y actualización de documentos
- **Módulo OCR** para digitalizar documentos físicos existentes
- **Integración con SITRAN** (Sistema de Trazabilidad Animal) para validación y sincronización de datos
- **Generación de PDFs** oficiales conformes a la normativa vigente
- **Panel de control** con alertas sobre documentos próximos a caducar
- **Gestión de usuarios** con diferentes niveles de acceso (propietarios, veterinarios, transportistas, autoridades)
- **Registro de actividades** para auditoría y trazabilidad

## 2. Estructura de la Base de Datos PostgreSQL

```sql
-- Esquema de la base de datos para la Aplicación de Gestión de Documentación Equina

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('propietario', 'veterinario', 'transportista', 'autoridad') NOT NULL,
    num_colegiado VARCHAR(50) NULL, -- Solo para veterinarios
    num_licencia_transporte VARCHAR(50) NULL, -- Solo para transportistas
    id_autoridad VARCHAR(50) NULL, -- Solo para autoridades
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Explotaciones Ganaderas
CREATE TABLE explotaciones (
    id SERIAL PRIMARY KEY,
    codigo_rega VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    tipo_explotacion ENUM('cría', 'reproducción', 'cebo', 'mixta', 'ocio', 'deporte') NOT NULL,
    capacidad_maxima INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_propietario INTEGER REFERENCES usuarios(id),
    activa BOOLEAN DEFAULT TRUE
);

-- Tabla de Caballos
CREATE TABLE caballos (
    id SERIAL PRIMARY KEY,
    ueln VARCHAR(15) UNIQUE NOT NULL, -- Unique Equine Life Number
    microchip VARCHAR(23) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('macho', 'hembra', 'castrado') NOT NULL,
    raza VARCHAR(100) NOT NULL,
    capa VARCHAR(50) NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    id_explotacion INTEGER REFERENCES explotaciones(id),
    id_propietario INTEGER REFERENCES usuarios(id),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Tarjetas de Identificación Equina (TIE/Pasaportes)
CREATE TABLE pasaportes (
    id SERIAL PRIMARY KEY,
    id_caballo INTEGER REFERENCES caballos(id),
    numero_pasaporte VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL,
    autoridad_emisora VARCHAR(100) NOT NULL,
    fecha_validez DATE NULL,
    url_documento VARCHAR(255) NULL, -- Ruta al documento digitalizado
    estado ENUM('vigente', 'caducado', 'suspendido', 'extraviado') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_emisor INTEGER REFERENCES usuarios(id)
);

-- Tabla de Guías de Movimiento Pecuario (GMP)
CREATE TABLE guias_movimiento (
    id SERIAL PRIMARY KEY,
    id_caballo INTEGER REFERENCES caballos(id),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL,
    explotacion_origen INTEGER REFERENCES explotaciones(id),
    explotacion_destino INTEGER REFERENCES explotaciones(id),
    fecha_salida TIMESTAMP NOT NULL,
    fecha_llegada TIMESTAMP NULL,
    motivo_traslado TEXT NOT NULL,
    medio_transporte VARCHAR(100) NOT NULL,
    matricula_vehiculo VARCHAR(20) NULL,
    id_transportista INTEGER REFERENCES usuarios(id),
    estado ENUM('emitida', 'en_transito', 'finalizada', 'cancelada') NOT NULL,
    url_documento VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_emisor INTEGER REFERENCES usuarios(id)
);

-- Tabla de Certificados de Salud Veterinaria
CREATE TABLE certificados_salud (
    id SERIAL PRIMARY KEY,
    id_caballo INTEGER REFERENCES caballos(id),
    numero_certificado VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_validez DATE NOT NULL,
    id_veterinario INTEGER REFERENCES usuarios(id),
    resultado ENUM('apto', 'no_apto', 'apto_con_restricciones') NOT NULL,
    observaciones TEXT NULL,
    vacunas_aplicadas TEXT NULL,
    pruebas_realizadas TEXT NULL,
    url_documento VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Documentos de Acompañamiento al Transporte UE
CREATE TABLE documentos_transporte_ue (
    id SERIAL PRIMARY KEY,
    id_caballo INTEGER REFERENCES caballos(id),
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision DATE NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    pais_destino VARCHAR(50) NOT NULL,
    punto_control_fronterizo VARCHAR(100) NULL,
    id_certificado_salud INTEGER REFERENCES certificados_salud(id),
    id_guia_movimiento INTEGER REFERENCES guias_movimiento(id),
    url_documento VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_emisor INTEGER REFERENCES usuarios(id)
);

-- Tabla de Libros de Registro de Explotaciones
CREATE TABLE libros_registro (
    id SERIAL PRIMARY KEY,
    id_explotacion INTEGER REFERENCES explotaciones(id),
    fecha_apertura DATE NOT NULL,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_documento VARCHAR(255) NULL,
    observaciones TEXT NULL,
    id_responsable INTEGER REFERENCES usuarios(id)
);

-- Tabla de Entradas en Libro de Registro
CREATE TABLE entradas_libro_registro (
    id SERIAL PRIMARY KEY,
    id_libro INTEGER REFERENCES libros_registro(id),
    id_caballo INTEGER REFERENCES caballos(id),
    tipo_movimiento ENUM('entrada', 'salida', 'nacimiento', 'muerte', 'tratamiento') NOT NULL,
    fecha_evento TIMESTAMP NOT NULL,
    descripcion TEXT NOT NULL,
    id_documento_relacionado INTEGER NULL, -- Puede ser ID de guía, certificado, etc.
    tipo_documento_relacionado VARCHAR(50) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_registrador INTEGER REFERENCES usuarios(id)
);

-- Tabla de Documentos Escaneados (OCR)
CREATE TABLE documentos_escaneados (
    id SERIAL PRIMARY KEY,
    tipo_documento ENUM('pasaporte', 'guia_movimiento', 'certificado_salud', 'documento_transporte_ue', 'libro_registro') NOT NULL,
    id_documento_relacionado INTEGER NULL,
    fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url_imagen_original VARCHAR(255) NOT NULL,
    texto_extraido TEXT NULL,
    estado_procesamiento ENUM('pendiente', 'procesado', 'error', 'validado') NOT NULL,
    resultado_validacion TEXT NULL,
    id_usuario INTEGER REFERENCES usuarios(id)
);

-- Tabla de Logs de Integración con SITRAN
CREATE TABLE logs_sitran (
    id SERIAL PRIMARY KEY,
    tipo_operacion ENUM('consulta', 'envio', 'actualizacion', 'validacion') NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endpoint_sitran VARCHAR(255) NOT NULL,
    datos_enviados TEXT NULL,
    respuesta_recibida TEXT NULL,
    estado ENUM('exitoso', 'error', 'pendiente') NOT NULL,
    mensaje_error TEXT NULL,
    id_documento_relacionado INTEGER NULL,
    tipo_documento_relacionado VARCHAR(50) NULL,
    id_usuario INTEGER REFERENCES usuarios(id)
);

-- Tabla de Notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('alerta', 'informacion', 'error', 'exito') NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL
);
```

## 3. Esqueleto de Código para los Componentes Principales de React (Frontend)

### Estructura de Directorios

```
/src
  /assets
    /images
    /styles
  /components
    /common
      Button.jsx
      Card.jsx
      Modal.jsx
      Notification.jsx
      Table.jsx
      Form.jsx
    /layout
      Header.jsx
      Sidebar.jsx
      Footer.jsx
      Layout.jsx
    /auth
      Login.jsx
      Register.jsx
      ForgotPassword.jsx
    /dashboard
      Dashboard.jsx
      Stats.jsx
      Alerts.jsx
    /horses
      HorseList.jsx
      HorseDetail.jsx
      HorseForm.jsx
    /documents
      PassportList.jsx
      PassportDetail.jsx
      PassportForm.jsx
      MovementGuideList.jsx
      MovementGuideDetail.jsx
      MovementGuideForm.jsx
      HealthCertificateList.jsx
      HealthCertificateDetail.jsx
      HealthCertificateForm.jsx
      EUTransportList.jsx
      EUTransportDetail.jsx
      EUTransportForm.jsx
      RegisterBookList.jsx
      RegisterBookDetail.jsx
      RegisterBookForm.jsx
    /ocr
      ScanDocument.jsx
      ProcessedDocumentList.jsx
      ValidateDocument.jsx
    /sitran
      SitranSync.jsx
      SitranStatus.jsx
  /contexts
    AuthContext.jsx
    NotificationContext.jsx
  /hooks
    useAuth.js
    useForm.js
    useApi.js
    useOcr.js
    useSitran.js
  /pages
    HomePage.jsx
    DashboardPage.jsx
    HorsesPage.jsx
    DocumentsPage.jsx
    OcrPage.jsx
    SitranPage.jsx
    SettingsPage.jsx
  /services
    api.js
    auth.js
    ocr.js
    sitran.js
    pdf.js
  /utils
    validators.js
    formatters.js
    constants.js
  App.jsx
  index.jsx
```

### Componentes Principales

#### App.jsx
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import HorsesPage from './pages/HorsesPage';
import DocumentsPage from './pages/DocumentsPage';
import OcrPage from './pages/OcrPage';
import SitranPage from './pages/SitranPage';
import SettingsPage from './pages/SettingsPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/horses" element={<HorsesPage />} />
              <Route path="/documents/*" element={<DocumentsPage />} />
              <Route path="/ocr" element={<OcrPage />} />
              <Route path="/sitran" element={<SitranPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
```

#### AuthContext.jsx
```jsx
import React, { createContext, useState, useEffect } from 'react';
import { login, logout, register, checkAuth } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const userData = await login(email, password);
      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const newUser = await register(userData);
      setUser(newUser);
      setError(null);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

#### HorseDetail.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { Card, Button, Tabs, Tab, Modal } from '../../components/common';
import HorseForm from './HorseForm';
import PassportList from '../documents/PassportList';
import MovementGuideList from '../documents/MovementGuideList';
import HealthCertificateList from '../documents/HealthCertificateList';
import EUTransportList from '../documents/EUTransportList';

const HorseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, remove } = useApi();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        const data = await get(`/api/horses/${id}`);
        setHorse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHorse();
  }, [id, get]);

  const handleDelete = async () => {
    try {
      await remove(`/api/horses/${id}`);
      navigate('/horses');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!horse) return <div>No se encontró el caballo</div>;

  return (
    <div className="horse-detail">
      <Card>
        <div className="horse-header">
          <h2>{horse.nombre}</h2>
          <div>
            <Button onClick={() => setShowEditModal(true)}>Editar</Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Eliminar</Button>
          </div>
        </div>

        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <Tab id="info" title="Información">
            <div className="horse-info">
              <div className="info-row">
                <span>UELN:</span>
                <span>{horse.ueln}</span>
              </div>
              <div className="info-row">
                <span>Microchip:</span>
                <span>{horse.microchip}</span>
              </div>
              <div className="info-row">
                <span>Fecha de nacimiento:</span>
                <span>{new Date(horse.fecha_nacimiento).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Sexo:</span>
                <span>{horse.sexo}</span>
              </div>
              <div className="info-row">
                <span>Raza:</span>
                <span>{horse.raza}</span>
              </div>
              <div className="info-row">
                <span>Capa:</span>
                <span>{horse.capa}</span>
              </div>
              <div className="info-row">
                <span>País de origen:</span>
                <span>{horse.pais_origen}</span>
              </div>
              <div className="info-row">
                <span>Explotación:</span>
                <span>{horse.explotacion?.nombre || 'No asignada'}</span>
              </div>
              <div className="info-row">
                <span>Propietario:</span>
                <span>{`${horse.propietario?.nombre} ${horse.propietario?.apellidos}` || 'No asignado'}</span>
              </div>
            </div>
          </Tab>
          <Tab id="passport" title="Pasaporte">
            <PassportList horseId={id} />
          </Tab>
          <Tab id="movement" title="Guías de Movimiento">
            <MovementGuideList horseId={id} />
          </Tab>
          <Tab id="health" title="Certificados de Salud">
            <HealthCertificateList horseId={id} />
          </Tab>
          <Tab id="transport" title="Documentos UE">
            <EUTransportList horseId={id} />
          </Tab>
        </Tabs>
      </Card>

      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Caballo"
      >
        <HorseForm
          horse={horse}
          onSuccess={(updatedHorse) => {
            setHorse(updatedHorse);
            setShowEditModal(false);
          }}
        />
      </Modal>

      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
      >
        <p>¿Está seguro de que desea eliminar este caballo? Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default HorseDetail;
```

#### ScanDocument.jsx (Componente OCR)
```jsx
import React, { useState, useRef } from 'react';
import { useOcr } from '../../hooks/useOcr';
import { useNotification } from '../../hooks/useNotification';
import { Card, Button, Form, Select } from '../../components/common';

const ScanDocument = () => {
  const fileInputRef = useRef(null);
  const { scanDocument, processingStatus } = useOcr();
  const { showNotification } = useNotification();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { value: 'pasaporte', label: 'Tarjeta de Identificación Equina (TIE/Pasaporte)' },
    { value: 'guia_movimiento', label: 'Guía de Movimiento Pecuario (GMP)' },
    { value: 'certificado_salud', label: 'Certificado de Salud Veterinaria' },
    { value: 'documento_transporte_ue', label: 'Documento de Acompañamiento al Transporte UE' },
    { value: 'libro_registro', label: 'Libro de Registro de Explotaciones Ganaderas' },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !documentType) {
      showNotification('Por favor, seleccione un archivo y tipo de documento', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await scanDocument(file, documentType);
      showNotification('Documento escaneado correctamente', 'success');
      // Redirect to validation page with the document ID
      // navigate(`/ocr/validate/${result.id}`);
    } catch (error) {
      showNotification(`Error al escanear el documento: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2>Escanear Documento</h2>
      <p>Suba una imagen clara del documento para procesarla con OCR.</p>
      
      <Form onSubmit={handleSubmit}>
        <Select
          label="Tipo de Documento"
          options={documentTypes}
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          required
        />
        
        <div className="file-upload">
          <Button 
            type="button" 
            onClick={() => fileInputRef.current.click()}
            variant="secondary"
          >
            Seleccionar Archivo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          {file && <span className="file-name">{file.name}</span>}
        </div>
        
        {preview && (
          <div className="image-preview">
            <h3>Vista previa</h3>
            <img src={preview} alt="Vista previa del documento" />
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={!file || !documentType || loading}
        >
          {loading ? 'Procesando...' : 'Escanear Documento'}
        </Button>
      </Form>
      
      {processingStatus && (
        <div className="processing-status">
          <h3>Estado del procesamiento</h3>
          <p>Estado: {processingStatus.status}</p>
          {processingStatus.progress && (
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${processingStatus.progress}%` }}
              ></div>
            </div>
          )}
          {processingStatus.message && <p>{processingStatus.message}</p>}
        </div>
      )}
    </Card>
  );
};

export default ScanDocument;
```

#### SitranSync.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { useSitran } from '../../hooks/useSitran';
import { useNotification } from '../../hooks/useNotification';
import { Card, Button, Table, Modal, Form } from '../../components/common';

const SitranSync = () => {
  const { getSyncStatus, syncData, syncHistory } = useSitran();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncOptions, setSyncOptions] = useState({
    syncPassports: true,
    syncMovementGuides: true,
    syncHealthCertificates: true,
    syncTransportDocs: true,
    syncFarms: true,
  });

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    setLoading(true);
    try {
      const data = await getSyncStatus();
      setStatus(data);
    } catch (error) {
      showNotification(`Error al obtener el estado de sincronización: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await syncData(syncOptions);
      showNotification('Sincronización con SITRAN iniciada correctamente', 'success');
      setShowSyncModal(false);
      // Refresh status after sync
      fetchSyncStatus();
    } catch (error) {
      showNotification(`Error al sincronizar con SITRAN: ${error.message}`, 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSyncOptionChange = (e) => {
    const { name, checked } = e.target;
    setSyncOptions(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  if (loading && !status) return <div>Cargando...</div>;

  return (
    <div className="sitran-sync">
      <Card>
        <div className="card-header">
          <h2>Sincronización con SITRAN</h2>
          <Button onClick={() => setShowSyncModal(true)}>Sincronizar Ahora</Button>
        </div>
        
        <div className="sync-status">
          <h3>Estado de la Sincronización</h3>
          {status ? (
            <div className="status-details">
              <div className="status-item">
                <span>Última sincronización:</span>
                <span>{new Date(status.lastSync).toLocaleString()}</span>
              </div>
              <div className="status-item">
                <span>Estado:</span>
                <span className={`status-badge ${status.status}`}>{status.status}</span>
              </div>
              <div className="status-item">
                <span>Documentos sincronizados:</span>
                <span>{status.syncedDocuments}</span>
              </div>
              <div className="status-item">
                <span>Documentos pendientes:</span>
                <span>{status.pendingDocuments}</span>
              </div>
              <div className="status-item">
                <span>Documentos con errores:</span>
                <span>{status.errorDocuments}</span>
              </div>
            </div>
          ) : (
            <p>No hay información de sincronización disponible</p>
          )}
        </div>
        
        <div className="sync-history">
          <h3>Historial de Sincronizaciones</h3>
          <Table
            columns={[
              { key: 'date', title: 'Fecha' },
              { key: 'status', title: 'Estado' },
              { key: 'documents', title: 'Documentos' },
              { key: 'user', title: 'Usuario' },
            ]}
            data={syncHistory.map(item => ({
              date: new Date(item.date).toLocaleString(),
              status: item.status,
              documents: item.documents,
              user: item.user,
            }))}
            emptyMessage="No hay historial de sincronizaciones"
          />
        </div>
      </Card>
      
      <Modal
        show={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="Sincronizar con SITRAN"
      >
        <Form onSubmit={handleSync}>
          <p>Seleccione los tipos de documentos que desea sincronizar:</p>
          
          <div className="checkbox-group">
            <Form.Checkbox
              name="syncPassports"
              label="Tarjetas de Identificación Equina (TIE/Pasaportes)"
              checked={syncOptions.syncPassports}
              onChange={handleSyncOptionChange}
            />
            <Form.Checkbox
              name="syncMovementGuides"
              label="Guías de Movimiento Pecuario (GMP)"
              checked={syncOptions.syncMovementGuides}
              onChange={handleSyncOptionChange}
            />
            <Form.Checkbox
              name="syncHealthCertificates"
              label="Certificados de Salud Veterinaria"
              checked={syncOptions.syncHealthCertificates}
              onChange={handleSyncOptionChange}
            />
            <Form.Checkbox
              name="syncTransportDocs"
              label="Documentos de Acompañamiento al Transporte UE"
              checked={syncOptions.syncTransportDocs}
              onChange={handleSyncOptionChange}
            />
            <Form.Checkbox
              name="syncFarms"
              label="Explotaciones Ganaderas"
              checked={syncOptions.syncFarms}
              onChange={handleSyncOptionChange}
            />
          </div>
          
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowSyncModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={syncLoading}>
              {syncLoading ? 'Sincronizando...' : 'Iniciar Sincronización'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SitranSync;
```

## 4. Esqueleto de Código para los Endpoints Principales de la API en Node.js (Backend)

### Estructura de Directorios

```
/src
  /config
    database.js
    server.js
    auth.js
    sitran.js
    ocr.js
  /controllers
    authController.js
    userController.js
    horseController.js
    farmController.js
    passportController.js
    movementGuideController.js
    healthCertificateController.js
    euTransportController.js
    registerBookController.js
    ocrController.js
    sitranController.js
    pdfController.js
  /middleware
    auth.js
    validation.js
    errorHandler.js
    logger.js
  /models
    User.js
    Horse.js
    Farm.js
    Passport.js
    MovementGuide.js
    HealthCertificate.js
    EUTransport.js
    RegisterBook.js
    RegisterEntry.js
    ScannedDocument.js
    SitranLog.js
    Notification.js
  /routes
    authRoutes.js
    userRoutes.js
    horseRoutes.js
    farmRoutes.js
    documentRoutes.js
    ocrRoutes.js
    sitranRoutes.js
    pdfRoutes.js
  /services
    authService.js
    emailService.js
    ocrService.js
    sitranService.js
    pdfService.js
    validationService.js
  /utils
    validators.js
    formatters.js
    constants.js
    helpers.js
  /tests
    /unit
    /integration
  app.js
  server.js
```

### Código Principal

#### app.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const horseRoutes = require('./routes/horseRoutes');
const farmRoutes = require('./routes/farmRoutes');
const documentRoutes = require('./routes/documentRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const sitranRoutes = require('./routes/sitranRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/sitran', sitranRoutes);
app.use('/api/pdf', pdfRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
```

#### server.js
```javascript
const app = require('./app');
const { PORT } = require('./config/server');

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
```

#### config/database.js
```javascript
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB,
  query: (text, params) => pool.query(text, params),
};
```

#### controllers/horseController.js
```javascript
const db = require('../config/database');
const { validateHorse } = require('../utils/validators');

// @desc    Get all horses
// @route   GET /api/horses
// @access  Private
exports.getHorses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sort, filter } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT h.*, 
        e.nombre as explotacion_nombre,
        CONCAT(u.nombre, ' ', u.apellidos) as propietario_nombre
      FROM caballos h
      LEFT JOIN explotaciones e ON h.id_explotacion = e.id
      LEFT JOIN usuarios u ON h.id_propietario = u.id
      WHERE h.activo = true
    `;
    
    const queryParams = [];
    
    // Add search functionality
    if (search) {
      query += ` AND (h.nombre ILIKE $${queryParams.length + 1} 
        OR h.ueln ILIKE $${queryParams.length + 1}
        OR h.microchip ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }
    
    // Add filters
    if (filter) {
      const filters = JSON.parse(filter);
      
      if (filters.raza) {
        query += ` AND h.raza = $${queryParams.length + 1}`;
        queryParams.push(filters.raza);
      }
      
      if (filters.sexo) {
        query += ` AND h.sexo = $${queryParams.length + 1}`;
        queryParams.push(filters.sexo);
      }
      
      if (filters.id_explotacion) {
        query += ` AND h.id_explotacion = $${queryParams.length + 1}`;
        queryParams.push(filters.id_explotacion);
      }
    }
    
    // Add sorting
    if (sort) {
      const [field, order] = sort.split(':');
      const validFields = ['nombre', 'fecha_nacimiento', 'raza', 'ueln'];
      const validOrders = ['asc', 'desc'];
      
      if (validFields.includes(field) && validOrders.includes(order.toLowerCase())) {
        query += ` ORDER BY h.${field} ${order}`;
      } else {
        query += ` ORDER BY h.nombre ASC`;
      }
    } else {
      query += ` ORDER BY h.nombre ASC`;
    }
    
    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM caballos h
      WHERE h.activo = true
    `;
    
    const [horses, countResult] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      success: true,
      count: horses.rows.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: horses.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single horse
// @route   GET /api/horses/:id
// @access  Private
exports.getHorse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT h.*, 
        e.nombre as explotacion_nombre,
        e.codigo_rega as explotacion_codigo,
        CONCAT(u.nombre, ' ', u.apellidos) as propietario_nombre,
        u.email as propietario_email
      FROM caballos h
      LEFT JOIN explotaciones e ON h.id_explotacion = e.id
      LEFT JOIN usuarios u ON h.id_propietario = u.id
      WHERE h.id = $1 AND h.activo = true
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caballo no encontrado'
      });
    }
    
    // Get related documents counts
    const documentCountsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM pasaportes WHERE id_caballo = $1) as pasaportes_count,
        (SELECT COUNT(*) FROM guias_movimiento WHERE id_caballo = $1) as guias_count,
        (SELECT COUNT(*) FROM certificados_salud WHERE id_caballo = $1) as certificados_count,
        (SELECT COUNT(*) FROM documentos_transporte_ue WHERE id_caballo = $1) as transporte_ue_count
    `;
    
    const documentCounts = await db.query(documentCountsQuery, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        documentos: documentCounts.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new horse
// @route   POST /api/horses
// @access  Private
exports.createHorse = async (req, res, next) => {
  try {
    const { error } = validateHorse(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const {
      ueln,
      microchip,
      nombre,
      fecha_nacimiento,
      sexo,
      raza,
      capa,
      pais_origen,
      id_explotacion,
      id_propietario
    } = req.body;
    
    // Check if UELN or microchip already exists
    const checkQuery = `
      SELECT id FROM caballos 
      WHERE (ueln = $1 OR microchip = $2) AND activo = true
    `;
    
    const checkResult = await db.query(checkQuery, [ueln, microchip]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un caballo con ese UELN o microchip'
      });
    }
    
    // Create horse
    const query = `
      INSERT INTO caballos (
        ueln, microchip, nombre, fecha_nacimiento, sexo, raza, capa, 
        pais_origen, id_explotacion, id_propietario, fecha_registro
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [
      ueln,
      microchip,
      nombre,
      fecha_nacimiento,
      sexo,
      raza,
      capa,
      pais_origen,
      id_explotacion,
      id_propietario
    ];
    
    const result = await db.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update horse
// @route   PUT /api/horses/:id
// @access  Private
exports.updateHorse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if horse exists
    const checkQuery = `
      SELECT id FROM caballos 
      WHERE id = $1 AND activo = true
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caballo no encontrado'
      });
    }
    
    const { error } = validateHorse(req.body, true);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const {
      nombre,
      fecha_nacimiento,
      sexo,
      raza,
      capa,
      pais_origen,
      id_explotacion,
      id_propietario
    } = req.body;
    
    // Update horse
    const query = `
      UPDATE caballos
      SET 
        nombre = $1,
        fecha_nacimiento = $2,
        sexo = $3,
        raza = $4,
        capa = $5,
        pais_origen = $6,
        id_explotacion = $7,
        id_propietario = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      nombre,
      fecha_nacimiento,
      sexo,
      raza,
      capa,
      pais_origen,
      id_explotacion,
      id_propietario,
      id
    ];
    
    const result = await db.query(query, values);
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete horse
// @route   DELETE /api/horses/:id
// @access  Private
exports.deleteHorse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if horse exists
    const checkQuery = `
      SELECT id FROM caballos 
      WHERE id = $1 AND activo = true
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Caballo no encontrado'
      });
    }
    
    // Soft delete horse
    const query = `
      UPDATE caballos
      SET activo = false
      WHERE id = $1
      RETURNING id
    `;
    
    await db.query(query, [id]);
    
    res.status(200).json({
      success: true,
      message: 'Caballo eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
```

#### controllers/ocrController.js
```javascript
const db = require('../config/database');
const ocrService = require('../services/ocrService');
const { validateOcrRequest } = require('../utils/validators');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @desc    Scan document with OCR
// @route   POST /api/ocr/scan
// @access  Private
exports.scanDocument = async (req, res, next) => {
  try {
    // Validate request
    const { error } = validateOcrRequest(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, suba una imagen del documento'
      });
    }

    const { tipo_documento } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Save original image
    const filename = `${uuidv4()}-${file.originalname}`;
    const uploadPath = path.join(__dirname, '../uploads/ocr');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    const filePath = path.join(uploadPath, filename);
    fs.writeFileSync(filePath, file.buffer);
    
    // Create record in database
    const query = `
      INSERT INTO documentos_escaneados (
        tipo_documento, 
        url_imagen_original, 
        estado_procesamiento, 
        id_usuario,
        fecha_escaneo
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    
    const values = [
      tipo_documento,
      `/uploads/ocr/${filename}`,
      'pendiente',
      userId
    ];
    
    const result = await db.query(query, values);
    const documentId = result.rows[0].id;
    
    // Process OCR asynchronously
    ocrService.processDocument(documentId, filePath, tipo_documento)
      .then(async (ocrResult) => {
        // Update database with OCR results
        const updateQuery = `
          UPDATE documentos_escaneados
          SET 
            texto_extraido = $1,
            estado_procesamiento = $2
          WHERE id = $3
        `;
        
        await db.query(updateQuery, [
          JSON.stringify(ocrResult),
          'procesado',
          documentId
        ]);
      })
      .catch(async (error) => {
        // Update database with error
        const updateQuery = `
          UPDATE documentos_escaneados
          SET 
            estado_procesamiento = $1,
            resultado_validacion = $2
          WHERE id = $3
        `;
        
        await db.query(updateQuery, [
          'error',
          error.message,
          documentId
        ]);
      });
    
    // Return immediate response
    res.status(202).json({
      success: true,
      message: 'Documento enviado para procesamiento OCR',
      data: {
        id: documentId,
        status: 'pendiente'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get OCR processing status
// @route   GET /api/ocr/status/:id
// @access  Private
exports.getOcrStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, 
        tipo_documento, 
        estado_procesamiento, 
        fecha_escaneo,
        resultado_validacion
      FROM documentos_escaneados
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get OCR results
// @route   GET /api/ocr/results/:id
// @access  Private
exports.getOcrResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, 
        tipo_documento, 
        texto_extraido, 
        estado_procesamiento,
        url_imagen_original
      FROM documentos_escaneados
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    const document = result.rows[0];
    
    if (document.estado_procesamiento !== 'procesado') {
      return res.status(400).json({
        success: false,
        message: `El documento aún no ha sido procesado. Estado actual: ${document.estado_procesamiento}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: document.id,
        tipo_documento: document.tipo_documento,
        texto_extraido: JSON.parse(document.texto_extraido),
        url_imagen: document.url_imagen_original
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate OCR results and create document
// @route   POST /api/ocr/validate/:id
// @access  Private
exports.validateOcrResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { datos_validados, id_documento_relacionado, tipo_documento_relacionado } = req.body;
    
    // Check if document exists and is processed
    const checkQuery = `
      SELECT 
        id, 
        tipo_documento, 
        texto_extraido, 
        estado_procesamiento
      FROM documentos_escaneados
      WHERE id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    const document = checkResult.rows[0];
    
    if (document.estado_procesamiento !== 'procesado') {
      return res.status(400).json({
        success: false,
        message: `El documento aún no ha sido procesado. Estado actual: ${document.estado_procesamiento}`
      });
    }
    
    // Update document status to validated
    const updateQuery = `
      UPDATE documentos_escaneados
      SET 
        estado_procesamiento = 'validado',
        id_documento_relacionado = $1,
        tipo_documento_relacionado = $2,
        resultado_validacion = $3
      WHERE id = $4
      RETURNING id
    `;
    
    await db.query(updateQuery, [
      id_documento_relacionado,
      tipo_documento_relacionado,
      JSON.stringify(datos_validados),
      id
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Documento validado correctamente',
      data: {
        id,
        id_documento_relacionado,
        tipo_documento_relacionado
      }
    });
  } catch (error) {
    next(error);
  }
};
```

#### controllers/sitranController.js
```javascript
const db = require('../config/database');
const sitranService = require('../services/sitranService');

// @desc    Get SITRAN sync status
// @route   GET /api/sitran/status
// @access  Private
exports.getSyncStatus = async (req, res, next) => {
  try {
    // Get last sync info
    const lastSyncQuery = `
      SELECT 
        MAX(fecha_operacion) as last_sync,
        (
          SELECT estado 
          FROM logs_sitran 
          ORDER BY fecha_operacion DESC 
          LIMIT 1
        ) as status
      FROM logs_sitran
    `;
    
    // Get document counts
    const countsQuery = `
      SELECT 
        (
          SELECT COUNT(*) 
          FROM logs_sitran 
          WHERE estado = 'exitoso' AND fecha_operacion > NOW() - INTERVAL '30 days'
        ) as synced_documents,
        (
          SELECT COUNT(*) 
          FROM logs_sitran 
          WHERE estado = 'pendiente'
        ) as pending_documents,
        (
          SELECT COUNT(*) 
          FROM logs_sitran 
          WHERE estado = 'error' AND fecha_operacion > NOW() - INTERVAL '30 days'
        ) as error_documents
    `;
    
    const [lastSyncResult, countsResult] = await Promise.all([
      db.query(lastSyncQuery),
      db.query(countsQuery)
    ]);
    
    const lastSync = lastSyncResult.rows[0].last_sync;
    const status = lastSyncResult.rows[0].status || 'sin sincronización';
    const { synced_documents, pending_documents, error_documents } = countsResult.rows[0];
    
    res.status(200).json({
      success: true,
      data: {
        lastSync,
        status,
        syncedDocuments: parseInt(synced_documents),
        pendingDocuments: parseInt(pending_documents),
        errorDocuments: parseInt(error_documents)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync data with SITRAN
// @route   POST /api/sitran/sync
// @access  Private (Admin/Authority)
exports.syncData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      syncPassports = true,
      syncMovementGuides = true,
      syncHealthCertificates = true,
      syncTransportDocs = true,
      syncFarms = true
    } = req.body;
    
    // Start sync process asynchronously
    sitranService.startSync({
      userId,
      syncPassports,
      syncMovementGuides,
      syncHealthCertificates,
      syncTransportDocs,
      syncFarms
    })
      .then(() => {
        console.log('SITRAN sync completed successfully');
      })
      .catch((error) => {
        console.error('SITRAN sync error:', error);
      });
    
    // Return immediate response
    res.status(202).json({
      success: true,
      message: 'Sincronización con SITRAN iniciada',
      data: {
        status: 'pendiente'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SITRAN sync history
// @route   GET /api/sitran/history
// @access  Private
exports.getSyncHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        l.id,
        l.tipo_operacion,
        l.fecha_operacion,
        l.endpoint_sitran,
        l.estado,
        l.mensaje_error,
        CONCAT(u.nombre, ' ', u.apellidos) as usuario
      FROM logs_sitran l
      LEFT JOIN usuarios u ON l.id_usuario = u.id
      ORDER BY l.fecha_operacion DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `SELECT COUNT(*) FROM logs_sitran`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate document with SITRAN
// @route   POST /api/sitran/validate
// @access  Private
exports.validateWithSitran = async (req, res, next) => {
  try {
    const { tipo_documento, id_documento, datos } = req.body;
    const userId = req.user.id;
    
    // Log the validation request
    const logQuery = `
      INSERT INTO logs_sitran (
        tipo_operacion,
        endpoint_sitran,
        datos_enviados,
        estado,
        id_documento_relacionado,
        tipo_documento_relacionado,
        id_usuario
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    const logValues = [
      'validacion',
      '/api/validate',
      JSON.stringify(datos),
      'pendiente',
      id_documento,
      tipo_documento,
      userId
    ];
    
    const logResult = await db.query(logQuery, logValues);
    const logId = logResult.rows[0].id;
    
    // Perform validation with SITRAN
    try {
      const validationResult = await sitranService.validateDocument(tipo_documento, datos);
      
      // Update log with result
      const updateLogQuery = `
        UPDATE logs_sitran
        SET 
          estado = $1,
          respuesta_recibida = $2
        WHERE id = $3
      `;
      
      await db.query(updateLogQuery, [
        'exitoso',
        JSON.stringify(validationResult),
        logId
      ]);
      
      res.status(200).json({
        success: true,
        message: 'Documento validado correctamente con SITRAN',
        data: validationResult
      });
    } catch (error) {
      // Update log with error
      const updateLogQuery = `
        UPDATE logs_sitran
        SET 
          estado = $1,
          mensaje_error = $2
        WHERE id = $3
      `;
      
      await db.query(updateLogQuery, [
        'error',
        error.message,
        logId
      ]);
      
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
```

#### services/ocrService.js
```javascript
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// OCR processing function
exports.processDocument = async (documentId, imagePath, documentType) => {
  try {
    console.log(`Processing document ${documentId} of type ${documentType}`);
    
    // Create Tesseract worker
    const worker = await createWorker('spa');
    
    // Set parameters based on document type
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-/:.,;()[]{}¿?¡!áéíóúÁÉÍÓÚüÜñÑ ',
    });
    
    // Recognize text
    const { data } = await worker.recognize(imagePath);
    
    // Process extracted text based on document type
    const extractedData = processExtractedText(data.text, documentType);
    
    // Terminate worker
    await worker.terminate();
    
    return extractedData;
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    throw new Error(`Error en el procesamiento OCR: ${error.message}`);
  }
};

// Process extracted text based on document type
const processExtractedText = (text, documentType) => {
  // Basic structure for extracted data
  const extractedData = {
    raw_text: text,
    fields: {}
  };
  
  switch (documentType) {
    case 'pasaporte':
      extractedData.fields = extractPassportFields(text);
      break;
    case 'guia_movimiento':
      extractedData.fields = extractMovementGuideFields(text);
      break;
    case 'certificado_salud':
      extractedData.fields = extractHealthCertificateFields(text);
      break;
    case 'documento_transporte_ue':
      extractedData.fields = extractEUTransportFields(text);
      break;
    case 'libro_registro':
      extractedData.fields = extractRegisterBookFields(text);
      break;
    default:
      extractedData.fields = {};
  }
  
  return extractedData;
};

// Extract fields from Passport/TIE
const extractPassportFields = (text) => {
  const fields = {};
  
  // UELN (Unique Equine Life Number)
  const uelnMatch = text.match(/UELN:?\s*([0-9]{15})/i) || 
                    text.match(/[0-9]{3}-[0-9]{3}-[0-9]{9}/);
  if (uelnMatch) {
    fields.ueln = uelnMatch[1].replace(/-/g, '');
  }
  
  // Microchip
  const microchipMatch = text.match(/microchip:?\s*([0-9]{15})/i) ||
                          text.match(/[0-9]{15}/);
  if (microchipMatch) {
    fields.microchip = microchipMatch[1];
  }
  
  // Horse name
  const nameMatch = text.match(/nombre:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (nameMatch) {
    fields.nombre = nameMatch[1].trim();
  }
  
  // Date of birth
  const dobMatch = text.match(/nacimiento:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (dobMatch) {
    fields.fecha_nacimiento = dobMatch[1];
  }
  
  // Sex
  const sexMatch = text.match(/sexo:?\s*([A-Za-z]+)/i);
  if (sexMatch) {
    const sexText = sexMatch[1].toLowerCase();
    if (sexText.includes('macho') || sexText === 'm') {
      fields.sexo = 'macho';
    } else if (sexText.includes('hembra') || sexText === 'h' || sexText === 'f') {
      fields.sexo = 'hembra';
    } else if (sexText.includes('castrado')) {
      fields.sexo = 'castrado';
    }
  }
  
  // Breed
  const breedMatch = text.match(/raza:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (breedMatch) {
    fields.raza = breedMatch[1].trim();
  }
  
  // Color
  const colorMatch = text.match(/capa:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (colorMatch) {
    fields.capa = colorMatch[1].trim();
  }
  
  // Country of origin
  const countryMatch = text.match(/país\s+de\s+origen:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (countryMatch) {
    fields.pais_origen = countryMatch[1].trim();
  }
  
  // Passport number
  const passportMatch = text.match(/pasaporte:?\s*([A-Za-z0-9-]+)/i);
  if (passportMatch) {
    fields.numero_pasaporte = passportMatch[1].trim();
  }
  
  // Issuing authority
  const authorityMatch = text.match(/autoridad\s+emisora:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (authorityMatch) {
    fields.autoridad_emisora = authorityMatch[1].trim();
  }
  
  // Issue date
  const issueDateMatch = text.match(/fecha\s+de\s+emisión:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    fields.fecha_emision = issueDateMatch[1];
  }
  
  return fields;
};

// Extract fields from Movement Guide
const extractMovementGuideFields = (text) => {
  const fields = {};
  
  // Guide number
  const guideNumberMatch = text.match(/guía\s+n[úu]mero:?\s*([A-Za-z0-9-\/]+)/i);
  if (guideNumberMatch) {
    fields.numero_guia = guideNumberMatch[1].trim();
  }
  
  // Issue date
  const issueDateMatch = text.match(/fecha\s+de\s+emisión:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    fields.fecha_emision = issueDateMatch[1];
  }
  
  // Origin farm
  const originFarmMatch = text.match(/explotación\s+de\s+origen:?\s*([A-Za-z0-9\s]+)/i);
  if (originFarmMatch) {
    fields.explotacion_origen = originFarmMatch[1].trim();
  }
  
  // Origin farm code (REGA)
  const originCodeMatch = text.match(/código\s+REGA\s+origen:?\s*([A-Za-z0-9]+)/i);
  if (originCodeMatch) {
    fields.codigo_rega_origen = originCodeMatch[1].trim();
  }
  
  // Destination farm
  const destFarmMatch = text.match(/explotación\s+de\s+destino:?\s*([A-Za-z0-9\s]+)/i);
  if (destFarmMatch) {
    fields.explotacion_destino = destFarmMatch[1].trim();
  }
  
  // Destination farm code (REGA)
  const destCodeMatch = text.match(/código\s+REGA\s+destino:?\s*([A-Za-z0-9]+)/i);
  if (destCodeMatch) {
    fields.codigo_rega_destino = destCodeMatch[1].trim();
  }
  
  // Departure date
  const departureDateMatch = text.match(/fecha\s+de\s+salida:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (departureDateMatch) {
    fields.fecha_salida = departureDateMatch[1];
  }
  
  // Transport reason
  const reasonMatch = text.match(/motivo\s+del\s+traslado:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (reasonMatch) {
    fields.motivo_traslado = reasonMatch[1].trim();
  }
  
  // Transport means
  const transportMatch = text.match(/medio\s+de\s+transporte:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (transportMatch) {
    fields.medio_transporte = transportMatch[1].trim();
  }
  
  // Vehicle registration
  const vehicleMatch = text.match(/matrícula:?\s*([A-Za-z0-9-]+)/i);
  if (vehicleMatch) {
    fields.matricula_vehiculo = vehicleMatch[1].trim();
  }
  
  // Animal identification (UELN or microchip)
  const animalIdMatch = text.match(/identificación\s+del\s+animal:?\s*([A-Za-z0-9-]+)/i);
  if (animalIdMatch) {
    fields.identificacion_animal = animalIdMatch[1].trim();
  }
  
  return fields;
};

// Extract fields from Health Certificate
const extractHealthCertificateFields = (text) => {
  const fields = {};
  
  // Certificate number
  const certNumberMatch = text.match(/certificado\s+n[úu]mero:?\s*([A-Za-z0-9-\/]+)/i);
  if (certNumberMatch) {
    fields.numero_certificado = certNumberMatch[1].trim();
  }
  
  // Issue date
  const issueDateMatch = text.match(/fecha\s+de\s+emisión:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    fields.fecha_emision = issueDateMatch[1];
  }
  
  // Validity date
  const validityDateMatch = text.match(/fecha\s+de\s+validez:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (validityDateMatch) {
    fields.fecha_validez = validityDateMatch[1];
  }
  
  // Veterinarian
  const vetMatch = text.match(/veterinario:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (vetMatch) {
    fields.veterinario = vetMatch[1].trim();
  }
  
  // Veterinarian license number
  const vetLicenseMatch = text.match(/n[úu]mero\s+de\s+colegiado:?\s*([A-Za-z0-9-\/]+)/i);
  if (vetLicenseMatch) {
    fields.num_colegiado = vetLicenseMatch[1].trim();
  }
  
  // Result
  const resultMatch = text.match(/resultado:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (resultMatch) {
    const resultText = resultMatch[1].toLowerCase().trim();
    if (resultText.includes('apto') && resultText.includes('restricciones')) {
      fields.resultado = 'apto_con_restricciones';
    } else if (resultText.includes('apto')) {
      fields.resultado = 'apto';
    } else if (resultText.includes('no apto')) {
      fields.resultado = 'no_apto';
    }
  }
  
  // Animal identification (UELN or microchip)
  const animalIdMatch = text.match(/identificación\s+del\s+animal:?\s*([A-Za-z0-9-]+)/i);
  if (animalIdMatch) {
    fields.identificacion_animal = animalIdMatch[1].trim();
  }
  
  // Observations
  const obsMatch = text.match(/observaciones:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s.,;:]+)/i);
  if (obsMatch) {
    fields.observaciones = obsMatch[1].trim();
  }
  
  return fields;
};

// Extract fields from EU Transport Document
const extractEUTransportFields = (text) => {
  const fields = {};
  
  // Document number
  const docNumberMatch = text.match(/documento\s+n[úu]mero:?\s*([A-Za-z0-9-\/]+)/i);
  if (docNumberMatch) {
    fields.numero_documento = docNumberMatch[1].trim();
  }
  
  // Issue date
  const issueDateMatch = text.match(/fecha\s+de\s+emisión:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    fields.fecha_emision = issueDateMatch[1];
  }
  
  // Origin country
  const originCountryMatch = text.match(/país\s+de\s+origen:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (originCountryMatch) {
    fields.pais_origen = originCountryMatch[1].trim();
  }
  
  // Destination country
  const destCountryMatch = text.match(/país\s+de\s+destino:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (destCountryMatch) {
    fields.pais_destino = destCountryMatch[1].trim();
  }
  
  // Border control point
  const borderControlMatch = text.match(/punto\s+de\s+control\s+fronterizo:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (borderControlMatch) {
    fields.punto_control_fronterizo = borderControlMatch[1].trim();
  }
  
  // Health certificate reference
  const healthCertMatch = text.match(/certificado\s+de\s+salud:?\s*([A-Za-z0-9-\/]+)/i);
  if (healthCertMatch) {
    fields.referencia_certificado_salud = healthCertMatch[1].trim();
  }
  
  // Movement guide reference
  const movementGuideMatch = text.match(/guía\s+de\s+movimiento:?\s*([A-Za-z0-9-\/]+)/i);
  if (movementGuideMatch) {
    fields.referencia_guia_movimiento = movementGuideMatch[1].trim();
  }
  
  // Animal identification (UELN or microchip)
  const animalIdMatch = text.match(/identificación\s+del\s+animal:?\s*([A-Za-z0-9-]+)/i);
  if (animalIdMatch) {
    fields.identificacion_animal = animalIdMatch[1].trim();
  }
  
  return fields;
};

// Extract fields from Register Book
const extractRegisterBookFields = (text) => {
  const fields = {};
  
  // Farm code (REGA)
  const farmCodeMatch = text.match(/código\s+REGA:?\s*([A-Za-z0-9]+)/i);
  if (farmCodeMatch) {
    fields.codigo_rega = farmCodeMatch[1].trim();
  }
  
  // Farm name
  const farmNameMatch = text.match(/nombre\s+de\s+la\s+explotación:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (farmNameMatch) {
    fields.nombre_explotacion = farmNameMatch[1].trim();
  }
  
  // Opening date
  const openingDateMatch = text.match(/fecha\s+de\s+apertura:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (openingDateMatch) {
    fields.fecha_apertura = openingDateMatch[1];
  }
  
  // Last update date
  const updateDateMatch = text.match(/fecha\s+de\s+actualización:?\s*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (updateDateMatch) {
    fields.fecha_actualizacion = updateDateMatch[1];
  }
  
  // Responsible person
  const responsibleMatch = text.match(/responsable:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+)/i);
  if (responsibleMatch) {
    fields.responsable = responsibleMatch[1].trim();
  }
  
  // Observations
  const obsMatch = text.match(/observaciones:?\s*([A-Za-záéíóúÁÉÍÓÚüÜñÑ\s.,;:]+)/i);
  if (obsMatch) {
    fields.observaciones = obsMatch[1].trim();
  }
  
  return fields;
};
```

#### services/sitranService.js
```javascript
const axios = require('axios');
const db = require('../config/database');
const { SITRAN_API_URL, SITRAN_API_KEY } = require('../config/sitran');

// SITRAN API client
const sitranClient = axios.create({
  baseURL: SITRAN_API_URL,
  headers: {
    'Authorization': `Bearer ${SITRAN_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Start sync process with SITRAN
exports.startSync = async (options) => {
  const {
    userId,
    syncPassports = true,
    syncMovementGuides = true,
    syncHealthCertificates = true,
    syncTransportDocs = true,
    syncFarms = true
  } = options;
  
  try {
    console.log('Starting SITRAN sync process');
    
    // Log sync start
    await logSitranOperation({
      tipo_operacion: 'sincronizacion',
      endpoint_sitran: '/api/sync',
      datos_enviados: JSON.stringify(options),
      estado: 'pendiente',
      id_usuario: userId
    });
    
    // Sync data in parallel
    const syncPromises = [];
    
    if (syncPassports) {
      syncPromises.push(syncPassportsWithSitran(userId));
    }
    
    if (syncMovementGuides) {
      syncPromises.push(syncMovementGuidesWithSitran(userId));
    }
    
    if (syncHealthCertificates) {
      syncPromises.push(syncHealthCertificatesWithSitran(userId));
    }
    
    if (syncTransportDocs) {
      syncPromises.push(syncTransportDocsWithSitran(userId));
    }
    
    if (syncFarms) {
      syncPromises.push(syncFarmsWithSitran(userId));
    }
    
    await Promise.all(syncPromises);
    
    // Log sync completion
    await logSitranOperation({
      tipo_operacion: 'sincronizacion',
      endpoint_sitran: '/api/sync',
      datos_enviados: JSON.stringify(options),
      respuesta_recibida: JSON.stringify({ status: 'completed' }),
      estado: 'exitoso',
      id_usuario: userId
    });
    
    console.log('SITRAN sync process completed');
    return { status: 'completed' };
  } catch (error) {
    console.error('Error in SITRAN sync process:', error);
    
    // Log sync error
    await logSitranOperation({
      tipo_operacion: 'sincronizacion',
      endpoint_sitran: '/api/sync',
      datos_enviados: JSON.stringify(options),
      estado: 'error',
      mensaje_error: error.message,
      id_usuario: userId
    });
    
    throw new Error(`Error en la sincronización con SITRAN: ${error.message}`);
  }
};

// Sync passports with SITRAN
const syncPassportsWithSitran = async (userId) => {
  try {
    console.log('Syncing passports with SITRAN');
    
    // Get passports to sync (not synced or updated since last sync)
    const passportsQuery = `
      SELECT 
        p.id,
        p.numero_pasaporte,
        p.fecha_emision,
        p.autoridad_emisora,
        p.fecha_validez,
        p.estado,
        c.ueln,
        c.microchip,
        c.nombre as nombre_caballo
      FROM pasaportes p
      JOIN caballos c ON p.id_caballo = c.id
      WHERE p.id NOT IN (
        SELECT id_documento_relacionado 
        FROM logs_sitran 
        WHERE tipo_documento_relacionado = 'pasaporte' 
        AND estado = 'exitoso'
        AND tipo_operacion = 'envio'
      )
      OR p.fecha_registro > (
        SELECT MAX(fecha_operacion) 
        FROM logs_sitran 
        WHERE tipo_documento_relacionado = 'pasaporte' 
        AND id_documento_relacionado = p.id
        AND estado = 'exitoso'
        AND tipo_operacion = 'envio'
      )
      LIMIT 100
    `;
    
    const passportsResult = await db.query(passportsQuery);
    const passports = passportsResult.rows;
    
    console.log(`Found ${passports.length} passports to sync`);
    
    // Process each passport
    for (const passport of passports) {
      try {
        // Prepare data for SITRAN
        const passportData = {
          numeroIdentificacion: passport.numero_pasaporte,
          fechaEmision: passport.fecha_emision,
          autoridadEmisora: passport.autoridad_emisora,
          fechaValidez: passport.fecha_validez,
          estado: passport.estado,
          ueln: passport.ueln,
          microchip: passport.microchip,
          nombreCaballo: passport.nombre_caballo
        };
        
        // Send to SITRAN
        const response = await sitranClient.post('/api/pasaportes', passportData);
        
        // Log successful sync
        await logSitranOperation({
          tipo_operacion: 'envio',
          endpoint_sitran: '/api/pasaportes',
          datos_enviados: JSON.stringify(passportData),
          respuesta_recibida: JSON.stringify(response.data),
          estado: 'exitoso',
          id_documento_relacionado: passport.id,
          tipo_documento_relacionado: 'pasaporte',
          id_usuario: userId
        });
      } catch (error) {
        console.error(`Error syncing passport ${passport.id}:`, error);
        
        // Log error
        await logSitranOperation({
          tipo_operacion: 'envio',
          endpoint_sitran: '/api/pasaportes',
          datos_enviados: JSON.stringify({
            numeroIdentificacion: passport.numero_pasaporte,
            ueln: passport.ueln,
            microchip: passport.microchip
          }),
          estado: 'error',
          mensaje_error: error.message,
          id_documento_relacionado: passport.id,
          tipo_documento_relacionado: 'pasaporte',
          id_usuario: userId
        });
      }
    }
    
    console.log('Passport sync completed');
  } catch (error) {
    console.error('Error in passport sync process:', error);
    throw error;
  }
};

// Sync movement guides with SITRAN
const syncMovementGuidesWithSitran = async (userId) => {
  // Similar implementation to syncPassportsWithSitran
  console.log('Syncing movement guides with SITRAN');
  // Implementation details omitted for brevity
  return Promise.resolve();
};

// Sync health certificates with SITRAN
const syncHealthCertificatesWithSitran = async (userId) => {
  // Similar implementation to syncPassportsWithSitran
  console.log('Syncing health certificates with SITRAN');
  // Implementation details omitted for brevity
  return Promise.resolve();
};

// Sync EU transport documents with SITRAN
const syncTransportDocsWithSitran = async (userId) => {
  // Similar implementation to syncPassportsWithSitran
  console.log('Syncing EU transport documents with SITRAN');
  // Implementation details omitted for brevity
  return Promise.resolve();
};

// Sync farms with SITRAN
const syncFarmsWithSitran = async (userId) => {
  // Similar implementation to syncPassportsWithSitran
  console.log('Syncing farms with SITRAN');
  // Implementation details omitted for brevity
  return Promise.resolve();
};

// Validate document with SITRAN
exports.validateDocument = async (documentType, data) => {
  try {
    let endpoint;
    
    switch (documentType) {
      case 'pasaporte':
        endpoint = '/api/validate/pasaporte';
        break;
      case 'guia_movimiento':
        endpoint = '/api/validate/guia';
        break;
      case 'certificado_salud':
        endpoint = '/api/validate/certificado';
        break;
      case 'documento_transporte_ue':
        endpoint = '/api/validate/transporte';
        break;
      default:
        throw new Error(`Tipo de documento no soportado: ${documentType}`);
    }
    
    const response = await sitranClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error validating document with SITRAN:`, error);
    throw new Error(`Error en la validación con SITRAN: ${error.message}`);
  }
};

// Log SITRAN operation
const logSitranOperation = async (logData) => {
  try {
    const {
      tipo_operacion,
      endpoint_sitran,
      datos_enviados,
      respuesta_recibida,
      estado,
      mensaje_error,
      id_documento_relacionado,
      tipo_documento_relacionado,
      id_usuario
    } = logData;
    
    const query = `
      INSERT INTO logs_sitran (
        tipo_operacion,
        fecha_operacion,
        endpoint_sitran,
        datos_enviados,
        respuesta_recibida,
        estado,
        mensaje_error,
        id_documento_relacionado,
        tipo_documento_relacionado,
        id_usuario
      )
      VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const values = [
      tipo_operacion,
      endpoint_sitran,
      datos_enviados,
      respuesta_recibida || null,
      estado,
      mensaje_error || null,
      id_documento_relacionado || null,
      tipo_documento_relacionado || null,
      id_usuario
    ];
    
    await db.query(query, values);
  } catch (error) {
    console.error('Error logging SITRAN operation:', error);
  }
};
```

## 5. Esqueleto de Código para la Integración con SITRAN y el Módulo OCR

### Integración con SITRAN

La integración con SITRAN (Sistema de Trazabilidad Animal) se realiza a través de un servicio dedicado que maneja la comunicación con la API externa. El código principal ya se ha mostrado en la sección anterior con `sitranService.js`.

#### Configuración de SITRAN (config/sitran.js)
```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  SITRAN_API_URL: process.env.SITRAN_API_URL || 'https://api.sitran.es/v1',
  SITRAN_API_KEY: process.env.SITRAN_API_KEY,
  SITRAN_SYNC_INTERVAL: process.env.SITRAN_SYNC_INTERVAL || 86400000, // 24 hours in milliseconds
  SITRAN_MAX_RETRIES: process.env.SITRAN_MAX_RETRIES || 3,
  SITRAN_TIMEOUT: process.env.SITRAN_TIMEOUT || 30000, // 30 seconds
};
```

#### Middleware de Validación SITRAN (middleware/sitranValidation.js)
```javascript
const sitranService = require('../services/sitranService');

// Middleware to validate document with SITRAN before saving
exports.validateWithSitran = async (req, res, next) => {
  try {
    const { tipo_documento, datos, skip_validation } = req.body;
    
    // Skip validation if requested (for drafts, etc.)
    if (skip_validation) {
      return next();
    }
    
    // Validate with SITRAN
    try {
      const validationResult = await sitranService.validateDocument(tipo_documento, datos);
      
      // Add validation result to request
      req.sitranValidation = validationResult;
      
      // Continue if validation passed
      if (validationResult.valid) {
        return next();
      }
      
      // Return validation errors
      return res.status(400).json({
        success: false,
        message: 'El documento no ha pasado la validación de SITRAN',
        errors: validationResult.errors
      });
    } catch (error) {
      // Allow to continue if SITRAN is unavailable (with warning)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn('SITRAN validation service unavailable, continuing without validation');
        req.sitranValidation = {
          valid: true,
          warning: 'SITRAN validation service unavailable'
        };
        return next();
      }
      
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
```

### Módulo OCR

El módulo OCR utiliza Tesseract.js para el reconocimiento óptico de caracteres en documentos escaneados. El código principal ya se ha mostrado en la sección anterior con `ocrService.js`.

#### Configuración de OCR (config/ocr.js)
```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  OCR_UPLOAD_PATH: process.env.OCR_UPLOAD_PATH || 'uploads/ocr',
  OCR_MAX_FILE_SIZE: process.env.OCR_MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  OCR_ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf'],
  OCR_TESSERACT_LANG: process.env.OCR_TESSERACT_LANG || 'spa',
  OCR_CONFIDENCE_THRESHOLD: process.env.OCR_CONFIDENCE_THRESHOLD || 70,
};
```

#### Middleware de Procesamiento OCR (middleware/ocrUpload.js)
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { OCR_UPLOAD_PATH, OCR_MAX_FILE_SIZE, OCR_ALLOWED_FORMATS } = require('../config/ocr');

// Ensure upload directory exists
if (!fs.existsSync(OCR_UPLOAD_PATH)) {
  fs.mkdirSync(OCR_UPLOAD_PATH, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, OCR_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (OCR_ALLOWED_FORMATS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato de archivo no soportado. Formatos permitidos: ${OCR_ALLOWED_FORMATS.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: OCR_MAX_FILE_SIZE
  },
  fileFilter
});

// Middleware for handling OCR document uploads
exports.uploadOcrDocument = upload.single('document');

// Error handler for multer
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `El archivo es demasiado grande. Tamaño máximo: ${OCR_MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir el archivo: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};
```

## 6. Prompt Detallado para bolt.new

```
# Aplicación de Gestión de Documentación Equina (AGDE)

## Descripción del Proyecto

Crea una aplicación web completa para la gestión de documentación obligatoria para caballos en España. La aplicación debe permitir a propietarios, veterinarios, transportistas y autoridades gestionar eficientemente los cinco bloques principales de documentación equina:

1. Tarjeta de Identificación Equina (TIE/Pasaporte Equino)
2. Guía de Movimiento Pecuario (GMP)
3. Certificado de Salud Veterinaria
4. Documento de Acompañamiento al Transporte UE
5. Libro de Registro de Explotaciones Ganaderas

## Requisitos Técnicos

- **Frontend**: React con componentes funcionales y hooks
- **Backend**: Node.js con Express
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT con roles de usuario (propietario, veterinario, transportista, autoridad)
- **Almacenamiento**: Archivos en sistema local con referencias en base de datos
- **Despliegue**: Docker para facilitar la instalación

## Funcionalidades Principales

### 1. Gestión de Usuarios y Autenticación
- Registro y login de usuarios con diferentes roles
- Perfiles específicos según el rol (propietarios, veterinarios, transportistas, autoridades)
- Gestión de permisos basada en roles

### 2. Gestión de Caballos
- CRUD completo de caballos
- Ficha detallada con toda la información del animal
- Historial de documentos asociados
- Búsqueda y filtrado avanzado

### 3. Gestión de Explotaciones Ganaderas
- CRUD completo de explotaciones
- Registro de caballos por explotación
- Libro de registro digital

### 4. Gestión Documental
- Creación, visualización, edición y eliminación de los 5 tipos de documentos
- Formularios digitales específicos para cada tipo de documento
- Validación de datos según normativa vigente
- Generación de PDFs oficiales
- Historial y trazabilidad de documentos

### 5. Módulo OCR
- Escaneo de documentos físicos existentes
- Reconocimiento óptico de caracteres para extraer información
- Validación y corrección manual de datos extraídos
- Conversión de documentos físicos a digitales

### 6. Integración con SITRAN
- Sincronización bidireccional con el Sistema de Trazabilidad Animal
- Validación de documentos contra la base de datos oficial
- Notificaciones automáticas de cambios en SITRAN
- Registro de todas las operaciones con SITRAN

### 7. Panel de Control y Alertas
- Dashboard personalizado según el rol del usuario
- Alertas sobre documentos próximos a caducar
- Estadísticas y reportes
- Notificaciones de eventos importantes

## Detalles de Implementación

### Base de Datos
Implementa un esquema PostgreSQL con las siguientes tablas principales:
- usuarios
- caballos
- explotaciones
- pasaportes
- guias_movimiento
- certificados_salud
- documentos_transporte_ue
- libros_registro
- entradas_libro_registro
- documentos_escaneados
- logs_sitran
- notificaciones

### Frontend
Desarrolla una interfaz de usuario moderna y responsiva con:
- Diseño limpio y profesional
- Formularios intuitivos con validación
- Visualización clara de documentos
- Navegación sencilla entre secciones
- Compatibilidad móvil para uso en campo

### Backend
Implementa una API RESTful con:
- Endpoints para todas las operaciones CRUD
- Middleware de autenticación y autorización
- Validación de datos
- Manejo de errores consistente
- Documentación de la API

### Módulo OCR
Utiliza Tesseract.js para:
- Procesamiento de imágenes escaneadas
- Extracción de texto de documentos
- Identificación de campos clave
- Mapeo a la estructura de datos de la aplicación

### Integración SITRAN
Desarrolla un servicio de integración que:
- Se comunique con la API de SITRAN
- Sincronice datos periódicamente
- Valide documentos antes de su emisión
- Registre todas las operaciones

### Generación de PDFs
Implementa un servicio que:
- Genere documentos oficiales en formato PDF
- Utilice plantillas conformes a la normativa
- Incluya códigos QR para verificación
- Permita la impresión de documentos

## Consideraciones Adicionales

- **Seguridad**: Implementa medidas robustas para proteger datos sensibles
- **Rendimiento**: Optimiza consultas y carga de datos para grandes volúmenes
- **Escalabilidad**: Diseña la arquitectura para permitir crecimiento futuro
- **Usabilidad**: Prioriza la experiencia de usuario para diferentes perfiles
- **Mantenibilidad**: Estructura el código de forma clara y bien documentada
- **Cumplimiento normativo**: Asegura que la aplicación cumple con la legislación vigente

## Entregables

1. Código fuente completo (frontend y backend)
2. Esquema de base de datos y scripts de inicialización
3. Documentación técnica y de usuario
4. Configuración de Docker para despliegue
5. Manual de instalación y configuración
```
    