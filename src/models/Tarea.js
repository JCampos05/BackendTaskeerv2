const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tarea = sequelize.define('Tarea', {
        idTarea: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        prioridad: {
            type: DataTypes.ENUM('A', 'N', 'B'),
            allowNull: true,
            defaultValue: 'N',
            comment: 'A=Alta, N=Normal, B=Baja'
        },
        estado: {
            type: DataTypes.ENUM('C', 'P', 'N'),
            allowNull: true,
            defaultValue: 'N',
            comment: 'C=Completada, P=En Progreso, N=No Iniciada'
        },
        fechaCreacion: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        fechaVencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        pasos: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        recordatorio: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        repetir: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        ultimaRepeticion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tipoRepeticion: {
            type: DataTypes.ENUM('diario', 'laborales', 'semanal', 'mensual', 'personalizado'),
            allowNull: true,
            defaultValue: null
        },
        configRepeticion: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
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
        idUsuarioAsignado: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: 'usuario',
                key: 'idUsuario'
            }
        }
    }, {
        tableName: 'tarea',
        timestamps: false,
        indexes: [
            {
                name: 'idx_tarea_lista',
                fields: ['idLista']
            },
            {
                name: 'idx_tarea_usuario',
                fields: ['idUsuario']
            },
            {
                name: 'idx_tarea_usuario_asignado',
                fields: ['idUsuarioAsignado']
            },
            {
                name: 'idx_tarea_fecha_vencimiento',
                fields: ['fechaVencimiento']
            },
            {
                name: 'idx_tarea_estado',
                fields: ['estado']
            },
            {
                name: 'idx_tarea_prioridad',
                fields: ['prioridad']
            }
        ]
    });

    return Tarea;
};