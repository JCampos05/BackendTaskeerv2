const { Tarea, Usuario, Lista } = require('../models/index.models');
const { Op } = require('sequelize');
const notificacionService = require('./Notificacion.service');
const sseService = require('./SSE.service');

class TareasSchedulerService {
    constructor() {
        this.intervaloActivo = null;
        this.ejecutando = false;
        this.ultimaEjecucion = null;
    }

    iniciar() {
        if (this.intervaloActivo) {
            console.log('Scheduler ya está en ejecución');
            return;
        }

        console.log('Iniciando Scheduler de Tareas...');
        
        this.intervaloActivo = setInterval(() => {
            this.ejecutarRevision();
        }, 60000);

        this.ejecutarRevision();

        console.log('Scheduler de Tareas iniciado correctamente');
    }

    detener() {
        if (this.intervaloActivo) {
            clearInterval(this.intervaloActivo);
            this.intervaloActivo = null;
            console.log('Scheduler de Tareas detenido');
        }
    }

    async ejecutarRevision() {
        if (this.ejecutando) {
            console.log('Revisión anterior aún en proceso, omitiendo...');
            return;
        }

        this.ejecutando = true;
        const inicioEjecucion = Date.now();

        try {
            const resultados = await Promise.allSettled([
                this.procesarRecordatorios(),
                this.procesarTareasRepetidas(),
                this.procesarAlertasVencimiento()
            ]);

            const errores = resultados.filter(r => r.status === 'rejected');
            if (errores.length > 0) {
                console.error('Errores durante la revisión:', errores);
            }

            this.ultimaEjecucion = new Date();
            const duracion = Date.now() - inicioEjecucion;
            
            console.log(`Revisión completada en ${duracion}ms`);
        } catch (error) {
            console.error('Error en ejecutarRevision:', error);
        } finally {
            this.ejecutando = false;
        }
    }

    async procesarRecordatorios() {
        try {
            const ahora = new Date();
            
            const tareas = await Tarea.findAll({
                where: {
                    recordatorio: { [Op.ne]: null },
                    estado: { [Op.ne]: 'C' }
                },
                include: [
                    {
                        model: Lista,
                        as: 'lista',
                        attributes: ['nombre', 'color']
                    },
                    {
                        model: Usuario,
                        as: 'usuarioAsignado',
                        attributes: ['idUsuario']
                    }
                ]
            });

            let procesados = 0;

            for (const tarea of tareas) {
                const recordatorio = tarea.recordatorio;
                
                if (!recordatorio || !recordatorio.fecha || !recordatorio.hora) {
                    continue;
                }

                const fechaHoraRecordatorio = new Date(`${recordatorio.fecha}T${recordatorio.hora}`);
                const diferencia = fechaHoraRecordatorio - ahora;

                if (diferencia > 0 && diferencia <= 60000) {
                    const idUsuarioDestino = tarea.idUsuarioAsignado || tarea.idUsuario;

                    const notificacion = await notificacionService.crearNotificacionTarea(
                        'recordatorio',
                        tarea.idTarea,
                        idUsuarioDestino
                    );

                    sseService.enviarNotificacion(idUsuarioDestino, notificacion);
                    sseService.enviarRecordatorio(idUsuarioDestino, {
                        idTarea: tarea.idTarea,
                        nombre: tarea.nombre,
                        descripcion: tarea.descripcion,
                        prioridad: tarea.prioridad,
                        fechaVencimiento: tarea.fechaVencimiento,
                        lista: tarea.lista
                    });

                    procesados++;
                }
            }

            if (procesados > 0) {
                console.log(`Recordatorios procesados: ${procesados}`);
            }

            return procesados;
        } catch (error) {
            console.error('Error procesando recordatorios:', error);
            throw error;
        }
    }

    async procesarTareasRepetidas() {
        try {
            const ahora = new Date();
            
            const tareas = await Tarea.findAll({
                where: {
                    repetir: true,
                    tipoRepeticion: { [Op.ne]: null },
                    estado: 'C'
                },
                include: [
                    {
                        model: Lista,
                        as: 'lista',
                        attributes: ['idLista', 'nombre']
                    }
                ]
            });

            let creadas = 0;

            for (const tarea of tareas) {
                const debeRepetir = this.verificarDebeRepetir(tarea, ahora);

                if (debeRepetir) {
                    const nuevaTarea = await Tarea.create({
                        nombre: tarea.nombre,
                        descripcion: tarea.descripcion,
                        prioridad: tarea.prioridad,
                        estado: 'N',
                        fechaVencimiento: this.calcularNuevaFechaVencimiento(tarea, ahora),
                        miDia: false,
                        pasos: tarea.pasos,
                        notas: tarea.notas,
                        recordatorio: tarea.recordatorio,
                        repetir: tarea.repetir,
                        tipoRepeticion: tarea.tipoRepeticion,
                        configRepeticion: tarea.configRepeticion,
                        idLista: tarea.idLista,
                        idUsuario: tarea.idUsuario,
                        idUsuarioAsignado: tarea.idUsuarioAsignado
                    });

                    await tarea.update({ ultimaRepeticion: ahora });

                    const idUsuarioDestino = tarea.idUsuarioAsignado || tarea.idUsuario;

                    const notificacion = await notificacionService.crearNotificacionTarea(
                        'tarea_repetir',
                        nuevaTarea.idTarea,
                        idUsuarioDestino
                    );

                    sseService.enviarNotificacion(idUsuarioDestino, notificacion);
                    sseService.enviarTareaRepetida(idUsuarioDestino, {
                        idTarea: nuevaTarea.idTarea,
                        nombre: nuevaTarea.nombre,
                        fechaVencimiento: nuevaTarea.fechaVencimiento,
                        lista: tarea.lista
                    });

                    creadas++;
                }
            }

            if (creadas > 0) {
                console.log(`Tareas repetidas creadas: ${creadas}`);
            }

            return creadas;
        } catch (error) {
            console.error('Error procesando tareas repetidas:', error);
            throw error;
        }
    }

    async procesarAlertasVencimiento() {
        try {
            const ahora = new Date();
            const manana = new Date(ahora);
            manana.setDate(manana.getDate() + 1);
            manana.setHours(0, 0, 0, 0);

            const tareas = await Tarea.findAll({
                where: {
                    fechaVencimiento: {
                        [Op.between]: [manana, new Date(manana.getTime() + 24 * 60 * 60 * 1000)]
                    },
                    estado: { [Op.ne]: 'C' }
                },
                include: [
                    {
                        model: Lista,
                        as: 'lista',
                        attributes: ['nombre', 'color']
                    }
                ]
            });

            let enviadas = 0;

            for (const tarea of tareas) {
                const idUsuarioDestino = tarea.idUsuarioAsignado || tarea.idUsuario;

                const yaNotificado = await notificacionService.obtenerPorUsuario(idUsuarioDestino, {
                    tipo: 'recordatorio',
                    limite: 100
                }).then(notifs => {
                    return notifs.some(n => 
                        n.idRecurso === tarea.idTarea && 
                        n.datosAdicionales?.esAlertaVencimiento &&
                        new Date(n.fechaCreacion) > new Date(ahora - 24 * 60 * 60 * 1000)
                    );
                });

                if (!yaNotificado) {
                    const notificacion = await notificacionService.crear({
                        idUsuario: idUsuarioDestino,
                        tipo: 'recordatorio',
                        titulo: `Vence mañana: ${tarea.nombre}`,
                        mensaje: `La tarea "${tarea.nombre}" vence mañana`,
                        datosAdicionales: {
                            nombreTarea: tarea.nombre,
                            nombreLista: tarea.lista.nombre,
                            prioridad: tarea.prioridad,
                            fechaVencimiento: tarea.fechaVencimiento,
                            esAlertaVencimiento: true
                        },
                        idRecurso: tarea.idTarea,
                        tipoRecurso: 'tarea'
                    });

                    sseService.enviarNotificacion(idUsuarioDestino, notificacion);
                    sseService.enviarAlertaVencimiento(idUsuarioDestino, {
                        idTarea: tarea.idTarea,
                        nombre: tarea.nombre,
                        descripcion: tarea.descripcion,
                        fechaVencimiento: tarea.fechaVencimiento,
                        prioridad: tarea.prioridad,
                        lista: tarea.lista
                    });

                    enviadas++;
                }
            }

            if (enviadas > 0) {
                console.log(`Alertas de vencimiento enviadas: ${enviadas}`);
            }

            return enviadas;
        } catch (error) {
            console.error('Error procesando alertas de vencimiento:', error);
            throw error;
        }
    }

    verificarDebeRepetir(tarea, ahora) {
        if (!tarea.ultimaRepeticion) {
            return false;
        }

        const ultimaRepeticion = new Date(tarea.ultimaRepeticion);
        const horasPasadas = (ahora - ultimaRepeticion) / (1000 * 60 * 60);

        switch (tarea.tipoRepeticion) {
            case 'diario':
                return horasPasadas >= 24;
            
            case 'laborales':
                const diaActual = ahora.getDay();
                if (diaActual === 0 || diaActual === 6) return false;
                return horasPasadas >= 24;
            
            case 'semanal':
                return horasPasadas >= 168;
            
            case 'mensual':
                const mesUltima = ultimaRepeticion.getMonth();
                const mesActual = ahora.getMonth();
                return mesUltima !== mesActual;
            
            case 'personalizado':
                if (tarea.configRepeticion?.dias) {
                    return horasPasadas >= (tarea.configRepeticion.dias * 24);
                }
                return false;
            
            default:
                return false;
        }
    }

    calcularNuevaFechaVencimiento(tarea, ahora) {
        if (!tarea.fechaVencimiento) return null;

        const nuevaFecha = new Date(ahora);

        switch (tarea.tipoRepeticion) {
            case 'diario':
                nuevaFecha.setDate(nuevaFecha.getDate() + 1);
                break;
            
            case 'laborales':
                nuevaFecha.setDate(nuevaFecha.getDate() + 1);
                while (nuevaFecha.getDay() === 0 || nuevaFecha.getDay() === 6) {
                    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
                }
                break;
            
            case 'semanal':
                nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                break;
            
            case 'mensual':
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
                break;
            
            case 'personalizado':
                if (tarea.configRepeticion?.dias) {
                    nuevaFecha.setDate(nuevaFecha.getDate() + tarea.configRepeticion.dias);
                }
                break;
        }

        return nuevaFecha.toISOString().split('T')[0];
    }

    obtenerEstado() {
        return {
            activo: this.intervaloActivo !== null,
            ejecutando: this.ejecutando,
            ultimaEjecucion: this.ultimaEjecucion,
            clientesSSE: sseService.obtenerEstadisticas()
        };
    }
}

module.exports = new TareasSchedulerService();