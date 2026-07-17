using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateSubjectRequest(
    [Required] string Name,
    [Required] string Code
);

public record UpdateSubjectRequest(
    [Required] string Name,
    [Required] string Code
);

public record SubjectResponse(Guid Id, string Name, string Code);
