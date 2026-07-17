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
public class ExamsController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public ExamsController(AcadexDbContext db)
    {
        _db = db;
    }

    private static ExamResponse ToResponse(Exam e) => new(
        e.Id, e.Name, e.Term, e.AcademicYear, e.Date, e.MaxScore,
        e.SubjectId, e.Subject.Name, e.ClassRoomId, $"{e.ClassRoom.Name} {e.ClassRoom.Section}");

    [HttpGet]
    public async Task<ActionResult<List<ExamResponse>>> GetAll(
        [FromQuery] Guid? classRoomId, [FromQuery] Guid? subjectId)
    {
        var query = _db.Exams.Include(e => e.Subject).Include(e => e.ClassRoom).AsNoTracking().AsQueryable();
        if (classRoomId is not null) query = query.Where(e => e.ClassRoomId == classRoomId);
        if (subjectId is not null) query = query.Where(e => e.SubjectId == subjectId);

        var exams = await query.ToListAsync();
        return Ok(exams.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExamResponse>> GetById(Guid id)
    {
        var exam = await _db.Exams.Include(e => e.Subject).Include(e => e.ClassRoom)
            .AsNoTracking().SingleOrDefaultAsync(e => e.Id == id);
        if (exam is null) return NotFound();
        return Ok(ToResponse(exam));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ExamResponse>> Create(CreateExamRequest request)
    {
        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Term = request.Term,
            AcademicYear = request.AcademicYear,
            Date = request.Date,
            MaxScore = request.MaxScore,
            SubjectId = request.SubjectId,
            ClassRoomId = request.ClassRoomId
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();

        await _db.Entry(exam).Reference(e => e.Subject).LoadAsync();
        await _db.Entry(exam).Reference(e => e.ClassRoom).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = exam.Id }, ToResponse(exam));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var exam = await _db.Exams.SingleOrDefaultAsync(e => e.Id == id);
        if (exam is null) return NotFound();

        _db.Exams.Remove(exam);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
