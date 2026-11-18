using ReservaQuadras.API.DTOs;

namespace ReservaQuadras.API.Services;

public interface IDashboardService
{
    Task<DashboardResumo> ObterResumoAsync(DateTime agora);
}
