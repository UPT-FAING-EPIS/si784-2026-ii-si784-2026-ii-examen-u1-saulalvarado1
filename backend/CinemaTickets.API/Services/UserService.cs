using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto?> GetUserByIdAsync(int id);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto dto);
    Task<UserResponseDto?> GetUserByEmailAsync(string email);
}

public class UserService : IUserService
{
    private readonly CinemaDbContext _context;

    public UserService(CinemaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Name)
            .Select(u => new UserResponseDto(u.Id, u.Name, u.Email, u.Phone, u.DocumentId, u.CreatedAt))
            .ToListAsync();
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(int id)
    {
        var u = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (u == null) return null;

        return new UserResponseDto(u.Id, u.Name, u.Email, u.Phone, u.DocumentId, u.CreatedAt);
    }

    public async Task<UserResponseDto?> GetUserByEmailAsync(string email)
    {
        var u = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
        if (u == null) return null;

        return new UserResponseDto(u.Id, u.Name, u.Email, u.Phone, u.DocumentId, u.CreatedAt);
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (existing != null)
        {
            return new UserResponseDto(existing.Id, existing.Name, existing.Email, existing.Phone, existing.DocumentId, existing.CreatedAt);
        }

        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone?.Trim() ?? string.Empty,
            DocumentId = dto.DocumentId?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserResponseDto(user.Id, user.Name, user.Email, user.Phone, user.DocumentId, user.CreatedAt);
    }
}
