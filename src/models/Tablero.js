const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tablero = sequelize.define('Tablero', {
        idTablero: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: true,
            defaultValue: null
        },
        icono: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        },
        compartible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        claveCompartir: {
            type: DataTypes.STRING(12),
            allowNull: true,
            defaultValue: null,
            unique: true
        },
        fechaCreacion: {
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
        tableName: 'tablero',
        timestamps: false,
        indexes: [
            {
                name: 'uk_tablero_clave',
                unique: true,
                fields: ['claveCompartir']
            },
            {
                name: 'idx_tablero_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_tablero_clave',
                fields: ['claveCompartir']
            }
        ]
    });

    return Tablero;
};