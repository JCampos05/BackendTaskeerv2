-- ============================================
-- TASKEER - Esquema Principal Actualizado
-- Base de datos sin lógica de negocio (se maneja en Express)
-- CAMBIOS: Eliminada tabla columna, orden movido a tabla lista
-- ============================================

CREATE DATABASE taskeer2;
USE taskeer2;

-- ============================================
-- TABLA: zonasHorarias
-- Catálogo de zonas horarias
-- ============================================
CREATE TABLE zonasHorarias (
    idZonaHoraria TINYINT UNSIGNED PRIMARY KEY,
    nombreZona VARCHAR(50) NOT NULL UNIQUE COMMENT 'Ej: America/Mexico_City',
    offsetUTC DECIMAL(3,1) NOT NULL COMMENT 'Offset en horas desde UTC',
    nombreMostrar VARCHAR(100) NOT NULL COMMENT 'Nombre para mostrar en UI',
    fechaCreado DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombreZona (nombreZona)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: paises
-- Catálogo de países con código ISO estándar
-- ============================================
CREATE TABLE paises (
    idPais SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigoPais CHAR(2) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-2 (MX, US, ES, etc.)',
    nombrePais VARCHAR(100) NOT NULL,
    banderaUrl VARCHAR(255) COMMENT 'URL de la bandera o código emoji',
    fechaCreado DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigoPais (codigoPais)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: usuario
-- ============================================
CREATE TABLE usuario (
    idUsuario INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NULL,
    email VARCHAR(100) NOT NULL,
    bio TEXT NULL,
    telefono VARCHAR(20) NULL,
    ubicacion VARCHAR(100) NULL,
    idZonaHoraria TINYINT UNSIGNED NULL,
    idPais SMALLINT UNSIGNED NULL,
    cargo VARCHAR(100) NULL,
    redes_sociales JSON NULL,
    password VARCHAR(255) NOT NULL,
    fechaRegistro TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (idUsuario),
    UNIQUE KEY uk_usuario_email (email),
    KEY idx_usuario_email (email),
    KEY idx_usuario_ubicacion (ubicacion),
    KEY idx_usuario_zona_horaria (idZonaHoraria),
    KEY idx_usuario_pais (idPais),
    
    CONSTRAINT fk_usuario_zona_horaria 
        FOREIGN KEY (idZonaHoraria) 
        REFERENCES zonasHorarias (idZonaHoraria) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_usuario_pais 
        FOREIGN KEY (idPais) 
        REFERENCES paises (idPais) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB;
-- ============================================
-- TABLA: tablero
-- ============================================
CREATE TABLE tablero (
    idTablero INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    color VARCHAR(7) DEFAULT NULL,
    icono VARCHAR(100) DEFAULT NULL,
    idUsuario INT NOT NULL,
    compartible BOOLEAN NOT NULL DEFAULT FALSE,
    claveCompartir VARCHAR(12) DEFAULT NULL,
    fechaCreacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (idTablero),
    UNIQUE KEY uk_tablero_clave (claveCompartir),
    KEY idx_tablero_usuario (idUsuario),
    KEY idx_tablero_clave (claveCompartir),
    
    CONSTRAINT fk_tablero_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: tablero_compartido
-- ============================================
CREATE TABLE tablero_compartido (
    idTableroCompartido INT NOT NULL AUTO_INCREMENT,
    idTablero INT NOT NULL,
    idUsuario INT NOT NULL,
    rol ENUM('admin','editor','colaborador','visor') NOT NULL DEFAULT 'visor',
    esCreador BOOLEAN DEFAULT FALSE,
    fechaCompartido TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    compartidoPor INT NOT NULL,
    aceptado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    
    PRIMARY KEY (idTableroCompartido),
    UNIQUE KEY uk_tablero_usuario (idTablero, idUsuario),
    KEY idx_tablero_compartido_tablero (idTablero),
    KEY idx_tablero_compartido_usuario (idUsuario),
    KEY idx_tablero_compartido_por (compartidoPor),
    KEY idx_tablero_compartido_activo (activo, idTablero),
    KEY idx_tablero_usuario_activo (idUsuario, activo, aceptado),
    
    CONSTRAINT fk_tablero_compartido_tablero 
        FOREIGN KEY (idTablero) 
        REFERENCES tablero (idTablero) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tablero_compartido_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tablero_compartido_compartido_por 
        FOREIGN KEY (compartidoPor) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: lista
-- CAMBIO: Agregado campo 'orden' para ordenamiento en tablero
-- CAMBIO: Eliminada relación con columna (idColumna)
-- ============================================
CREATE TABLE lista (
    idLista INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT NULL,
    icono VARCHAR(100) DEFAULT NULL,
    importante BOOLEAN DEFAULT FALSE,
    orden INT NOT NULL DEFAULT 0,
    idTablero INT DEFAULT NULL,
    fechaCreacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    idUsuario INT NOT NULL,
    compartible BOOLEAN DEFAULT FALSE,
    claveCompartir VARCHAR(12) DEFAULT NULL,
    fechaActualizacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (idLista),
    UNIQUE KEY uk_lista_clave (claveCompartir),
    KEY idx_lista_tablero (idTablero),
    KEY idx_lista_usuario (idUsuario),
    KEY idx_lista_clave (claveCompartir),
    KEY idx_lista_orden (idTablero, orden),
    
    CONSTRAINT fk_lista_tablero 
        FOREIGN KEY (idTablero) 
        REFERENCES tablero (idTablero) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT fk_lista_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: lista_compartida
-- ============================================
CREATE TABLE lista_compartida (
    idListaCompartida INT NOT NULL AUTO_INCREMENT,
    idLista INT NOT NULL,
    idUsuario INT NOT NULL,
    rol ENUM('admin','editor','colaborador','visor') NOT NULL DEFAULT 'visor',
    esCreador BOOLEAN DEFAULT FALSE,
    fechaCompartido TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    compartidoPor INT NOT NULL,
    aceptado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    
    PRIMARY KEY (idListaCompartida),
    UNIQUE KEY uk_lista_usuario (idLista, idUsuario),
    KEY idx_lista_compartida_lista (idLista),
    KEY idx_lista_compartida_usuario (idUsuario),
    KEY idx_lista_compartida_por (compartidoPor),
    KEY idx_lista_compartida_activo (activo, idLista),
    KEY idx_lista_usuario_activo (idUsuario, activo, aceptado),
    
    CONSTRAINT fk_lista_compartida_lista 
        FOREIGN KEY (idLista) 
        REFERENCES lista (idLista) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_lista_compartida_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_lista_compartida_compartido_por 
        FOREIGN KEY (compartidoPor) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: tarea
-- ============================================
CREATE TABLE tarea (
    idTarea INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    prioridad ENUM('A','N','B') DEFAULT 'N' COMMENT 'A=Alta, N=Normal, B=Baja',
    estado ENUM('C','P','N') DEFAULT 'N' COMMENT 'C=Completada, P=En Progreso, N=No Iniciada',
    fechaCreacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fechaVencimiento DATE DEFAULT NULL,
    miDia BOOLEAN DEFAULT FALSE,
    pasos JSON DEFAULT NULL,
    notas TEXT,
    recordatorio JSON DEFAULT NULL,
    repetir BOOLEAN DEFAULT FALSE,
    ultimaRepeticion DATETIME NULL,
    tipoRepeticion ENUM('diario','laborales','semanal','mensual','personalizado') DEFAULT NULL,
    configRepeticion JSON DEFAULT NULL,
    idLista INT NOT NULL,
    idUsuario INT NOT NULL,
    idUsuarioAsignado INT DEFAULT NULL,
    
    PRIMARY KEY (idTarea),
    KEY idx_tarea_lista (idLista),
    KEY idx_tarea_usuario (idUsuario),
    KEY idx_tarea_usuario_asignado (idUsuarioAsignado),
    KEY idx_tarea_fecha_vencimiento (fechaVencimiento),
    KEY idx_tarea_estado (estado),
    KEY idx_tarea_prioridad (prioridad),
    
    CONSTRAINT fk_tarea_lista 
        FOREIGN KEY (idLista) 
        REFERENCES lista (idLista) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tarea_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tarea_usuario_asignado 
        FOREIGN KEY (idUsuarioAsignado) 
        REFERENCES usuario (idUsuario) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: tarea_mi_dia
-- ============================================
CREATE TABLE tarea_mi_dia (
    idTareaMiDia INT NOT NULL AUTO_INCREMENT,
    idTarea INT NOT NULL,
    idUsuario INT NOT NULL,
    fechaAgregado TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    completado BOOLEAN DEFAULT FALSE,
    fechaCompletado DATETIME NULL,
    
    PRIMARY KEY (idTareaMiDia),
    KEY idx_tarea_mi_dia_tarea (idTarea),
    KEY idx_tarea_mi_dia_usuario (idUsuario),
    KEY idx_tarea_mi_dia_fecha (idUsuario, fechaAgregado, completado),
    
    CONSTRAINT fk_tarea_mi_dia_tarea 
        FOREIGN KEY (idTarea) 
        REFERENCES tarea (idTarea) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_tarea_mi_dia_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: invitacion
-- ============================================
CREATE TABLE invitacion (
    idInvitacion INT NOT NULL AUTO_INCREMENT,
    emailDestino VARCHAR(100) NOT NULL,
    idUsuarioOrigen INT NOT NULL,
    tipo ENUM('tablero','lista') NOT NULL,
    idRecurso INT NOT NULL COMMENT 'ID del tablero o lista',
    rol ENUM('admin','editor','colaborador','visor') NOT NULL DEFAULT 'colaborador',
    token VARCHAR(64) NOT NULL,
    fechaCreacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fechaExpiracion DATETIME NOT NULL,
    fechaAceptado DATETIME NULL,
    estado ENUM('pendiente','aceptado','rechazado','expirado','cancelado') NOT NULL DEFAULT 'pendiente',
    mensaje TEXT NULL,
    
    PRIMARY KEY (idInvitacion),
    UNIQUE KEY uk_invitacion_token (token),
    KEY idx_invitacion_email (emailDestino),
    KEY idx_invitacion_usuario_origen (idUsuarioOrigen),
    KEY idx_invitacion_estado (estado),
    KEY idx_invitacion_tipo_recurso (tipo, idRecurso),
    KEY idx_invitacion_expiracion (fechaExpiracion, estado),
    
    CONSTRAINT fk_invitacion_usuario_origen 
        FOREIGN KEY (idUsuarioOrigen) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: notificaciones
-- ============================================
CREATE TABLE notificaciones (
    idNotificacion INT NOT NULL AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    tipo ENUM(
        'invitacion_tablero',
        'invitacion_lista',
        'tarea_asignada',
        'tarea_completada',
        'comentario',
        'tarea_repetir',
        'recordatorio',
        'mensaje_chat',
        'mencion',
        'cambio_estado',
        'otro'
    ) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NULL,
    leido BOOLEAN DEFAULT FALSE,
    archivado BOOLEAN DEFAULT FALSE,
    fechaCreacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    fechaLeido DATETIME NULL,
    datosAdicionales JSON NULL COMMENT 'Datos específicos según tipo de notificación',
    idRecurso INT NULL COMMENT 'ID del recurso relacionado (tarea, lista, tablero)',
    tipoRecurso ENUM('tarea','lista','tablero','mensaje') NULL,
    idMensaje INT DEFAULT NULL,
    
    PRIMARY KEY (idNotificacion),
    KEY idx_notificacion_usuario (idUsuario),
    KEY idx_notificacion_leido (idUsuario, leido, fechaCreacion),
    KEY idx_notificacion_tipo (tipo),
    KEY idx_notificacion_recurso (tipoRecurso, idRecurso),
    KEY idx_notificacion_mensaje (idMensaje),
    
    CONSTRAINT fk_notificacion_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;


