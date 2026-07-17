namespace Acadex.Api.Models;

public class Exam
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal MaxScore { get; set; }

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid ClassRoomId { get; set; }
    public ClassRoom ClassRoom { get; set; } = null!;

    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
}
