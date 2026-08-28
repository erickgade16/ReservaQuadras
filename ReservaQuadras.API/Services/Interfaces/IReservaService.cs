using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Services;

public interface IReservaService
{
    Task<List<Reserva>> ListarAsync();

    Task<Reserva> CriarAsync(Reserva reserva);

    Task<Reserva?> AtualizarAsync(
        int id,
        Reserva reserva);

    Task<List<Reserva>?> ListarPorQuadraAsync(
        int quadraId,
        DateTime data);

    Task<object[]?> BuscarHorariosDisponiveisAsync(
        int quadraId,
        DateTime data);

    Task<Reserva?> AlterarStatusAsync(
        int id,
        bool ativo);
}