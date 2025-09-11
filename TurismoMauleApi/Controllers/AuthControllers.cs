using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;
using BCrypt.Net;
using TurismoMauleApi.Services;

namespace TurismoMauleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TurismoContext _context;
        private readonly JwtService _jwtService;

        public AuthController(TurismoContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Usuario usuario)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == usuario.Email))
                return BadRequest(new { message = "El email ya está registrado." });

            // Hashear contraseña antes de guardar
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(usuario.PasswordHash);
            usuario.Role = "Turista";

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Generar token de autenticación
            var token = _jwtService.Generate(usuario.Id, usuario.Nombre);

            return Ok(new
            {
                usuario.Id,
                usuario.Nombre,
                usuario.Email,
                usuario.Role,
                Token = token
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Usuario loginData)
        {
            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == loginData.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginData.PasswordHash, user.PasswordHash))
                return Unauthorized(new { message = "Email o contraseña incorrectos" });

            var token = _jwtService.Generate(user.Id, user.Nombre);

            return Ok(new
            {
                user.Id,
                user.Nombre,
                user.Email,
                user.Role,
                Token = token
            });
        }
    }
}
