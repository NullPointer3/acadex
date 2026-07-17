using Acadex.Api.Models;

namespace Acadex.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
