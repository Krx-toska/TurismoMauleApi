namespace TurismoMauleApi.Models
{
    public class Bloque
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Categoria { get; set; } = null!;
        public string Hora { get; set; } = null!;
        public int ItinerarioId { get; set; }
        public Itinerario Itinerario { get; set; } = null!;
    }
}
