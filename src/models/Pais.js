const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pais = sequelize.define('Pais', {
        idPais: {
            type: DataTypes.SMALLINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        codigoPais: {
            type: DataTypes.CHAR(2),
            allowNull: false,
            unique: true,
            comment: 'ISO 3166-1 alpha-2 (MX, US, ES, etc.)'
        },
        nombrePais: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        banderaUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'URL de la bandera o código emoji'
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
        tableName: 'paises',
        timestamps: false,
        indexes: [
            {
                name: 'idx_codigoPais',
                fields: ['codigoPais']
            }
        ]
    });

    return Pais;
};