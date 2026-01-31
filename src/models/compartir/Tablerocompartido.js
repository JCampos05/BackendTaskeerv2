const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TableroCompartido = sequelize.define('TableroCompartido', {
        idTableroCompartido: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        idTablero: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tablero',
                key: 'idTablero'
            }
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        },
        rol: {
            type: DataTypes.ENUM('admin', 'editor', 'colaborador', 'visor'),
            allowNull: false,
            defaultValue: 'visor'
        },
        esCreador: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        fechaCompartido: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        compartidoPor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        },
        aceptado: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }
    }, {
        tableName: 'tablero_compartido',
        timestamps: false,
        indexes: [
            {
                name: 'uk_tablero_usuario',
                unique: true,
                fields: ['idTablero', 'idUsuario']
            },
            {
                name: 'idx_tablero_compartido_tablero',
                fields: ['idTablero']
            },
            {
                name: 'idx_tablero_compartido_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_tablero_compartido_por',
                fields: ['compartidoPor']
            },
            {
                name: 'idx_tablero_compartido_activo',
                fields: ['activo', 'idTablero']
            },
            {
                name: 'idx_tablero_usuario_activo',
                fields: ['idUsuario', 'activo', 'aceptado']
            }
        ]
    });

    return TableroCompartido;
};