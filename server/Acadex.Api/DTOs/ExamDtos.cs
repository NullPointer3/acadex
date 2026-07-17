using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateExamRequest(
    [Required] string Name,
    [Required] string Term,
    [Required] string AcademicYear,
    [Required] DateTime Date,
    [Required] decimal MaxScore,
    [Required] Guid SubjectId,
    [Required] Guid ClassRoomId
);

public record ExamResponse(
    Guid Id,
    string Name,
    string Term,
    string AcademicYear,
    DateTime Date,
    decimal MaxScore,
    Guid SubjectId,
    string SubjectName,
    Guid ClassRoomId,
    string ClassRoomName
);
