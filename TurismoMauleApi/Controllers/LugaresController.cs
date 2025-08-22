using Microsoft.AspNetCore.Mvc;
using TurismoMauleApi.Data;

[Route("api/[controller]")]
[ApiController]
public class LugaresController : ControllerBase
{
    private readonly TurismoContext _context;
    public LugaresController(TurismoContext context) => _context = context;

    [HttpGet]
    public IActionResult GetLugares([FromQuery] string ciudad, [FromQuery] string categoria)
    {
        var query = _context.Lugares.AsQueryable();
        if (!string.IsNullOrEmpty(ciudad)) query = query.Where(l => l.Ciudad == ciudad);
        if (!string.IsNullOrEmpty(categoria)) query = query.Where(l => l.Categoria == categoria);
        return Ok(query.ToList());
    }
}
