namespace Acadex.Api.Models;

public class Teacher
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string EmployeeNumber { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string? PhoneNumber { get; set; }

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public ICollection<ClassRoom> HomeroomClasses { get; set; } = new List<ClassRoom>();
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
}
