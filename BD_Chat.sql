-- ============================================
-- TASKEER - Esquema de Chat
-- Sistema de mensajería (lógica manejada en Express + Socket.io)
-- ============================================

USE taskeer2;

-- ============================================
-- TABLA: mensaje
-- ============================================
CREATE TABLE mensaje (
    idMensaje INT NOT NULL AUTO_INCREMENT,
    contenido TEXT NOT NULL,
    idLista INT NOT NULL,
    idUsuario INT NOT NULL,
    editado BOOLEAN DEFAULT FALSE,
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaEdicion TIMESTAMP NULL,
    eliminado BOOLEAN DEFAULT FALSE,
    fechaEliminacion TIMESTAMP NULL,
    
    PRIMARY KEY (idMensaje),
    KEY idx_mensaje_lista_fecha (idLista, fechaCreacion DESC),
    KEY idx_mensaje_usuario (idUsuario),
    KEY idx_mensaje_lista_activo (idLista, eliminado, fechaCreacion DESC),
    
    CONSTRAINT fk_mensaje_lista 
        FOREIGN KEY (idLista) 
        REFERENCES lista (idLista) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_mensaje_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: mensaje_lectura
-- ============================================
CREATE TABLE mensaje_lectura (
    idMensajeLectura INT NOT NULL AUTO_INCREMENT,
    idMensaje INT NOT NULL,
    idUsuario INT NOT NULL,
    fechaLeido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (idMensajeLectura),
    UNIQUE KEY uk_mensaje_usuario (idMensaje, idUsuario),
    KEY idx_lectura_mensaje (idMensaje),
    KEY idx_lectura_usuario (idUsuario),
    
    CONSTRAINT fk_lectura_mensaje 
        FOREIGN KEY (idMensaje) 
        REFERENCES mensaje (idMensaje) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_lectura_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: usuario_actividad
-- ============================================
CREATE TABLE usuario_actividad (
    idActividad INT NOT NULL AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    idLista INT NOT NULL,
    socketId VARCHAR(100) NOT NULL,
    conectado BOOLEAN DEFAULT TRUE,
    ultimaActividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    escribiendo BOOLEAN DEFAULT FALSE,
    escribiendoDesde TIMESTAMP NULL,
    
    PRIMARY KEY (idActividad),
    UNIQUE KEY uk_usuario_lista_socket (idUsuario, idLista, socketId),
    KEY idx_actividad_usuario (idUsuario),
    KEY idx_actividad_lista (idLista),
    KEY idx_actividad_lista_conectado (idLista, conectado, ultimaActividad),
    KEY idx_actividad_lista_escribiendo (idLista, escribiendo, escribiendoDesde),
    
    CONSTRAINT fk_actividad_usuario 
        FOREIGN KEY (idUsuario) 
        REFERENCES usuario (idUsuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_actividad_lista 
        FOREIGN KEY (idLista) 
        REFERENCES lista (idLista) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Agregar FK en notificaciones para mensajes
-- ============================================
ALTER TABLE notificaciones
    ADD CONSTRAINT fk_notificacion_mensaje 
        FOREIGN KEY (idMensaje) 
        REFERENCES mensaje (idMensaje) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;