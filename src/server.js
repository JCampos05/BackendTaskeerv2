const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const models = require('./models/index.models');
const routes = require('./routes/index.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Taskeer funcionando correctamente',
        version: '1.0.0',
        estado: 'activo'
    });
});

app.get('/health', (req, res) => {
    res.json({
        estado: 'OK',
        baseDatos: 'Conectada',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', routes);

const iniciarServidor = async () => {
    try {
        await testConnection();
        
        await sequelize.sync({ alter: false });
        console.log('Modelos sincronizados con la base de datos');
        
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

iniciarServidor();

module.exports = app;