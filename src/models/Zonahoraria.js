const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ZonaHoraria = sequelize.define('ZonaHoraria', {
        idZonaHoraria: {
            type: DataTypes.TINYINT.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        nombreZona: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Ej: America/Mexico_City'
        },
        offsetUTC: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false,
            comment: 'Offset en horas desde UTC'
        },
        nombreMostrar: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Nombre para mostrar en UI'
        },
        fechaCreado: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        fechaActualizado: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'zonasHorarias',
        timestamps: false,
        indexes: [
            {
                name: 'idx_nombreZona',
                fields: ['nombreZona']
            }
        ]
    });

    return ZonaHoraria;
};