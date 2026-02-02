const { ZonaHoraria } = require('../models/index.models');

class ZonaHorariaService {
    async obtenerTodas() {
        const zonas = await ZonaHoraria.findAll({
            order: [['offsetUTC', 'ASC']]
        });
        return zonas;
    }

    async obtenerPorId(idZonaHoraria) {
        const zona = await ZonaHoraria.findByPk(idZonaHoraria);
        if (!zona) {
            throw new Error('Zona horaria no encontrada');
        }
        return zona;
    }
}

module.exports = new ZonaHorariaService();