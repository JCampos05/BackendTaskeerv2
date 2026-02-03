const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const models = require('./models/index.models');
const routes = require('./routes/index.routes');
const tareasSchedulerService = require('./services/TareasScheduler.service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Taskeer funcionando correctamente',
        version: '1.0.0',
        estado: 'activo'
    });
});

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({
        estado: 'OK',
        baseDatos: 'Conectada',
        scheduler: tareasSchedulerService.obtenerEstado(),
        timestamp: new Date().toISOString()
    });
});


const iniciarServidor = async () => {
    try {
        console.log('-----------------------------------------------');
        await testConnection();
        
        await sequelize.sync({ alter: false });
        console.log('Modelos sincronizados con la base de datos');
        
        tareasSchedulerService.iniciar();
        
        app.listen(PORT, () => {
            console.log('-----------------------------------------------');
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log('-----------------------------------------------');
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, deteniendo scheduler...');
    tareasSchedulerService.detener();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, deteniendo scheduler...');
    tareasSchedulerService.detener();
    process.exit(0);
});

iniciarServidor();

module.exports = app;