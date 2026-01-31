const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Columna = sequelize.define('Columna', {
        idColumna: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        orden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: true,
            defaultValue: null
        },
        idTablero: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        fechaActualizacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'columna',
        timestamps: false,
        indexes: [
            {
                name: 'idx_columna_tablero',
                fields: ['idTablero']
            },
            {
                name: 'idx_columna_orden',
                fields: ['idTablero', 'orden']
            }
        ]
    });

    return Columna;
};