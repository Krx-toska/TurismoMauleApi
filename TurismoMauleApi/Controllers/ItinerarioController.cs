using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;
using TurismoMauleApi.Models;

namespace TurismoMauleApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItinerarioController : ControllerBase
    {
        private readonly TurismoContext _context;

        public ItinerarioController(TurismoContext context)
        {
            _context = context;
        }

        // GET: api/Itinerario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Itinerario>>> GetItinerarios()
        {
            return await _context.Itinerarios
                .Include(i => i.Bloques)
                .Include(i => i.Usuario)
                .ToListAsync();
        }

        // GET: api/Itinerario/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Itinerario>> GetItinerario(int id)
        {
            var itinerario = await _context.Itinerarios
                .Include(i => i.Bloques)
                .Include(i => i.Usuario)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (itinerario == null) return NotFound();
            return itinerario;
        }

        // POST: api/Itinerario
        [HttpPost]
        public async Task<ActionResult<Itinerario>> CreateItinerario(Itinerario itinerario)
        {
            _context.Itinerarios.Add(itinerario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetItinerario), new { id = itinerario.Id }, itinerario);
        }

        // PUT: api/Itinerario/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItinerario(int id, Itinerario itinerario)
        {
            if (id != itinerario.Id) return BadRequest();

            _context.Entry(itinerario).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Itinerarios.Any(e => e.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE: api/Itinerario/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItinerario(int id)
        {
            var itinerario = await _context.Itinerarios.FindAsync(id);
            if (itinerario == null) return NotFound();

            _context.Itinerarios.Remove(itinerario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
