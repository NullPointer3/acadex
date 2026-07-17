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
public class TimetableController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public TimetableController(AcadexDbContext db)
    {
        _db = db;
    }

    private static TimetableEntryResponse ToResponse(TimetableEntry t) => new(
        t.Id, t.ClassRoomId, $"{t.ClassRoom.Name} {t.ClassRoom.Section}",
        t.SubjectId, t.Subject.Name,
        t.TeacherId, $"{t.Teacher.User.FirstName} {t.Teacher.User.LastName}",
        t.DayOfWeek, t.StartTime, t.EndTime);

    [HttpGet]
    public async Task<ActionResult<List<TimetableEntryResponse>>> GetAll(
        [FromQuery] Guid? classRoomId, [FromQuery] Guid? teacherId)
    {
        var query = _db.TimetableEntries
            .Include(t => t.ClassRoom)
            .Include(t => t.Subject)
            .Include(t => t.Teacher).ThenInclude(t => t.User)
            .AsNoTracking()
            .AsQueryable();

        if (classRoomId is not null) query = query.Where(t => t.ClassRoomId == classRoomId);
        if (teacherId is not null) query = query.Where(t => t.TeacherId == teacherId);

        var entries = await query.ToListAsync();
        return Ok(entries.Select(ToResponse));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TimetableEntryResponse>> Create(CreateTimetableEntryRequest request)
    {
        if (request.EndTime <= request.StartTime)
        {
            return BadRequest(new { message = "EndTime must be after StartTime." });
        }

        var overlap = await _db.TimetableEntries.AnyAsync(t =>
            t.ClassRoomId == request.ClassRoomId &&
            t.DayOfWeek == request.DayOfWeek &&
            request.StartTime < t.EndTime && t.StartTime < request.EndTime);
        if (overlap)
        {
            return Conflict(new { message = "This class room already has an overlapping timetable entry." });
        }

        var entry = new TimetableEntry
        {
            Id = Guid.NewGuid(),
            ClassRoomId = request.ClassRoomId,
            SubjectId = request.SubjectId,
            TeacherId = request.TeacherId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime
        };

        _db.TimetableEntries.Add(entry);
        await _db.SaveChangesAsync();

        await _db.Entry(entry).Reference(e => e.ClassRoom).LoadAsync();
        await _db.Entry(entry).Reference(e => e.Subject).LoadAsync();
        await _db.Entry(entry).Reference(e => e.Teacher).Query().Include(t => t.User).LoadAsync();

        return CreatedAtAction(nameof(GetAll), new { classRoomId = entry.ClassRoomId }, ToResponse(entry));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entry = await _db.TimetableEntries.SingleOrDefaultAsync(t => t.Id == id);
        if (entry is null) return NotFound();

        _db.TimetableEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
