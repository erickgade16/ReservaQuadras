using ReservaQuadras.API.DTOs;

namespace ReservaQuadras.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}