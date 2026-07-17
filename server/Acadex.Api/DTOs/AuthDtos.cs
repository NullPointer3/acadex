using System.ComponentModel.DataAnnotations;
using Acadex.Api.Models;

namespace Acadex.Api.DTOs;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record UserSummary(Guid Id, string Email, string FirstName, string LastName, UserRole Role);

public record AuthResponse(string Token, DateTime ExpiresAt, UserSummary User);
