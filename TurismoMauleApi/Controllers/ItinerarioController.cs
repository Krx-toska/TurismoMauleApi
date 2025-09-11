using Microsoft.AspNetCore.Mvc;
using TurismoMauleApi.Data;
using Microsoft.AspNetCore.Authorization;
using System.Linq;

namespace TurismoMauleApi.Data
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItinerarioController : ControllerBase
    {
        private readonly TurismoContext _context;

        public ItinerarioController(TurismoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetItinerarios()
        {
            var itinerarios = _context.Itinerarios.ToList();
            return Ok(itinerarios);
        }

        [HttpPost]
        [Authorize] // Solo usuarios loggeados pueden guardar
        public IActionResult CrearItinerario([FromBody] Itinerario itinerario)
        {
            var userId = int.Parse(User.Identity.Name); // El token debe guardar userId como Name
            itinerario.UsuarioId = userId;

            _context.Itinerarios.Add(itinerario);
            _context.SaveChanges();
            return Ok(itinerario);
        }
    }
}
