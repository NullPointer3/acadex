using Acadex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Acadex.Api.Data;

public class AcadexDbContext : DbContext
{
    public AcadexDbContext(DbContextOptions<AcadexDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<ClassRoom> ClassRooms => Set<ClassRoom>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<TeacherSubject> TeacherSubjects => Set<TeacherSubject>();
    public DbSet<TimetableEntry> TimetableEntries => Set<TimetableEntry>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Grade> Grades => Set<Grade>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Teacher>(e =>
        {
            e.HasOne(t => t.User)
                .WithOne(u => u.Teacher)
                .HasForeignKey<Teacher>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(t => t.EmployeeNumber).IsUnique();
        });

        modelBuilder.Entity<Student>(e =>
        {
            e.HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(s => s.AdmissionNumber).IsUnique();

            e.HasOne(s => s.ClassRoom)
                .WithMany(c => c.Students)
                .HasForeignKey(s => s.ClassRoomId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ClassRoom>(e =>
        {
            e.HasOne(c => c.HomeroomTeacher)
                .WithMany(t => t.HomeroomClasses)
                .HasForeignKey(c => c.HomeroomTeacherId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Subject>(e =>
        {
            e.HasIndex(s => s.Code).IsUnique();
        });

        modelBuilder.Entity<TeacherSubject>(e =>
        {
            e.HasKey(ts => new { ts.TeacherId, ts.SubjectId });
            e.HasOne(ts => ts.Teacher)
                .WithMany(t => t.TeacherSubjects)
                .HasForeignKey(ts => ts.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ts => ts.Subject)
                .WithMany(s => s.TeacherSubjects)
                .HasForeignKey(ts => ts.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TimetableEntry>(e =>
        {
            e.Property(t => t.DayOfWeek).HasConversion<string>();

            e.HasOne(t => t.ClassRoom)
                .WithMany(c => c.TimetableEntries)
                .HasForeignKey(t => t.ClassRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(t => t.Subject)
                .WithMany(s => s.TimetableEntries)
                .HasForeignKey(t => t.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(t => t.Teacher)
                .WithMany(te => te.TimetableEntries)
                .HasForeignKey(t => t.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AttendanceRecord>(e =>
        {
            e.Property(a => a.Status).HasConversion<string>();

            e.HasOne(a => a.Student)
                .WithMany(s => s.AttendanceRecords)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.ClassRoom)
                .WithMany()
                .HasForeignKey(a => a.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(a => a.RecordedByTeacher)
                .WithMany()
                .HasForeignKey(a => a.RecordedByTeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(a => new { a.StudentId, a.Date }).IsUnique();
        });

        modelBuilder.Entity<Exam>(e =>
        {
            e.Property(x => x.MaxScore).HasPrecision(6, 2);

            e.HasOne(x => x.Subject)
                .WithMany(s => s.Exams)
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.ClassRoom)
                .WithMany()
                .HasForeignKey(x => x.ClassRoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Grade>(e =>
        {
            e.Property(g => g.Score).HasPrecision(6, 2);

            e.HasOne(g => g.Student)
                .WithMany(s => s.Grades)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(g => g.Exam)
                .WithMany(x => x.Grades)
                .HasForeignKey(g => g.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(g => new { g.StudentId, g.ExamId }).IsUnique();
        });
    }
}
