namespace ReservaQuadras.API.DTOs;

public class AtualizarPerfilRequest
{
    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Só são necessárias para trocar a senha
    public string? SenhaAtual { get; set; }

    public string? NovaSenha { get; set; }
}
