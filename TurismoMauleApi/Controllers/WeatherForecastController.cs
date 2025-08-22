// Controllers/CiudadesController.cs
using Microsoft.AspNetCore.Mvc;

namespace TurismoMauleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CiudadesController : ControllerBase
    {
        // GET: api/ciudades
        [HttpGet]
        public IActionResult GetCiudades()
        {
            var ciudades = new List<string> { "Curic�", "Talca", "Constituci�n", "Linares" };
            return Ok(ciudades);
        }
    }
}
