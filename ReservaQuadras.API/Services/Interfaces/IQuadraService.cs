using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Services;

public interface IQuadraService
{
    Task<List<Quadra>> ListarAsync();

    Task<Quadra> CriarAsync(Quadra quadra);

    Task<Quadra?> AtualizarAsync(int id, Quadra quadra);

    Task<Quadra?> AlterarStatusAsync(int id, bool ativa);
}