using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : Controller
    {

        private readonly ReservaQuadrasContext _context;

        public UsuariosController(ReservaQuadrasContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var usuarios = await _context.Usuarios.ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> Post(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(Get),
                new { id = usuario.Id },
                usuario
                );

        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Usuario usuario)
        {

            var usuarioExistente = await _context.Usuarios.FindAsync(id);

            if (usuarioExistente == null)
                return NotFound("Usuário não encontrado.");

            usuarioExistente.Nome = usuario.Nome;
            usuarioExistente.Email = usuario.Email;

            if (!string.IsNullOrWhiteSpace(usuario.Senha))
            {
                usuarioExistente.Senha = usuario.Senha;
            }

            await _context.SaveChangesAsync();

            return Ok(usuarioExistente);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AlterarStatus(int id, [FromBody] bool ativo)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
                return NotFound("Usuário não encontrado.");

            usuario.Ativo = ativo;

            await _context.SaveChangesAsync();

            return Ok(usuario);
        }
    }
}
