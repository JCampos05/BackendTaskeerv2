const { Columna, Tablero, Lista } = require('../models/index.models');

class ColumnaService {
    async crear(datos, idUsuario) {
        const { nombre, orden, color, idTablero } = datos;

        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para agregar columnas a este tablero');
        }

        let ordenFinal = orden;
        if (!ordenFinal && ordenFinal !== 0) {
            const ultimaColumna = await Columna.findOne({
                where: { idTablero },
                order: [['orden', 'DESC']]
            });
            ordenFinal = ultimaColumna ? ultimaColumna.orden + 1 : 0;
        }

        const nuevaColumna = await Columna.create({
            nombre,
            orden: ordenFinal,
            color,
            idTablero
        });

        return nuevaColumna;
    }

    async obtenerPorId(idColumna, idUsuario) {
        const columna = await Columna.findOne({
            where: { idColumna },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idTablero', 'nombre', 'idUsuario']
                }
            ]
        });

        if (!columna) {
            throw new Error('Columna no encontrada');
        }

        if (columna.tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver esta columna');
        }

        return columna;
    }

    async obtenerPorTablero(idTablero, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para ver las columnas de este tablero');
        }

        const columnas = await Columna.findAll({
            where: { idTablero },
            include: [
                {
                    model: Lista,
                    as: 'listas',
                    attributes: ['idLista', 'nombre', 'color', 'icono']
                }
            ],
            order: [['orden', 'ASC']]
        });

        return columnas;
    }

    async actualizar(idColumna, datos, idUsuario) {
        const columna = await Columna.findOne({
            where: { idColumna },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idUsuario']
                }
            ]
        });

        if (!columna) {
            throw new Error('Columna no encontrada');
        }

        if (columna.tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para actualizar esta columna');
        }

        await columna.update(datos);
        return columna;
    }

    async eliminar(idColumna, idUsuario) {
        const columna = await Columna.findOne({
            where: { idColumna },
            include: [
                {
                    model: Tablero,
                    as: 'tablero',
                    attributes: ['idUsuario']
                }
            ]
        });

        if (!columna) {
            throw new Error('Columna no encontrada');
        }

        if (columna.tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para eliminar esta columna');
        }

        await columna.destroy();
        return { mensaje: 'Columna eliminada correctamente' };
    }

    async reordenar(idTablero, ordenColumnas, idUsuario) {
        const tablero = await Tablero.findByPk(idTablero);
        if (!tablero) {
            throw new Error('Tablero no encontrado');
        }

        if (tablero.idUsuario !== idUsuario) {
            throw new Error('No tienes permiso para reordenar columnas en este tablero');
        }

        const promesas = ordenColumnas.map(({ idColumna, orden }) => {
            return Columna.update({ orden }, { where: { idColumna, idTablero } });
        });

        await Promise.all(promesas);

        return { mensaje: 'Columnas reordenadas correctamente' };
    }
}

module.exports = new ColumnaService();