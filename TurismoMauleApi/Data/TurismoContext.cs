using Microsoft.EntityFrameworkCore;

namespace TurismoMauleApi.Data
{
    public class TurismoContext : DbContext
    {
        public TurismoContext(DbContextOptions<TurismoContext> options) : base(options) { }

        public DbSet<Lugar> Lugares { get; set; } = null!;
        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<Itinerario> Itinerarios { get; set; } = null!; // DbSet para itinerarios
    }
}
