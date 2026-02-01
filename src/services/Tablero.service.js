const { Tablero, Lista, Usuario, Tarea } = require('../models/index.models');
const crypto = require('crypto');

class TableroService {
    async crear(datos, idUsuario) {
        const { nombre, descripcion, color, icono, compartible } = datos;

        let claveCompartir = null;
        if (compartible) {
            claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        const nuevoTablero = await Tablero.create({
            nombre,
            descripcion,
            color,
            icono,
            idUsuario,
            compartible: compartible || false,
            claveCompartir
        });

        return nuevoTablero;
    }

    async obtenerPorId(idTablero, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { idTablero },
            include: [
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                },
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono', 'orden']
                }
            ],
            order: [[{ model: Lista, as: 'listas' }, 'orden', 'ASC']]
        });

        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver este tablero');
        }

        return tablero;
    }

    async obtenerPorUsuario(idUsuario) {
        const tableros = await Tablero.findAll({
            where: { idUsuario },
            include: [
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono', 'orden', 'importante'],
                    include: [
                        {
                            model: Tarea,
                            as: 'tareas',
                            attributes: ['idTarea', 'estado']
                        }
                    ]
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        const tablerosConEstadisticas = tableros.map(tablero => {
            const tableroJSON = tablero.toJSON();
            
            const cantidadListas = tableroJSON.listas ? tableroJSON.listas.length : 0;
            
            let cantidadTareas = 0;
            let tareasCompletadas = 0;
            
            if (tableroJSON.listas) {
                tableroJSON.listas.forEach(lista => {
                    if (lista.tareas) {
                        cantidadTareas += lista.tareas.length;
                        tareasCompletadas += lista.tareas.filter(tarea => tarea.estado === 'C').length;
                    }
                });
            }
            
            return {
                ...tableroJSON,
                cantidadListas,
                cantidadTareas,
                tareasCompletadas
            };
        });

        return tablerosConEstadisticas;
    }

    async obtenerCompleto(idTablero, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { idTablero },
            include: [
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono', 'orden'],
                    include: [
                        {
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['idUsuario', 'nombre', 'apellido']
                        }
                    ]
                },
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ],
            order: [[{ model: Lista, as: 'listas' }, 'orden', 'ASC']]
        });

        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver este tablero');
        }

        return tablero;
    }

    async actualizar(idTablero, datos, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para actualizar este tablero');
        }

        if (datos.compartible && !tablero.claveCompartir) {
            datos.claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        if (datos.compartible === false) {
            datos.claveCompartir = null;
        }

        await tablero.update(datos);
        return tablero;
    }

    async eliminar(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para eliminar este tablero');
        }

        await tablero.destroy();
        return { mensaje: 'Tablero eliminado correctamente' };
    }

    async generarNuevaClave(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para generar una nueva clave');
        }

        const nuevaClave = crypto.randomBytes(6).toString('hex');
        await tablero.update({ claveCompartir: nuevaClave, compartible: true });

        return { claveCompartir: nuevaClave };
    }
}

module.exports = new TableroService();