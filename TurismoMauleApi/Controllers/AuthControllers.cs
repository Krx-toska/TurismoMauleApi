using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using TurismoMauleApi.Data;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TurismoContext _context;
    private readonly JwtService _jwtService = new JwtService();

    public AuthController(TurismoContext context) => _context = context;

    [HttpPost("register")]
    public IActionResult Register([FromBody] Usuario usuario)
    {
        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(usuario.PasswordHash);
        _context.Usuarios.Add(usuario);
        _context.SaveChanges();
        return Ok(new { message = "Usuario registrado" });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] Usuario login)
    {
        var user = _context.Usuarios.FirstOrDefault(u => u.Email == login.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(login.PasswordHash, user.PasswordHash))
            return Unauthorized();

        var jwt = _jwtService.Generate(user.Id);
        return Ok(new { token = jwt, userId = user.Id, nombre = user.Nombre });
    }
}

