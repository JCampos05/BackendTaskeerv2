const { Pais } = require('../models/index.models');

class PaisService {
    async obtenerTodos() {
        const paises = await Pais.findAll({
            order: [['nombrePais', 'ASC']]
        });
        return paises;
    }

    async obtenerPorId(idPais) {
        const pais = await Pais.findByPk(idPais);
        if (!pais) {
            throw new Error('País no encontrado');
        }
        return pais;
    }

    async obtenerPorCodigo(codigoPais) {
        const pais = await Pais.findOne({
            where: { codigoPais: codigoPais.toUpperCase() }
        });
        if (!pais) {
            throw new Error('País no encontrado');
        }
        return pais;
    }
}

module.exports = new PaisService();