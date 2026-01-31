const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        idUsuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        ubicacion: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        idZonaHoraria: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'zonasHorarias',
                key: 'idZonaHoraria'
            }
        },
        cargo: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        redes_sociales: {
            type: DataTypes.JSON,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fechaRegistro: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        fechaActualizacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'usuario',
        timestamps: false,
        indexes: [
            {
                name: 'uk_usuario_email',
                unique: true,
                fields: ['email']
            },
            {
                name: 'idx_usuario_email',
                fields: ['email']
            },
            {
                name: 'idx_usuario_ubicacion',
                fields: ['ubicacion']
            },
            {
                name: 'idx_usuario_zona_horaria',
                fields: ['idZonaHoraria']
            }
        ]
    });

    return Usuario;
};