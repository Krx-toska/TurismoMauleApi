namespace TurismoMauleApi.Data
{
    public class Bloque
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Categoria { get; set; }
        public string Hora { get; set; }

        public int ItinerarioId { get; set; }
        public Itinerario Itinerario { get; set; }
    }
}
