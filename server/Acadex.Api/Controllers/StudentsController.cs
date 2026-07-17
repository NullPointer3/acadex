using System.Security.Claims;
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
public class StudentsController : ControllerBase
{
    private readonly AcadexDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public StudentsController(AcadexDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    private static StudentResponse ToResponse(Student s) => new(
        s.Id, s.UserId, s.User.Email, s.User.FirstName, s.User.LastName,
        s.AdmissionNumber, s.DateOfBirth, s.EnrollmentDate,
        s.ClassRoomId, s.ClassRoom?.Name is null ? null : $"{s.ClassRoom.Name} {s.ClassRoom.Section}",
        s.GuardianName, s.GuardianPhone);

    [HttpGet]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<StudentResponse>>> GetAll([FromQuery] Guid? classRoomId)
    {
        var query = _db.Students.Include(s => s.User).Include(s => s.ClassRoom).AsNoTracking();
        if (classRoomId is not null)
        {
            query = query.Where(s => s.ClassRoomId == classRoomId);
        }

        var students = await query.ToListAsync();
        return Ok(students.Select(ToResponse));
    }

    [HttpGet("me")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentResponse>> GetMe()
    {
        var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var student = await _db.Students.Include(s => s.User).Include(s => s.ClassRoom)
            .AsNoTracking().SingleOrDefaultAsync(s => s.UserId == currentUserId);
        if (student is null) return NotFound();

        return Ok(ToResponse(student));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StudentResponse>> GetById(Guid id)
    {
        var student = await _db.Students.Include(s => s.User).Include(s => s.ClassRoom)
            .AsNoTracking().SingleOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound();

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isSelf = student.UserId.ToString() == currentUserId;
        if (!User.IsInRole("Admin") && !User.IsInRole("Teacher") && !isSelf)
        {
            return Forbid();
        }

        return Ok(ToResponse(student));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentResponse>> Create(CreateStudentRequest request)
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
            Role = UserRole.Student
        };

        var student = new Student
        {
            Id = Guid.NewGuid(),
            User = user,
            AdmissionNumber = request.AdmissionNumber,
            DateOfBirth = request.DateOfBirth,
            EnrollmentDate = request.EnrollmentDate,
            ClassRoomId = request.ClassRoomId,
            GuardianName = request.GuardianName,
            GuardianPhone = request.GuardianPhone
        };

        _db.Users.Add(user);
        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        await _db.Entry(student).Reference(s => s.ClassRoom).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, ToResponse(student));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentResponse>> Update(Guid id, UpdateStudentRequest request)
    {
        var student = await _db.Students.Include(s => s.User).Include(s => s.ClassRoom)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound();

        student.User.FirstName = request.FirstName;
        student.User.LastName = request.LastName;
        student.AdmissionNumber = request.AdmissionNumber;
        student.DateOfBirth = request.DateOfBirth;
        student.ClassRoomId = request.ClassRoomId;
        student.GuardianName = request.GuardianName;
        student.GuardianPhone = request.GuardianPhone;

        await _db.SaveChangesAsync();
        await _db.Entry(student).Reference(s => s.ClassRoom).LoadAsync();
        return Ok(ToResponse(student));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var student = await _db.Students.Include(s => s.User).SingleOrDefaultAsync(s => s.Id == id);
        if (student is null) return NotFound();

        _db.Users.Remove(student.User);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
