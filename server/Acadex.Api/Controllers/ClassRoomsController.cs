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
public class ClassRoomsController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public ClassRoomsController(AcadexDbContext db)
    {
        _db = db;
    }

    private static ClassRoomResponse ToResponse(ClassRoom c) => new(
        c.Id, c.Name, c.Section, c.AcademicYear,
        c.HomeroomTeacherId,
        c.HomeroomTeacher?.User is null ? null : $"{c.HomeroomTeacher.User.FirstName} {c.HomeroomTeacher.User.LastName}",
        c.Students.Count);

    [HttpGet]
    public async Task<ActionResult<List<ClassRoomResponse>>> GetAll()
    {
        var classRooms = await _db.ClassRooms
            .Include(c => c.HomeroomTeacher).ThenInclude(t => t!.User)
            .Include(c => c.Students)
            .AsNoTracking()
            .ToListAsync();
        return Ok(classRooms.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClassRoomResponse>> GetById(Guid id)
    {
        var classRoom = await _db.ClassRooms
            .Include(c => c.HomeroomTeacher).ThenInclude(t => t!.User)
            .Include(c => c.Students)
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Id == id);
        if (classRoom is null) return NotFound();
        return Ok(ToResponse(classRoom));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClassRoomResponse>> Create(CreateClassRoomRequest request)
    {
        var classRoom = new ClassRoom
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Section = request.Section,
            AcademicYear = request.AcademicYear,
            HomeroomTeacherId = request.HomeroomTeacherId
        };

        _db.ClassRooms.Add(classRoom);
        await _db.SaveChangesAsync();

        await _db.Entry(classRoom).Reference(c => c.HomeroomTeacher).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = classRoom.Id }, ToResponse(classRoom));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClassRoomResponse>> Update(Guid id, UpdateClassRoomRequest request)
    {
        var classRoom = await _db.ClassRooms.Include(c => c.Students).SingleOrDefaultAsync(c => c.Id == id);
        if (classRoom is null) return NotFound();

        classRoom.Name = request.Name;
        classRoom.Section = request.Section;
        classRoom.AcademicYear = request.AcademicYear;
        classRoom.HomeroomTeacherId = request.HomeroomTeacherId;

        await _db.SaveChangesAsync();
        await _db.Entry(classRoom).Reference(c => c.HomeroomTeacher).LoadAsync();
        return Ok(ToResponse(classRoom));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var classRoom = await _db.ClassRooms.SingleOrDefaultAsync(c => c.Id == id);
        if (classRoom is null) return NotFound();

        _db.ClassRooms.Remove(classRoom);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
