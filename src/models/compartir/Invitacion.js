const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Invitacion = sequelize.define('Invitacion', {
        idInvitacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        emailDestino: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        idUsuarioOrigen: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        },
        tipo: {
            type: DataTypes.ENUM('tablero', 'lista'),
            allowNull: false
        },
        idRecurso: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'ID del tablero o lista'
        },
        rol: {
            type: DataTypes.ENUM('admin', 'editor', 'colaborador', 'visor'),
            allowNull: false,
            defaultValue: 'colaborador'
        },
        token: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        fechaExpiracion: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fechaAceptado: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado', 'expirado', 'cancelado'),
            allowNull: false,
            defaultValue: 'pendiente'
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'invitacion',
        timestamps: false,
        indexes: [
            {
                name: 'uk_invitacion_token',
                unique: true,
                fields: ['token']
            },
            {
                name: 'idx_invitacion_email',
                fields: ['emailDestino']
            },
            {
                name: 'idx_invitacion_usuario_origen',
                fields: ['idUsuarioOrigen']
            },
            {
                name: 'idx_invitacion_estado',
                fields: ['estado']
            },
            {
                name: 'idx_invitacion_tipo_recurso',
                fields: ['tipo', 'idRecurso']
            },
            {
                name: 'idx_invitacion_expiracion',
                fields: ['fechaExpiracion', 'estado']
            }
        ]
    });

    return Invitacion;
};