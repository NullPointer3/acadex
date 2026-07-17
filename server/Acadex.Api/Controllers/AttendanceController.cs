using System.Security.Claims;
using Acadex.Api.Data;
using Acadex.Api.DTOs;
using Acadex.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acadex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public AttendanceController(AcadexDbContext db)
    {
        _db = db;
    }

    private static AttendanceRecordResponse ToResponse(AttendanceRecord a) => new(
        a.Id, a.StudentId, $"{a.Student.User.FirstName} {a.Student.User.LastName}",
        a.ClassRoomId, a.Date, a.Status, a.Notes);

    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<AttendanceRecordResponse>>> GetByClassAndDate(
        [FromQuery] Guid classRoomId, [FromQuery] DateTime date)
    {
        var day = date.Date;
        var records = await _db.AttendanceRecords
            .Include(a => a.Student).ThenInclude(s => s.User)
            .AsNoTracking()
            .Where(a => a.ClassRoomId == classRoomId && a.Date == day)
            .ToListAsync();

        return Ok(records.Select(ToResponse));
    }

    [HttpGet("student/{studentId:guid}")]
    public async Task<ActionResult<List<AttendanceRecordResponse>>> GetByStudent(Guid studentId)
    {
        var student = await _db.Students.AsNoTracking().SingleOrDefaultAsync(s => s.Id == studentId);
        if (student is null) return NotFound();

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isSelf = student.UserId.ToString() == currentUserId;
        if (!User.IsInRole("Admin") && !User.IsInRole("Teacher") && !isSelf)
        {
            return Forbid();
        }

        var records = await _db.AttendanceRecords
            .Include(a => a.Student).ThenInclude(s => s.User)
            .AsNoTracking()
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        return Ok(records.Select(ToResponse));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<AttendanceRecordResponse>>> Record(RecordAttendanceRequest request)
    {
        var day = request.Date.Date;
        Guid? teacherId = null;
        if (User.IsInRole("Teacher"))
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            teacherId = await _db.Teachers.Where(t => t.UserId == currentUserId).Select(t => t.Id).SingleOrDefaultAsync();
        }

        var studentIds = request.Entries.Select(e => e.StudentId).ToList();
        var existing = await _db.AttendanceRecords
            .Where(a => a.ClassRoomId == request.ClassRoomId && a.Date == day && studentIds.Contains(a.StudentId))
            .ToDictionaryAsync(a => a.StudentId);

        foreach (var entry in request.Entries)
        {
            if (existing.TryGetValue(entry.StudentId, out var record))
            {
                record.Status = entry.Status;
                record.Notes = entry.Notes;
                record.RecordedByTeacherId = teacherId;
            }
            else
            {
                _db.AttendanceRecords.Add(new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    StudentId = entry.StudentId,
                    ClassRoomId = request.ClassRoomId,
                    Date = day,
                    Status = entry.Status,
                    Notes = entry.Notes,
                    RecordedByTeacherId = teacherId
                });
            }
        }

        await _db.SaveChangesAsync();

        var records = await _db.AttendanceRecords
            .Include(a => a.Student).ThenInclude(s => s.User)
            .AsNoTracking()
            .Where(a => a.ClassRoomId == request.ClassRoomId && a.Date == day)
            .ToListAsync();

        return Ok(records.Select(ToResponse));
    }
}
