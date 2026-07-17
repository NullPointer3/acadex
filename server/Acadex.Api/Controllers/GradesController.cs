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
public class GradesController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public GradesController(AcadexDbContext db)
    {
        _db = db;
    }

    private static GradeResponse ToResponse(Grade g) => new(
        g.Id, g.StudentId, $"{g.Student.User.FirstName} {g.Student.User.LastName}",
        g.ExamId, g.Exam.Name, g.Score, g.Exam.MaxScore, g.Comments);

    [HttpGet("exam/{examId:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<GradeResponse>>> GetByExam(Guid examId)
    {
        var grades = await _db.Grades
            .Include(g => g.Student).ThenInclude(s => s.User)
            .Include(g => g.Exam)
            .AsNoTracking()
            .Where(g => g.ExamId == examId)
            .ToListAsync();

        return Ok(grades.Select(ToResponse));
    }

    [HttpGet("student/{studentId:guid}")]
    public async Task<ActionResult<List<GradeResponse>>> GetByStudent(Guid studentId)
    {
        var student = await _db.Students.AsNoTracking().SingleOrDefaultAsync(s => s.Id == studentId);
        if (student is null) return NotFound();

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isSelf = student.UserId.ToString() == currentUserId;
        if (!User.IsInRole("Admin") && !User.IsInRole("Teacher") && !isSelf)
        {
            return Forbid();
        }

        var grades = await _db.Grades
            .Include(g => g.Student).ThenInclude(s => s.User)
            .Include(g => g.Exam)
            .AsNoTracking()
            .Where(g => g.StudentId == studentId)
            .ToListAsync();

        return Ok(grades.Select(ToResponse));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<GradeResponse>>> Record(RecordGradesRequest request)
    {
        var exam = await _db.Exams.SingleOrDefaultAsync(e => e.Id == request.ExamId);
        if (exam is null) return NotFound(new { message = "Exam not found." });

        if (request.Entries.Any(e => e.Score < 0 || e.Score > exam.MaxScore))
        {
            return BadRequest(new { message = $"Score must be between 0 and {exam.MaxScore}." });
        }

        var studentIds = request.Entries.Select(e => e.StudentId).ToList();
        var existing = await _db.Grades
            .Where(g => g.ExamId == request.ExamId && studentIds.Contains(g.StudentId))
            .ToDictionaryAsync(g => g.StudentId);

        foreach (var entry in request.Entries)
        {
            if (existing.TryGetValue(entry.StudentId, out var grade))
            {
                grade.Score = entry.Score;
                grade.Comments = entry.Comments;
            }
            else
            {
                _db.Grades.Add(new Grade
                {
                    Id = Guid.NewGuid(),
                    StudentId = entry.StudentId,
                    ExamId = request.ExamId,
                    Score = entry.Score,
                    Comments = entry.Comments
                });
            }
        }

        await _db.SaveChangesAsync();

        var grades = await _db.Grades
            .Include(g => g.Student).ThenInclude(s => s.User)
            .Include(g => g.Exam)
            .AsNoTracking()
            .Where(g => g.ExamId == request.ExamId)
            .ToListAsync();

        return Ok(grades.Select(ToResponse));
    }
}
