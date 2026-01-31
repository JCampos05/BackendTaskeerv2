const { Lista, Tablero, Tarea, Usuario } = require('../models/index.models');
const crypto = require('crypto');

class ListaService {
    async crear(datos, idUsuario) {
        const { nombre, color, icono, importante, idTablero, compartible, orden } = datos;

        if (idTablero) {
            const tablero = await Tablero.findByPk(idTablero);
            if (!tablero) {
                throw new Error('Tablero no encontrado');
            }
            if (tablero.idUsuario !== idUsuario) {
                throw new Error('No tienes permiso para agregar listas a este tablero');
            }
        }

        let ordenFinal = orden;
        if (idTablero && (ordenFinal === undefined || ordenFinal === null)) {
            const ultimaLista = await Lista.findOne({
                where: { idTablero },
                order: [['orden', 'DESC']]
            });
            ordenFinal = ultimaLista ? ultimaLista.orden + 1 : 0;
        } else if (!idTablero) {
            ordenFinal = 0;
        }

        let claveCompartir = null;
        if (compartible) {
            claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        const nuevaLista = await Lista.create({
            nombre,
            color,
            icono,
            importante: importante || false,
            orden: ordenFinal,
            idTablero,
            idUsuario,
            compartible: compartible || false,
            claveCompartir
        });

        return nuevaLista;
    }

    async obtenerPorId(idLista, idUsuario) {
        const lista = await Lista.findOne({
            where: { idLista },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'color', 'icono']
                },
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver esta lista');
        }

        return lista;
    }

    async obtenerPorUsuario(idUsuario) {
        const listas = await Lista.findAll({
            where: { idUsuario },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'color', 'icono']
                }
            ],
            order: [['importante', 'DESC'], ['fechaCreacion', 'DESC']]
        });

        return listas;
    }

    async obtenerPorTablero(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver las listas de este tablero');
        }

        const listas = await Lista.findAll({
            where: { idTablero },
            include: [
                {
                    model: Tarea,
                    as: 'tareas',
                    attributes: ['idTarea', 'nombre', 'estado', 'prioridad']
                }
            ],
            order: [['orden', 'ASC']]
        });

        return listas;
    }

    async obtenerConTareas(idLista, idUsuario) {
        const lista = await Lista.findOne({
            where: { idLista },
            include: [
                {
                    model: Tarea,
                    as: 'tareas',
                    include: [
                        {
                            model: Usuario,
                            as: 'usuarioAsignado',
                            attributes: ['idUsuario', 'nombre', 'apellido']
                        }
                    ],
                    order: [['fechaVencimiento', 'ASC']]
                }
            ]
        });

        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver esta lista');
        }

        return lista;
    }

    async actualizar(idLista, datos, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para actualizar esta lista');
        }

        if (datos.compartible && !lista.claveCompartir) {
            datos.claveCompartir = crypto.randomBytes(6).toString('hex');
        }

        if (datos.compartible === false) {
            datos.claveCompartir = null;
        }

        await lista.update(datos);
        return lista;
    }

    async eliminar(idLista, idUsuario) {
        const lista = await Lista.findByPk(idLista);
        if (!lista) {
            throw new Error('Lista no encontrada');
        }

        if (lista.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para eliminar esta lista');
        }

        await lista.destroy();
        return { mensaje: 'Lista eliminada correctamente' };
    }

    async reordenar(idTablero, ordenListas, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para reordenar listas en este tablero');
        }

        const promesas = ordenListas.map(({ idLista, orden }) => {
            return Lista.update({ orden }, { where: { idLista, idTablero } });
        });

        await Promise.all(promesas);

        return { mensaje: 'Listas reordenadas correctamente' };
    }
}

module.exports = new ListaService();