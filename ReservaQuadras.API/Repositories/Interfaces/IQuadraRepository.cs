using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public interface IQuadraRepository
{
    Task<List<Quadra>> ListarAsync();

    Task<Quadra?> BuscarPorIdAsync(int id);

    Task<Quadra> CriarAsync(Quadra quadra);

    Task AtualizarAsync();
}