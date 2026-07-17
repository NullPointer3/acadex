using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateTeacherRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string EmployeeNumber,
    [Required] DateTime HireDate,
    string? PhoneNumber
);

public record UpdateTeacherRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string EmployeeNumber,
    [Required] DateTime HireDate,
    string? PhoneNumber
);

public record TeacherResponse(
    Guid Id,
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string EmployeeNumber,
    DateTime HireDate,
    string? PhoneNumber
);
