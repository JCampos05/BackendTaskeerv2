const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TareaMiDia = sequelize.define('TareaMiDia', {
        idTareaMiDia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        idTarea: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tarea',
                key: 'idTarea'
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
        fechaAgregado: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        completado: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        fechaCompletado: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'tarea_mi_dia',
        timestamps: false,
        indexes: [
            {
                name: 'idx_tarea_mi_dia_tarea',
                fields: ['idTarea']
            },
            {
                name: 'idx_tarea_mi_dia_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_tarea_mi_dia_fecha',
                fields: ['idUsuario', 'fechaAgregado', 'completado']
            }
        ]
    });

    return TareaMiDia;
};