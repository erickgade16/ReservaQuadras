using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Repositories;

namespace ReservaQuadras.API.Services;

public class QuadraService : IQuadraService
{
    private readonly IQuadraRepository _quadraRepository;

    public QuadraService(IQuadraRepository quadraRepository)
    {
        _quadraRepository = quadraRepository;
    }

    public async Task<List<Quadra>> ListarAsync()
    {
        return await _quadraRepository.ListarAsync();
    }

    public async Task<Quadra> CriarAsync(Quadra quadra)
    {
        return await _quadraRepository.CriarAsync(quadra);
    }

    public async Task<Quadra?> AtualizarAsync(
        int id,
        Quadra quadra)
    {
        var quadraExistente =
            await _quadraRepository.BuscarPorIdAsync(id);

        if (quadraExistente == null)
            return null;

        quadraExistente.Nome = quadra.Nome;
        quadraExistente.Tipo = quadra.Tipo;
        quadraExistente.PrecoHora = quadra.PrecoHora;
        quadraExistente.HoraAbertura = quadra.HoraAbertura;
        quadraExistente.HoraFechamento = quadra.HoraFechamento;
        quadraExistente.DuracaoReservaMinutos = quadra.DuracaoReservaMinutos;

        await _quadraRepository.AtualizarAsync();

        return quadraExistente;
    }

    public async Task<Quadra?> AlterarStatusAsync(
        int id,
        bool ativa)
    {
        var quadra =
            await _quadraRepository.BuscarPorIdAsync(id);

        if (quadra == null)
            return null;

        quadra.Ativa = ativa;

        await _quadraRepository.AtualizarAsync();

        return quadra;
    }
}