namespace Acadex.Api.Models;

public class Student
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string AdmissionNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public string? GuardianName { get; set; }
    public string? GuardianPhone { get; set; }

    public Guid? ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
}
