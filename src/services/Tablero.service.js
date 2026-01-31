const { Tablero, Columna, Lista, Usuario } = require('../models/index.models');
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
                    model: Columna,
                    as: 'columnas',
                    attributes: ['idColumna', 'nombre', 'color', 'orden'],
                    order: [['orden', 'ASC']]
                }
            ]
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
                    model: Columna,
                    as: 'columnas',
                    attributes: ['idColumna', 'nombre']
                },
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre']
                }
            ],
            order: [['fechaCreacion', 'DESC']]
        });

        return tableros;
    }

    async obtenerCompleto(idTablero, idUsuario) {
        const tablero = await Tablero.findOne({
            where: { idTablero },
            include: [
                {
                    model: Columna,
                    as: 'columnas',
                    include: [
                        {
                            model: Lista,
                            as: 'listas',
                            attributes: ['idLista', 'nombre', 'color', 'icono']
                        }
                    ],
                    order: [['orden', 'ASC']]
                },
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['idUsuario', 'nombre', 'apellido']
                }
            ]
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