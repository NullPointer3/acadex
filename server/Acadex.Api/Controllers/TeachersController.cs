using Acadex.Api.Data;
using Acadex.Api.DTOs;
using Acadex.Api.Models;
using Acadex.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acadex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeachersController : ControllerBase
{
    private readonly AcadexDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public TeachersController(AcadexDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    private static TeacherResponse ToResponse(Teacher t) => new(
        t.Id, t.UserId, t.User.Email, t.User.FirstName, t.User.LastName,
        t.EmployeeNumber, t.HireDate, t.PhoneNumber);

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<TeacherResponse>>> GetAll()
    {
        var teachers = await _db.Teachers.Include(t => t.User).AsNoTracking().ToListAsync();
        return Ok(teachers.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<TeacherResponse>> GetById(Guid id)
    {
        var teacher = await _db.Teachers.Include(t => t.User).AsNoTracking().SingleOrDefaultAsync(t => t.Id == id);
        if (teacher is null) return NotFound();

        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!User.IsInRole("Admin") && teacher.UserId.ToString() != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToResponse(teacher));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeacherResponse>> Create(CreateTeacherRequest request)
    {
        var email = request.Email.ToLower();
        if (await _db.Users.AnyAsync(u => u.Email == email))
        {
            return Conflict(new { message = "A user with this email already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = UserRole.Teacher
        };

        var teacher = new Teacher
        {
            Id = Guid.NewGuid(),
            User = user,
            EmployeeNumber = request.EmployeeNumber,
            HireDate = request.HireDate,
            PhoneNumber = request.PhoneNumber
        };

        _db.Users.Add(user);
        _db.Teachers.Add(teacher);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = teacher.Id }, ToResponse(teacher));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TeacherResponse>> Update(Guid id, UpdateTeacherRequest request)
    {
        var teacher = await _db.Teachers.Include(t => t.User).SingleOrDefaultAsync(t => t.Id == id);
        if (teacher is null) return NotFound();

        teacher.User.FirstName = request.FirstName;
        teacher.User.LastName = request.LastName;
        teacher.EmployeeNumber = request.EmployeeNumber;
        teacher.HireDate = request.HireDate;
        teacher.PhoneNumber = request.PhoneNumber;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(teacher));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var teacher = await _db.Teachers.Include(t => t.User).SingleOrDefaultAsync(t => t.Id == id);
        if (teacher is null) return NotFound();

        _db.Users.Remove(teacher.User);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
