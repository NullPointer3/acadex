# Acadex

[![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-EF_Core-CC2927?logo=microsoftsqlserver&logoColor=white)](https://learn.microsoft.com/en-us/ef/core/)
[![Last commit](https://img.shields.io/github/last-commit/NullPointer3/acadex)](https://github.com/NullPointer3/acadex/commits/master)

A school management system for admins, teachers, and students — covering student/teacher records, class rosters, timetables, attendance, and grades.

## Stack

- **Backend:** ASP.NET Core 8 Web API, EF Core, SQL Server, JWT auth
- **Frontend:** React + TypeScript (Vite), Tailwind CSS, React Router

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- A SQL Server instance (LocalDB, Express, or full SQL Server)

## Backend setup

```
cd server/Acadex.Api
dotnet user-secrets set "Jwt:Key" "<a long random string>"
dotnet ef database update
dotnet run
```

The connection string in `appsettings.json` points at `Server=.\MSSQLSERVER01;...` — update `ConnectionStrings:DefaultConnection` to match your local SQL Server instance name.

On first run, the API seeds an admin account:

- Email: `admin@acadex.local`
- Password: `Admin123!`

(Override via `Seed:AdminEmail` / `Seed:AdminPassword` in configuration.)

The API runs at `https://localhost:7026` (and `http://localhost:5277`).

## Frontend setup

```
cd client
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend.

## Roles

- **Admin** — manages teachers, students, classes, subjects, timetable; full read access.
- **Teacher** — manages attendance and grades for their classes; reads students/classes/timetable.
- **Student** — reads their own grades and attendance.

## Project layout

```
server/Acadex.Api   ASP.NET Core Web API (Controllers, Models, DTOs, Data, Services)
client               React + TypeScript SPA (src/api, src/pages, src/components, src/context)
```
