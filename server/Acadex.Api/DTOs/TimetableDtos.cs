using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateTimetableEntryRequest(
    [Required] Guid ClassRoomId,
    [Required] Guid SubjectId,
    [Required] Guid TeacherId,
    [Required] DayOfWeek DayOfWeek,
    [Required] TimeSpan StartTime,
    [Required] TimeSpan EndTime
);

public record TimetableEntryResponse(
    Guid Id,
    Guid ClassRoomId,
    string ClassRoomName,
    Guid SubjectId,
    string SubjectName,
    Guid TeacherId,
    string TeacherName,
    DayOfWeek DayOfWeek,
    TimeSpan StartTime,
    TimeSpan EndTime
);
