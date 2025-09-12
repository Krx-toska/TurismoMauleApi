using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Models;
using TurismoMauleApi.Data;
using TurismoMauleApi.Helpers;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TurismoMauleApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TurismoContext _context;
        private readonly IConfiguration _config;

        public AuthController(TurismoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Usuario usuario)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == usuario.Email))
                return BadRequest(new { message = "El email ya está en uso" });

            usuario.PasswordHash = PasswordHelper.HashPassword(usuario.PasswordHash);
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(usuario);
            return Ok(new { token, userId = usuario.Id, nombre = usuario.Nombre });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Usuario usuario)
        {
            var dbUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == usuario.Email);
            if (dbUser == null || PasswordHelper.HashPassword(usuario.PasswordHash) != dbUser.PasswordHash)
                return Unauthorized(new { message = "Credenciales incorrectas" });

            var token = GenerateJwtToken(dbUser);
            return Ok(new { token, userId = dbUser.Id, nombre = dbUser.Nombre });
        }

        private string GenerateJwtToken(Usuario user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("id", user.Id.ToString()),
                new Claim("nombre", user.Nombre),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
