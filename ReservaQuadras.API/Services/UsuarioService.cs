using Microsoft.AspNetCore.Identity;
using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Repositories;

namespace ReservaQuadras.API.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    public UsuarioService(
        IUsuarioRepository usuarioRepository,
        IPasswordHasher<Usuario> passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<Usuario>> ListarAsync()
    {
        return await _usuarioRepository.ListarAsync();
    }

    public async Task<Usuario> CriarAsync(Usuario usuario)
    {
        var emailExiste = await _usuarioRepository
            .EmailExisteAsync(usuario.Email);

        if (emailExiste)
        {
            throw new InvalidOperationException(
                "Este e-mail já está cadastrado."
            );
        }

        usuario.Email = usuario.Email.Trim().ToLower();

        usuario.Senha = _passwordHasher.HashPassword(
            usuario,
            usuario.Senha!
        );

        return await _usuarioRepository.CriarAsync(usuario);
    }

    public async Task<Usuario?> AtualizarAsync(
        int id,
        Usuario usuario)
    {
        var usuarioExistente =
            await _usuarioRepository.BuscarPorIdAsync(id);

        if (usuarioExistente == null)
            return null;

        var emailExiste = await _usuarioRepository
            .EmailExisteAsync(usuario.Email, id);

        if (emailExiste)
        {
            throw new InvalidOperationException(
                "Este e-mail já está cadastrado."
            );
        }

        usuarioExistente.Nome = usuario.Nome;
        usuarioExistente.Email = usuario.Email.Trim().ToLower();

        if (!string.IsNullOrWhiteSpace(usuario.Senha))
        {
            usuarioExistente.Senha =
                _passwordHasher.HashPassword(
                    usuarioExistente,
                    usuario.Senha
                );
        }

        await _usuarioRepository.AtualizarAsync();

        return usuarioExistente;
    }

    public async Task<Usuario?> AlterarStatusAsync(
        int id,
        bool ativo)
    {
        var usuario =
            await _usuarioRepository.BuscarPorIdAsync(id);

        if (usuario == null)
            return null;

        usuario.Ativo = ativo;

        await _usuarioRepository.AtualizarAsync();

        return usuario;
    }
}