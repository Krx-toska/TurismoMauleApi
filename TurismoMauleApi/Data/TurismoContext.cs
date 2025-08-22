using Microsoft.EntityFrameworkCore;

namespace TurismoMauleApi.Data
{
    public class TurismoContext : DbContext
    {
        public TurismoContext(DbContextOptions<TurismoContext> options) : base(options) { }

        // Tablas de la base de datos
        public DbSet<Lugar> Lugares { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Itinerario> Itinerarios { get; set; }
        public DbSet<ItinerarioBloque> ItinerarioBloques { get; set; }
    }
}
