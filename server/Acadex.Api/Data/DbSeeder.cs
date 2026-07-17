using Acadex.Api.Models;
using Acadex.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Acadex.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AcadexDbContext db, IPasswordHasher passwordHasher, IConfiguration configuration)
    {
        if (await db.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            return;
        }

        var adminEmail = configuration["Seed:AdminEmail"] ?? "admin@acadex.local";
        var adminPassword = configuration["Seed:AdminPassword"] ?? "Admin123!";

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Email = adminEmail.ToLower(),
            PasswordHash = passwordHasher.Hash(adminPassword),
            FirstName = "Acadex",
            LastName = "Admin",
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
