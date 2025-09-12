using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;
using TurismoMauleApi.Models;
using TurismoMauleApi.Helpers;
using Microsoft.AspNetCore.Http;
using TurismoMauleApi.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TurismoMauleApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TurismoContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(TurismoContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ============================== Registro
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email y contraseña son requeridos" });

            if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "El email ya está en uso" });

            var usuario = new Usuario
            {
                Nombre = string.IsNullOrWhiteSpace(request.Nombre) ? "Usuario" : request.Nombre,
                Email = request.Email,
                Role = string.IsNullOrEmpty(request.Role) ? "Turista" : request.Role,
                PasswordHash = PasswordHelper.HashPassword(request.Password)
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = PasswordHelper.GenerateJwtToken(usuario, _configuration);

            Response.Cookies.Append("jwtToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(24)
            });

            return Ok(new { userId = usuario.Id, nombre = usuario.Nombre, role = usuario.Role });
        }

        // ============================== Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email y contraseña son requeridos" });

            var dbUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (dbUser == null)
                Console.WriteLine("hola");
            if (!PasswordHelper.VerifyPassword(request.Password, dbUser.PasswordHash))
            {
                Console.WriteLine(dbUser.PasswordHash);
                Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(request.Password));
            }

            if (dbUser == null || !PasswordHelper.VerifyPassword(request.Password, dbUser.PasswordHash))
                return Unauthorized(new { message = "Credenciales incorrectas" });
                
            var token = PasswordHelper.GenerateJwtToken(dbUser, _configuration);

            Response.Cookies.Append("jwtToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Cambiar a true en producción con HTTPS
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(24)
            });

            return Ok(new { userId = dbUser.Id, nombre = dbUser.Nombre, role = dbUser.Role });
        }

        // ============================== Obtener info del usuario logueado
        [HttpGet("me")]
        public IActionResult Me()
        {
            var token = Request.Cookies["jwtToken"];
            if (string.IsNullOrEmpty(token)) return Unauthorized();

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);

                var name = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                var id = jwt.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
                var role = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value ?? "Turista";

                return Ok(new { nombre = name, userId = id, role });
            }
            catch
            {
                return Unauthorized();
            }
        }

        // ============================== Logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwtToken");
            return Ok(new { message = "Sesión cerrada" });
        }
    }
}
