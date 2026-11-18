using ReservaQuadras.API.DTOs;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public interface IUsuarioRepository
{
    Task<List<Usuario>> ListarAsync();

    Task<(List<Usuario> Itens, int Total)> ListarPaginadoAsync(
        ConsultaPaginada consulta);

    Task<List<Usuario>> BuscarParaSelecaoAsync(
        string? termo,
        int limite);

    Task<Usuario?> BuscarPorIdAsync(int id);

    Task<Usuario?> BuscarPorEmailAsync(string email);

    Task<Usuario> CriarAsync(Usuario usuario);

    Task AtualizarAsync();

    Task<bool> EmailExisteAsync(
        string email,
        int? usuarioId = null);
}