using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ReservaQuadras.API.DTOs;
using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReservaQuadras.API.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<Usuario> _passwordHasher;

    // CONTADOR DE TENTATIVAS
    private static readonly Dictionary<int, int> TentativasLogin = new();

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IConfiguration configuration,
        IPasswordHasher<Usuario> passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var usuario = await _usuarioRepository
            .BuscarPorEmailAsync(request.Email);

        if (usuario == null)
            return null;

        if (usuario.Bloqueado)
        {
            throw new InvalidOperationException(
                "Usuário bloqueado."
            );
        }

        var resultado = _passwordHasher.VerifyHashedPassword(
            usuario,
            usuario.Senha!,
            request.Senha
        );

        if (resultado == PasswordVerificationResult.Failed)
        {
            if (!TentativasLogin.ContainsKey(usuario.Id))
            {
                TentativasLogin[usuario.Id] = 0;
            }

            TentativasLogin[usuario.Id]++;

            if (TentativasLogin[usuario.Id] >= 10)
            {
                usuario.Bloqueado = true;

                await _usuarioRepository.AtualizarAsync();

                TentativasLogin.Remove(usuario.Id);

                throw new InvalidOperationException(
                    "Usuário bloqueado após várias tentativas inválidas."
                );
            }

            throw new InvalidOperationException(
                "E-mail ou senha inválidos."
            );
        }

        TentativasLogin.Remove(usuario.Id);

        if (!usuario.Ativo)
        {
            throw new InvalidOperationException(
                "O usuário está inativo."
            );
        }

        var token = GerarToken(usuario);

        return new LoginResponse
        {
            Token = token,
            Usuario = new UsuarioResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email
            }
        };
    }

    private string GerarToken(Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"];

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                usuario.Id.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                usuario.Nome
            ),

            new Claim(
                ClaimTypes.Email,
                usuario.Email
            )
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                double.Parse(
                    _configuration["Jwt:ExpirationMinutes"]!
                )
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}