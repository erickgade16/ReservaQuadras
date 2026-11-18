using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReservaQuadras.API.Services;

namespace ReservaQuadras.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // "agora" vem do navegador (horário local do usuário); se faltar, usa o do servidor
    [HttpGet("resumo")]
    public async Task<IActionResult> Resumo([FromQuery] DateTime? agora)
    {
        var resumo =
            await _dashboardService.ObterResumoAsync(agora ?? DateTime.Now);

        return Ok(resumo);
    }
}
