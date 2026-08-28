using Microsoft.AspNetCore.Mvc;
using ReservaQuadras.API.DTOs;
using ReservaQuadras.API.Services;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        try
        {
            var resultado = await _authService.LoginAsync(request);

            if (resultado == null)
            {
                return Unauthorized(
                    "E-mail ou senha inválidos."
                );
            }

            return Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}