const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ListaCompartida = sequelize.define('ListaCompartida', {
        idListaCompartida: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        idLista: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'lista',
                key: 'idLista'
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
        tableName: 'lista_compartida',
        timestamps: false,
        indexes: [
            {
                name: 'uk_lista_usuario',
                unique: true,
                fields: ['idLista', 'idUsuario']
            },
            {
                name: 'idx_lista_compartida_lista',
                fields: ['idLista']
            },
            {
                name: 'idx_lista_compartida_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_lista_compartida_por',
                fields: ['compartidoPor']
            },
            {
                name: 'idx_lista_compartida_activo',
                fields: ['activo', 'idLista']
            },
            {
                name: 'idx_lista_usuario_activo',
                fields: ['idUsuario', 'activo', 'aceptado']
            }
        ]
    });

    return ListaCompartida;
};