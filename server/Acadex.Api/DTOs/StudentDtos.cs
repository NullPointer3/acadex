using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateStudentRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string AdmissionNumber,
    [Required] DateTime DateOfBirth,
    [Required] DateTime EnrollmentDate,
    Guid? ClassRoomId,
    string? GuardianName,
    string? GuardianPhone
);

public record UpdateStudentRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required] string AdmissionNumber,
    [Required] DateTime DateOfBirth,
    Guid? ClassRoomId,
    string? GuardianName,
    string? GuardianPhone
);

public record StudentResponse(
    Guid Id,
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string AdmissionNumber,
    DateTime DateOfBirth,
    DateTime EnrollmentDate,
    Guid? ClassRoomId,
    string? ClassRoomName,
    string? GuardianName,
    string? GuardianPhone
);
