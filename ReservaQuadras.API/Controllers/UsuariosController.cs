using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Services;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get()
    {
        var usuarios = await _usuarioService.ListarAsync();

        return Ok(usuarios);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Usuario usuario)
    {
        try
        {
            var usuarioCriado =
                await _usuarioService.CriarAsync(usuario);

            return CreatedAtAction(
                nameof(Get),
                new { id = usuarioCriado.Id },
                usuarioCriado
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Put(
        int id,
        Usuario usuario)
    {
        try
        {
            var usuarioAtualizado =
                await _usuarioService.AtualizarAsync(
                    id,
                    usuario
                );

            if (usuarioAtualizado == null)
                return NotFound("Usuário não encontrado.");

            return Ok(usuarioAtualizado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> AlterarStatus(
        int id,
        [FromBody] bool ativo)
    {
        var usuario =
            await _usuarioService.AlterarStatusAsync(
                id,
                ativo
            );

        if (usuario == null)
            return NotFound("Usuário não encontrado.");

        return Ok(usuario);
    }
}