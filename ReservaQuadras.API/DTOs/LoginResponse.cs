namespace ReservaQuadras.API.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public UsuarioResponse Usuario { get; set; } = new();
}

public class UsuarioResponse
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}