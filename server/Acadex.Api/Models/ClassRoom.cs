namespace Acadex.Api.Models;

public class ClassRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;

    public Guid? HomeroomTeacherId { get; set; }
    public Teacher? HomeroomTeacher { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
}
