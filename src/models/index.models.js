const { sequelize } = require('../config/database');

const ZonaHoraria = require('./Zonahoraria')(sequelize);
const Usuario = require('./Usuario')(sequelize);
const Tablero = require('./Tablero')(sequelize);
const TableroCompartido = require('./compartir/Tablerocompartido')(sequelize);
const Lista = require('./Lista')(sequelize);
const ListaCompartida = require('./compartir/Listacompartida')(sequelize);
const Tarea = require('./Tarea')(sequelize);
const TareaMiDia = require('./Tareamidia')(sequelize);
const Invitacion = require('./compartir/Invitacion')(sequelize);
const Notificacion = require('./compartir/Notificacion')(sequelize);

// RELACIONES: ZonaHoraria - Usuario
ZonaHoraria.hasMany(Usuario, {
    foreignKey: 'idZonaHoraria',
    as: 'usuarios'
});
Usuario.belongsTo(ZonaHoraria, {
    foreignKey: 'idZonaHoraria',
    as: 'zonaHoraria'
});

// RELACIONES: Usuario - Tablero
Usuario.hasMany(Tablero, {
    foreignKey: 'idUsuario',
    as: 'tableros'
});
Tablero.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'propietario'
});

// RELACIONES: Tablero - TableroCompartido
Tablero.hasMany(TableroCompartido, {
    foreignKey: 'idTablero',
    as: 'compartidos'
});
TableroCompartido.belongsTo(Tablero, {
    foreignKey: 'idTablero',
    as: 'tablero'
});

// RELACIONES: Usuario - TableroCompartido (usuario con quien se comparte)
Usuario.hasMany(TableroCompartido, {
    foreignKey: 'idUsuario',
    as: 'tablerosCompartidosConmigo'
});
TableroCompartido.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'usuario'
});

// RELACIONES: Usuario - TableroCompartido (usuario que comparte)
Usuario.hasMany(TableroCompartido, {
    foreignKey: 'compartidoPor',
    as: 'tablerosQueComparti'
});
TableroCompartido.belongsTo(Usuario, {
    foreignKey: 'compartidoPor',
    as: 'compartidoPorUsuario'
});

// RELACIONES: Usuario - Lista
Usuario.hasMany(Lista, {
    foreignKey: 'idUsuario',
    as: 'listas'
});
Lista.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'propietario'
});

// RELACIONES: Tablero - Lista
Tablero.hasMany(Lista, {
    foreignKey: 'idTablero',
    as: 'listas'
});
Lista.belongsTo(Tablero, {
    foreignKey: 'idTablero',
    as: 'tablero'
});

// RELACIONES: Lista - ListaCompartida
Lista.hasMany(ListaCompartida, {
    foreignKey: 'idLista',
    as: 'compartidas'
});
ListaCompartida.belongsTo(Lista, {
    foreignKey: 'idLista',
    as: 'lista'
});

// RELACIONES: Usuario - ListaCompartida (usuario con quien se comparte)
Usuario.hasMany(ListaCompartida, {
    foreignKey: 'idUsuario',
    as: 'listasCompartidasConmigo'
});
ListaCompartida.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'usuario'
});

// RELACIONES: Usuario - ListaCompartida (usuario que comparte)
Usuario.hasMany(ListaCompartida, {
    foreignKey: 'compartidoPor',
    as: 'listasQueComparti'
});
ListaCompartida.belongsTo(Usuario, {
    foreignKey: 'compartidoPor',
    as: 'compartidoPorUsuario'
});

// RELACIONES: Lista - Tarea
Lista.hasMany(Tarea, {
    foreignKey: 'idLista',
    as: 'tareas'
});
Tarea.belongsTo(Lista, {
    foreignKey: 'idLista',
    as: 'lista'
});

// RELACIONES: Usuario - Tarea (creador)
Usuario.hasMany(Tarea, {
    foreignKey: 'idUsuario',
    as: 'tareasCreadas'
});
Tarea.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'creador'
});

// RELACIONES: Usuario - Tarea (asignado)
Usuario.hasMany(Tarea, {
    foreignKey: 'idUsuarioAsignado',
    as: 'tareasAsignadas'
});
Tarea.belongsTo(Usuario, {
    foreignKey: 'idUsuarioAsignado',
    as: 'usuarioAsignado'
});

// RELACIONES: Tarea - TareaMiDia
Tarea.hasMany(TareaMiDia, {
    foreignKey: 'idTarea',
    as: 'diasAsignados'
});
TareaMiDia.belongsTo(Tarea, {
    foreignKey: 'idTarea',
    as: 'tarea'
});

// RELACIONES: Usuario - TareaMiDia
Usuario.hasMany(TareaMiDia, {
    foreignKey: 'idUsuario',
    as: 'tareasMiDia'
});
TareaMiDia.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'usuario'
});

// RELACIONES: Usuario - Invitacion
Usuario.hasMany(Invitacion, {
    foreignKey: 'idUsuarioOrigen',
    as: 'invitacionesEnviadas'
});
Invitacion.belongsTo(Usuario, {
    foreignKey: 'idUsuarioOrigen',
    as: 'usuarioOrigen'
});

// RELACIONES: Usuario - Notificacion
Usuario.hasMany(Notificacion, {
    foreignKey: 'idUsuario',
    as: 'notificaciones'
});
Notificacion.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
    as: 'usuario'
});

module.exports = {
    sequelize,
    
    ZonaHoraria,
    Usuario,
    Tablero,
    TableroCompartido,
    Lista,
    ListaCompartida,
    Tarea,
    TareaMiDia,
    Invitacion,
    Notificacion
};