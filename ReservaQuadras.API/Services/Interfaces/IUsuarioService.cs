using ReservaQuadras.API.DTOs;
using ReservaQuadras.API.Entities;

namespace ReservaQuadras.API.Services;

public interface IUsuarioService
{
    Task<List<Usuario>> ListarAsync();

    Task<Usuario> CriarAsync(Usuario usuario);

    Task<Usuario> CriarRapidoAsync(CriarUsuarioRapidoRequest request);

    Task<Usuario?> AtualizarAsync(int id, Usuario usuario);

    Task<Usuario?> AtualizarPerfilAsync(int id, AtualizarPerfilRequest request);

    Task<Usuario?> AlterarStatusAsync(int id, bool ativo);
}