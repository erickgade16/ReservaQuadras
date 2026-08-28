using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Services;

namespace ReservaQuadras.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuadrasController : ControllerBase
    {
        private readonly IQuadraService _quadraService;

        public QuadrasController(IQuadraService quadraService)
        {
            _quadraService = quadraService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var quadras = await _quadraService.ListarAsync();

            return Ok(quadras);
        }

        [HttpPost]
        public async Task<IActionResult> Post(Quadra quadra)
        {
            var quadraCriada =
                await _quadraService.CriarAsync(quadra);

            return CreatedAtAction(
                nameof(Get),
                new { id = quadraCriada.Id },
                quadraCriada
            );
        }

        [HttpPut("{quadraId}")]
        public async Task<IActionResult> Put(
            int quadraId,
            Quadra quadra)
        {
            var quadraAtualizada =
                await _quadraService.AtualizarAsync(
                    quadraId,
                    quadra
                );

            if (quadraAtualizada == null)
                return NotFound("Quadra não encontrada.");

            return Ok(quadraAtualizada);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AlterarStatus(
            int id,
            [FromBody] bool ativa)
        {
            var quadra =
                await _quadraService.AlterarStatusAsync(
                    id,
                    ativa
                );

            if (quadra == null)
                return NotFound("Quadra não encontrada.");

            return Ok(quadra);
        }
    }
}