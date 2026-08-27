using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;
using Microsoft.AspNetCore.Identity;

namespace ReservaQuadras.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : Controller
    {

        private readonly ReservaQuadrasContext _context;
        private readonly IPasswordHasher<Entities.Usuario> _passwordHasher;

        public UsuariosController(
        ReservaQuadrasContext context,
        IPasswordHasher<Usuario> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Get()
        {
            var usuarios = await _context.Usuarios.ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> Post(Usuario usuario)
        {
            usuario.Senha = _passwordHasher.HashPassword(
                usuario,
                usuario.Senha!
            );

            _context.Usuarios.Add(usuario);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(Get),
                new { id = usuario.Id },
                usuario
            );
        }


        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Put(int id, Usuario usuario)
        {

            var usuarioExistente = await _context.Usuarios.FindAsync(id);

            if (usuarioExistente == null)
                return NotFound("Usuário não encontrado.");

            usuarioExistente.Nome = usuario.Nome;
            usuarioExistente.Email = usuario.Email;

            if (!string.IsNullOrWhiteSpace(usuario.Senha))
            {
                usuarioExistente.Senha = _passwordHasher.HashPassword(
                    usuarioExistente,
                    usuario.Senha
                );
            }

            await _context.SaveChangesAsync();

            return Ok(usuarioExistente);
        }

        [HttpPatch("{id}/status")]
        [Authorize]
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
