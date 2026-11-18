using Microsoft.AspNetCore.Identity;
using ReservaQuadras.API.DTOs;
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

    public async Task<PaginadoResponse<UsuarioListaItem>> ListarPaginadoAsync(
        ConsultaPaginada consulta)
    {
        var (itens, total) =
            await _usuarioRepository.ListarPaginadoAsync(consulta);

        return PaginadoResponse<UsuarioListaItem>.Criar(
            itens.Select(UsuarioListaItem.De).ToList(),
            total,
            consulta);
    }

    public async Task<List<UsuarioListaItem>> BuscarParaSelecaoAsync(
        string? termo,
        int limite)
    {
        var limiteSeguro = Math.Clamp(limite, 1, 50);

        var usuarios =
            await _usuarioRepository.BuscarParaSelecaoAsync(
                termo,
                limiteSeguro);

        return usuarios.Select(UsuarioListaItem.De).ToList();
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

    // Cadastro rápido (ex.: ao reservar): só nome e e-mail, sem senha de acesso.
    public async Task<Usuario> CriarRapidoAsync(
        CriarUsuarioRapidoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            throw new InvalidOperationException(
                "Informe o nome."
            );
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException(
                "Informe o e-mail."
            );
        }

        var emailNormalizado = request.Email.Trim().ToLower();

        if (!emailNormalizado.Contains('@'))
        {
            throw new InvalidOperationException(
                "Informe um e-mail válido."
            );
        }

        var emailExiste = await _usuarioRepository
            .EmailExisteAsync(emailNormalizado);

        if (emailExiste)
        {
            throw new InvalidOperationException(
                "Este e-mail já está cadastrado."
            );
        }

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = emailNormalizado,
            Senha = null,
            Ativo = true,
            Bloqueado = false
        };

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

        // A senha não é alterada por aqui: cada usuário troca a própria no Perfil.

        await _usuarioRepository.AtualizarAsync();

        return usuarioExistente;
    }

    public async Task<Usuario?> AtualizarPerfilAsync(
        int id,
        AtualizarPerfilRequest request)
    {
        var usuario =
            await _usuarioRepository.BuscarPorIdAsync(id);

        if (usuario == null)
            return null;

        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            throw new InvalidOperationException(
                "Informe o nome."
            );
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException(
                "Informe o e-mail."
            );
        }

        var emailNormalizado = request.Email.Trim().ToLower();

        var emailExiste = await _usuarioRepository
            .EmailExisteAsync(emailNormalizado, id);

        if (emailExiste)
        {
            throw new InvalidOperationException(
                "Este e-mail já está cadastrado."
            );
        }

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            if (string.IsNullOrWhiteSpace(request.SenhaAtual))
            {
                throw new InvalidOperationException(
                    "Informe a senha atual."
                );
            }

            var resultado = _passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.Senha!,
                request.SenhaAtual
            );

            if (resultado == PasswordVerificationResult.Failed)
            {
                throw new InvalidOperationException(
                    "A senha atual está incorreta."
                );
            }

            if (request.NovaSenha.Length < 6)
            {
                throw new InvalidOperationException(
                    "A nova senha deve ter pelo menos 6 caracteres."
                );
            }

            usuario.Senha = _passwordHasher.HashPassword(
                usuario,
                request.NovaSenha
            );
        }

        usuario.Nome = request.Nome.Trim();
        usuario.Email = emailNormalizado;

        await _usuarioRepository.AtualizarAsync();

        return usuario;
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