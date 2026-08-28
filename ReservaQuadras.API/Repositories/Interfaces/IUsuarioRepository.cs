using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Repositories;

public interface IUsuarioRepository
{
    Task<List<Usuario>> ListarAsync();

    Task<Usuario?> BuscarPorIdAsync(int id);

    Task<Usuario?> BuscarPorEmailAsync(string email);

    Task<Usuario> CriarAsync(Usuario usuario);

    Task AtualizarAsync();

    Task<bool> EmailExisteAsync(
        string email,
        int? usuarioId = null);
}