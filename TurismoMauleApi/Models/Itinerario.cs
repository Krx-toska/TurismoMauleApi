namespace TurismoMauleApi.Models
{
    public class Itinerario
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
        public ICollection<Bloque> Bloques { get; set; } = new List<Bloque>();
    }
}
