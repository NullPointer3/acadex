using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record GradeEntry(
    [Required] Guid StudentId,
    [Required] decimal Score,
    string? Comments
);

public record RecordGradesRequest(
    [Required] Guid ExamId,
    [Required] List<GradeEntry> Entries
);

public record GradeResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid ExamId,
    string ExamName,
    decimal Score,
    decimal MaxScore,
    string? Comments
);
