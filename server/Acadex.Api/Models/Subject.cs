namespace Acadex.Api.Models;

public class Subject
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;

    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public ICollection<TimetableEntry> TimetableEntries { get; set; } = new List<TimetableEntry>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
