namespace Acadex.Api.Models;

public class Grade
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public decimal Score { get; set; }
    public string? Comments { get; set; }
}
