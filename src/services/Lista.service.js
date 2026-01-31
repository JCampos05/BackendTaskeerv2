const { Lista, Tablero, Columna, Tarea, Usuario } = require('../models/index.models');

class ListaService {
    async crear(datos, idUsuario) {
        const { nombre, color, icono, importante, idTablero, idColumna, compartible } = datos;

        if (idTablero) {
            const tablero = await Tablero.findByPk(idTablero);
            if (!tablero) {
                throw new Error('Tablero no encontrado');
            }
            if (tablero.idUsuario !== idUsuario) {
                throw new Error('No tienes permiso para agregar listas a este tablero');
            }
        }

        if (idColumna) {
            const columna = await Columna.findByPk(idColumna);
            if (!columna) {
                throw new Error('Columna no encontrada');
            }
        }

        const nuevaLista = await Lista.create({
            nombre,
            color,
            icono,
            importante: importante || false,
            idTablero,
            idColumna,
            idUsuario,
            compartible: compartible || false
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
                    model: Columna,
                    as: 'columna',
                    attributes: ['idColumna', 'nombre', 'color']
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
                },
                {
                    model: Columna,
                    as: 'columna',
                    attributes: ['idColumna', 'nombre']
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
                    model: Columna,
                    as: 'columna',
                    attributes: ['idColumna', 'nombre', 'color']
                },
                {
                    model: Tarea,
                    as: 'tareas',
                    attributes: ['idTarea', 'nombre', 'estado', 'prioridad']
                }
            ],
            order: [['fechaCreacion', 'ASC']]
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
}

module.exports = new ListaService();