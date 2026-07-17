using System.ComponentModel.DataAnnotations;

namespace Acadex.Api.DTOs;

public record CreateClassRoomRequest(
    [Required] string Name,
    [Required] string Section,
    [Required] string AcademicYear,
    Guid? HomeroomTeacherId
);

public record UpdateClassRoomRequest(
    [Required] string Name,
    [Required] string Section,
    [Required] string AcademicYear,
    Guid? HomeroomTeacherId
);

public record ClassRoomResponse(
    Guid Id,
    string Name,
    string Section,
    string AcademicYear,
    Guid? HomeroomTeacherId,
    string? HomeroomTeacherName,
    int StudentCount
);
