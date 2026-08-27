using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;
using Microsoft.AspNetCore.Authorization;

namespace ReservaQuadras.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuadrasController : Controller
    {
        private readonly ReservaQuadrasContext _context;

        public QuadrasController(ReservaQuadrasContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var quadras = await _context.Quadras.ToListAsync();

            return Ok(quadras);
        }
        [HttpPost]
        public async Task<IActionResult> Post(Quadra quadra)
        {
            _context.Quadras.Add(quadra);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = quadra.Id }, quadra);
        }

        [HttpPut("{quadraId}")]
        public async Task<IActionResult> Put(Quadra quadra)
        {
            _context.Quadras.Update(quadra);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = quadra.Id }, quadra);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AlterarStatus(
     int id,
     [FromBody] bool ativa)
        {
            var quadra = await _context.Quadras.FindAsync(id);

            if (quadra == null)
                return NotFound("Quadra não encontrada.");

            quadra.Ativa = ativa;

            await _context.SaveChangesAsync();

            return Ok(quadra);
        }
    }
}
