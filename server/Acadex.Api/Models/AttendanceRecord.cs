namespace Acadex.Api.Models;

public class AttendanceRecord
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public Guid ClassRoomId { get; set; }
    public ClassRoom ClassRoom { get; set; } = null!;

    public DateTime Date { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Notes { get; set; }

    public Guid? RecordedByTeacherId { get; set; }
    public Teacher? RecordedByTeacher { get; set; }
}
