const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Lista = sequelize.define('Lista', {
        idLista: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
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
        importante: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        orden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        idTablero: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: 'tablero',
                key: 'idTablero'
            }
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
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
            allowNull: true,
            defaultValue: false
        },
        claveCompartir: {
            type: DataTypes.STRING(12),
            allowNull: true,
            defaultValue: null,
            unique: true
        },
        fechaActualizacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'lista',
        timestamps: false,
        indexes: [
            {
                name: 'uk_lista_clave',
                unique: true,
                fields: ['claveCompartir']
            },
            {
                name: 'idx_lista_tablero',
                fields: ['idTablero']
            },
            {
                name: 'idx_lista_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_lista_clave',
                fields: ['claveCompartir']
            },
            {
                name: 'idx_lista_orden',
                fields: ['idTablero', 'orden']
            }
        ]
    });

    return Lista;
};