using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;

[Route("api/[controller]")]
[ApiController]
public class ItinerariosController : ControllerBase
{
    private readonly TurismoContext _context;
    public ItinerariosController(TurismoContext context) => _context = context;

    // Crear itinerario
    [HttpPost]
    public IActionResult CrearItinerario([FromBody] Itinerario itinerario)
    {
        _context.Itinerarios.Add(itinerario);
        _context.SaveChanges();
        return Ok(new { message = "Itinerario creado", id = itinerario.Id });
    }

    // Obtener itinerarios de un usuario
    [HttpGet("usuario/{usuarioId}")]
    public IActionResult GetMisItinerarios(int usuarioId)
    {
        var itinerarios = _context.Itinerarios
            .Include(i => i.Bloques)
            .Where(i => i.UsuarioId == usuarioId)
            .ToList();
        return Ok(itinerarios);
    }

    // Editar itinerario
    [HttpPut("{id}")]
    public IActionResult EditarItinerario(int id, [FromBody] Itinerario updated)
    {
        var itin = _context.Itinerarios
            .Include(i => i.Bloques)
            .FirstOrDefault(i => i.Id == id);
        if (itin == null) return NotFound();

        // Actualizamos nombre y bloques
        itin.Nombre = updated.Nombre;
        itin.Bloques = updated.Bloques;
        _context.SaveChanges();
        return Ok(itin);
    }

    // Eliminar itinerario
    [HttpDelete("{id}")]
    public IActionResult EliminarItinerario(int id)
    {
        var itin = _context.Itinerarios.Find(id);
        if (itin == null) return NotFound();
        _context.Itinerarios.Remove(itin);
        _context.SaveChanges();
        return Ok(new { message = "Itinerario eliminado" });
    }
}
