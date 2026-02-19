class SSEService {
    constructor() {
        this.clientes = new Map();
    }

    agregarCliente(idUsuario, res) {
        if (!this.clientes.has(idUsuario)) {
            this.clientes.set(idUsuario, []);
        }

        const cliente = {
            id: Date.now(),
            res,
            conectadoEn: new Date()
        };

        this.clientes.get(idUsuario).push(cliente);

        console.log(`Cliente SSE conectado: Usuario ${idUsuario}, Total clientes: ${this.obtenerTotalClientes()}`);

        return cliente.id;
    }

    removerCliente(idUsuario, clienteId) {
        if (!this.clientes.has(idUsuario)) {
            return;
        }

        const clientesUsuario = this.clientes.get(idUsuario);
        const indice = clientesUsuario.findIndex(c => c.id === clienteId);

        if (indice !== -1) {
            clientesUsuario.splice(indice, 1);
        }

        if (clientesUsuario.length === 0) {
            this.clientes.delete(idUsuario);
        }

        console.log(`Cliente SSE desconectado: Usuario ${idUsuario}, Total clientes: ${this.obtenerTotalClientes()}`);
    }

    enviarEvento(idUsuario, evento, datos) {
        if (!this.clientes.has(idUsuario)) {
            return false;
        }

        const clientesUsuario = this.clientes.get(idUsuario);
        let enviados = 0;

        clientesUsuario.forEach(cliente => {
            try {
                cliente.res.write(`event: ${evento}\n`);
                cliente.res.write(`data: ${JSON.stringify(datos)}\n\n`);
                enviados++;
            } catch (error) {
                console.error(`Error enviando evento SSE a usuario ${idUsuario}:`, error.message);
            }
        });

        return enviados > 0;
    }

    enviarNotificacion(idUsuario, notificacion) {
        return this.enviarEvento(idUsuario, 'notificacion', notificacion);
    }

    enviarRecordatorio(idUsuario, tarea) {
        return this.enviarEvento(idUsuario, 'recordatorio', tarea);
    }

    enviarAlertaVencimiento(idUsuario, tarea) {
        return this.enviarEvento(idUsuario, 'alerta_vencimiento', tarea);
    }

    enviarTareaRepetida(idUsuario, tarea) {
        return this.enviarEvento(idUsuario, 'tarea_repetida', tarea);
    }

    enviarCambioPermisos(idUsuario, datos) {
        return this.enviarEvento(idUsuario, 'cambio_permisos', datos);
    }

    enviarAccesoRemovido(idUsuario, datos) {
        return this.enviarEvento(idUsuario, 'acceso_removido', datos);
    }

    enviarCambioRolLista(idUsuario, datos) {
        return this.enviarEvento(idUsuario, 'cambio_rol_lista', datos);
    }

    enviarTareaAsignada(idUsuario, datos) {
        return this.enviarEvento(idUsuario, 'tarea_asignada', datos);
    }

    enviarPing(idUsuario) {
        return this.enviarEvento(idUsuario, 'ping', { timestamp: new Date().toISOString() });
    }

    obtenerClientesConectados(idUsuario) {
        return this.clientes.get(idUsuario)?.length || 0;
    }

    obtenerTotalClientes() {
        let total = 0;
        this.clientes.forEach(clientesUsuario => {
            total += clientesUsuario.length;
        });
        return total;
    }

    estaConectado(idUsuario) {
        return this.clientes.has(idUsuario) && this.clientes.get(idUsuario).length > 0;
    }

    limpiarConexionesInactivas() {
        const ahora = Date.now();
        const TIMEOUT = 5 * 60 * 1000;

        this.clientes.forEach((clientesUsuario, idUsuario) => {
            const clientesActivos = clientesUsuario.filter(cliente => {
                const tiempoConectado = ahora - cliente.conectadoEn.getTime();
                return tiempoConectado < TIMEOUT;
            });

            if (clientesActivos.length === 0) {
                this.clientes.delete(idUsuario);
            } else if (clientesActivos.length !== clientesUsuario.length) {
                this.clientes.set(idUsuario, clientesActivos);
            }
        });
    }

    obtenerEstadisticas() {
        return {
            totalUsuarios: this.clientes.size,
            totalConexiones: this.obtenerTotalClientes(),
            usuarios: Array.from(this.clientes.keys())
        };
    }
}

module.exports = new SSEService();