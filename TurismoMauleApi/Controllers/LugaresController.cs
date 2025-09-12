using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Data;
using TurismoMauleApi.Models;

namespace TurismoMauleApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LugaresController : ControllerBase
    {
        private readonly TurismoContext _context;

        public LugaresController(TurismoContext context)
        {
            _context = context;
        }

        // GET: api/Lugares
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lugar>>> GetLugares()
        {
            return await _context.Lugares.ToListAsync();
        }

        // GET: api/Lugares/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Lugar>> GetLugar(int id)
        {
            var lugar = await _context.Lugares.FindAsync(id);
            if (lugar == null) return NotFound();
            return lugar;
        }

        // POST: api/Lugares
        [HttpPost]
        public async Task<ActionResult<Lugar>> CreateLugar(Lugar lugar)
        {
            _context.Lugares.Add(lugar);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLugar), new { id = lugar.Id }, lugar);
        }

        // PUT: api/Lugares/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLugar(int id, Lugar lugar)
        {
            if (id != lugar.Id) return BadRequest();

            _context.Entry(lugar).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Lugares.Any(e => e.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE: api/Lugares/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLugar(int id)
        {
            var lugar = await _context.Lugares.FindAsync(id);
            if (lugar == null) return NotFound();

            _context.Lugares.Remove(lugar);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
