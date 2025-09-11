using Microsoft.AspNetCore.Mvc;

namespace TurismoMauleApi.Data
{
    public class AppDbContext : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
