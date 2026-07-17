using System.ComponentModel.DataAnnotations;
using Acadex.Api.Models;

namespace Acadex.Api.DTOs;

public record AttendanceEntry(
    [Required] Guid StudentId,
    [Required] AttendanceStatus Status,
    string? Notes
);

public record RecordAttendanceRequest(
    [Required] Guid ClassRoomId,
    [Required] DateTime Date,
    [Required] List<AttendanceEntry> Entries
);

public record AttendanceRecordResponse(
    Guid Id,
    Guid StudentId,
    string StudentName,
    Guid ClassRoomId,
    DateTime Date,
    AttendanceStatus Status,
    string? Notes
);
