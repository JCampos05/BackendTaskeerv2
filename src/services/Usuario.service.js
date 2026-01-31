const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, ZonaHoraria } = require('../models/index.models');

class UsuarioService {
    async registrar(datos) {
        const { nombre, apellido, email, password, telefono, ubicacion, idZonaHoraria, cargo, bio } = datos;

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            throw new Error('El email ya está registrado');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password: passwordHash,
            telefono,
            ubicacion,
            idZonaHoraria,
            cargo,
            bio
        });

        const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON();
        return usuarioSinPassword;
    }

    async login(email, password) {
        const usuario = await Usuario.findOne({ 
            where: { email },
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                attributes: ['nombreZona', 'offsetUTC', 'nombreMostrar']
            }]
        });

        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            throw new Error('Credenciales inválidas');
        }

        const token = jwt.sign(
            { 
                idUsuario: usuario.idUsuario,
                email: usuario.email,
                nombre: usuario.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...usuarioSinPassword } = usuario.toJSON();

        return {
            token,
            usuario: usuarioSinPassword
        };
    }

    async obtenerPorId(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario, {
            attributes: { exclude: ['password'] },
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                attributes: ['nombreZona', 'offsetUTC', 'nombreMostrar']
            }]
        });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    }

    async obtenerTodos() {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] },
            include: [{
                model: ZonaHoraria,
                as: 'zonaHoraria',
                attributes: ['nombreZona', 'offsetUTC', 'nombreMostrar']
            }]
        });

        return usuarios;
    }

    async actualizar(idUsuario, datos) {
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const { password, email, ...datosActualizables } = datos;

        if (password) {
            datosActualizables.password = await bcrypt.hash(password, 10);
        }

        await usuario.update(datosActualizables);

        const { password: _, ...usuarioSinPassword } = usuario.toJSON();
        return usuarioSinPassword;
    }

    async eliminar(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        await usuario.destroy();
        return { mensaje: 'Usuario eliminado correctamente' };
    }
}

module.exports = new UsuarioService();