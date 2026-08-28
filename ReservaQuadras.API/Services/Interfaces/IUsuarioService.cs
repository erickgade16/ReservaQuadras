using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Services;

public interface IUsuarioService
{
    Task<List<Usuario>> ListarAsync();

    Task<Usuario> CriarAsync(Usuario usuario);

    Task<Usuario?> AtualizarAsync(int id, Usuario usuario);

    Task<Usuario?> AlterarStatusAsync(int id, bool ativo);
}