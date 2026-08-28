using ReservaQuadras.API.Entities;
using ReservaQuadras.API.Repositories;

namespace ReservaQuadras.API.Services;

public class ReservaService : IReservaService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IQuadraRepository _quadraRepository;

    public ReservaService(
        IReservaRepository reservaRepository,
        IUsuarioRepository usuarioRepository,
        IQuadraRepository quadraRepository)
    {
        _reservaRepository = reservaRepository;
        _usuarioRepository = usuarioRepository;
        _quadraRepository = quadraRepository;
    }

    public async Task<List<Reserva>> ListarAsync()
    {
        return await _reservaRepository.ListarAsync();
    }

    public async Task<Reserva> CriarAsync(Reserva reserva)
    {
        var usuario =
            await _usuarioRepository.BuscarPorIdAsync(
                reserva.UsuarioId);

        if (usuario == null)
            throw new InvalidOperationException(
                "Usuário não encontrado.");

        if (!usuario.Ativo)
            throw new InvalidOperationException(
                "O usuário está inativo.");

        var quadra =
            await _quadraRepository.BuscarPorIdAsync(
                reserva.QuadraId);

        if (quadra == null)
            throw new InvalidOperationException(
                "Quadra não encontrada.");

        if (!quadra.Ativa)
            throw new InvalidOperationException(
                "A quadra está inativa.");

        ValidarHorario(reserva, quadra);

        var conflito =
            await _reservaRepository.ExisteConflitoAsync(
                reserva);

        if (conflito)
            throw new InvalidOperationException(
                "A quadra já está reservada nesse horário.");

        return await _reservaRepository.CriarAsync(reserva);
    }

    public async Task<Reserva?> AtualizarAsync(
        int id,
        Reserva reserva)
    {
        if (id != reserva.Id)
            throw new InvalidOperationException(
                "O ID da URL é diferente do ID da reserva.");

        var reservaExistente =
            await _reservaRepository.BuscarPorIdAsync(id);

        if (reservaExistente == null)
            return null;

        var usuario =
            await _usuarioRepository.BuscarPorIdAsync(
                reserva.UsuarioId);

        if (usuario == null)
            throw new InvalidOperationException(
                "Usuário não encontrado.");

        if (!usuario.Ativo)
            throw new InvalidOperationException(
                "O usuário está inativo.");

        var quadra =
            await _quadraRepository.BuscarPorIdAsync(
                reserva.QuadraId);

        if (quadra == null)
            throw new InvalidOperationException(
                "Quadra não encontrada.");

        if (!quadra.Ativa)
            throw new InvalidOperationException(
                "A quadra está inativa.");

        ValidarHorario(reserva, quadra);

        var conflito =
            await _reservaRepository.ExisteConflitoAsync(
                reserva);

        if (conflito)
            throw new InvalidOperationException(
                "A quadra já está reservada nesse horário.");

        reservaExistente.UsuarioId = reserva.UsuarioId;
        reservaExistente.QuadraId = reserva.QuadraId;
        reservaExistente.DataReserva = reserva.DataReserva;
        reservaExistente.HoraInicio = reserva.HoraInicio;
        reservaExistente.HoraFim = reserva.HoraFim;
        reservaExistente.Ativo = reserva.Ativo;

        await _reservaRepository.AtualizarAsync();

        return reservaExistente;
    }

    public async Task<List<Reserva>?> ListarPorQuadraAsync(
        int quadraId,
        DateTime data)
    {
        var quadra =
            await _quadraRepository.BuscarPorIdAsync(
                quadraId);

        if (quadra == null)
            return null;

        return await _reservaRepository
            .BuscarPorQuadraEDataAsync(
                quadraId,
                data);
    }

    public async Task<object[]?> BuscarHorariosDisponiveisAsync(
    int quadraId,
    DateTime data)
    {
        var quadra =
            await _quadraRepository.BuscarPorIdAsync(
                quadraId);

        if (quadra == null)
            return null;

        if (!quadra.Ativa)
            throw new InvalidOperationException(
                "A quadra está inativa.");

        var reservas =
            await _reservaRepository
                .BuscarPorQuadraEDataAsync(
                    quadraId,
                    data);

        var horariosDisponiveis = new List<object>();

        if (!quadra.DuracaoReservaMinutos.HasValue ||
    quadra.DuracaoReservaMinutos <= 0)
        {
            throw new InvalidOperationException(
                "A quadra não possui uma duração de reserva configurada.");
        }

        var duracao = TimeSpan.FromMinutes(
            quadra.DuracaoReservaMinutos.Value);

        for (
            var inicio = quadra.HoraAbertura;
            inicio < quadra.HoraFechamento;
            inicio = inicio.Add(duracao))
        {
            var fim = inicio.Add(duracao);

            if (fim > quadra.HoraFechamento)
                break;

            var ocupado = reservas.Any(r =>
                r.Ativo &&
                inicio < r.HoraFim &&
                fim > r.HoraInicio);

            horariosDisponiveis.Add(new
            {
                horaInicio = inicio,
                horaFim = fim,
                disponivel = !ocupado
            });
        }

        return horariosDisponiveis.ToArray();
    }

    public async Task<Reserva?> AlterarStatusAsync(
        int id,
        bool ativo)
    {
        var reserva =
            await _reservaRepository.BuscarPorIdAsync(id);

        if (reserva == null)
            return null;

        reserva.Ativo = ativo;

        await _reservaRepository.AtualizarAsync();

        return reserva;
    }

    private static void ValidarHorario(
        Reserva reserva,
        Quadra quadra)
    {
        if (reserva.HoraInicio >= reserva.HoraFim)
        {
            throw new InvalidOperationException(
                "O horário de início deve ser menor que o horário de fim.");
        }

        if (reserva.HoraInicio < quadra.HoraAbertura ||
            reserva.HoraFim > quadra.HoraFechamento)
        {
            throw new InvalidOperationException(
                $"A reserva deve estar entre " +
                $"{quadra.HoraAbertura:hh\\:mm} e " +
                $"{quadra.HoraFechamento:hh\\:mm}.");
        }
    }
}