const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notificacion = sequelize.define('Notificacion', {
        idNotificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        },
        tipo: {
            type: DataTypes.ENUM(
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
            ),
            allowNull: false
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        leido: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        archivado: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        fechaLeido: {
            type: DataTypes.DATE,
            allowNull: true
        },
        datosAdicionales: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Datos específicos según tipo de notificación'
        },
        idRecurso: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID del recurso relacionado (tarea, lista, tablero)'
        },
        tipoRecurso: {
            type: DataTypes.ENUM('tarea', 'lista', 'tablero', 'mensaje'),
            allowNull: true
        },
        idMensaje: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'notificaciones',
        timestamps: false,
        indexes: [
            {
                name: 'idx_notificacion_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_notificacion_leido',
                fields: ['idUsuario', 'leido', 'fechaCreacion']
            },
            {
                name: 'idx_notificacion_tipo',
                fields: ['tipo']
            },
            {
                name: 'idx_notificacion_recurso',
                fields: ['tipoRecurso', 'idRecurso']
            },
            {
                name: 'idx_notificacion_mensaje',
                fields: ['idMensaje']
            }
        ]
    });

    return Notificacion;
};