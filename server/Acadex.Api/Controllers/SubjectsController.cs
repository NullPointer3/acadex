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
public class SubjectsController : ControllerBase
{
    private readonly AcadexDbContext _db;

    public SubjectsController(AcadexDbContext db)
    {
        _db = db;
    }

    private static SubjectResponse ToResponse(Subject s) => new(s.Id, s.Name, s.Code);

    [HttpGet]
    public async Task<ActionResult<List<SubjectResponse>>> GetAll()
    {
        var subjects = await _db.Subjects.AsNoTracking().ToListAsync();
        return Ok(subjects.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubjectResponse>> GetById(Guid id)
    {
        var subject = await _db.Subjects.AsNoTracking().SingleOrDefaultAsync(s => s.Id == id);
        if (subject is null) return NotFound();
        return Ok(ToResponse(subject));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectResponse>> Create(CreateSubjectRequest request)
    {
        var subject = new Subject { Id = Guid.NewGuid(), Name = request.Name, Code = request.Code };
        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = subject.Id }, ToResponse(subject));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectResponse>> Update(Guid id, UpdateSubjectRequest request)
    {
        var subject = await _db.Subjects.SingleOrDefaultAsync(s => s.Id == id);
        if (subject is null) return NotFound();

        subject.Name = request.Name;
        subject.Code = request.Code;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(subject));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var subject = await _db.Subjects.SingleOrDefaultAsync(s => s.Id == id);
        if (subject is null) return NotFound();

        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
