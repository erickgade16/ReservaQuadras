using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ReservaQuadras.API.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ReservaQuadrasContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher<Entities.Usuario> _passwordHasher;

    public AuthController(
        ReservaQuadrasContext context,
        IConfiguration configuration,
        IPasswordHasher<Entities.Usuario> passwordHasher)
    {
        _context = context;
        _configuration = configuration;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var usuario = _context.Usuarios
    .FirstOrDefault(u => u.Email == request.Email);

        if (usuario == null)
        {
            return Unauthorized("E-mail ou senha inválidos.");
        }

        var resultado = _passwordHasher.VerifyHashedPassword(
            usuario,
            usuario.Senha!,
            request.Senha
        );

        if (resultado == PasswordVerificationResult.Failed)
        {
            return Unauthorized("E-mail ou senha inválidos.");
        }

        if (!usuario.Ativo)
        {
            return Unauthorized("O usuário está inativo.");
        }

        var token = GerarToken(usuario);

        return Ok(new
        {
            token,
            usuario = new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email
            }
        });
    }

    private string GerarToken(Entities.Usuario usuario)
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

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Senha { get; set; } = string.Empty;
}