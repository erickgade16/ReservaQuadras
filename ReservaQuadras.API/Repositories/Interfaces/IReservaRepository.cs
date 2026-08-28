using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public interface IReservaRepository
{
    Task<List<Reserva>> ListarAsync();

    Task<Reserva?> BuscarPorIdAsync(int id);

    Task<List<Reserva>> BuscarPorQuadraEDataAsync(
        int quadraId,
        DateTime data);

    Task<bool> ExisteConflitoAsync(
        Reserva reserva);

    Task<Reserva> CriarAsync(Reserva reserva);

    Task AtualizarAsync();
}