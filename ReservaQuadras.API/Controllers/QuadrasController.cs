using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReservaQuadras.API.Data;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
    }
}
