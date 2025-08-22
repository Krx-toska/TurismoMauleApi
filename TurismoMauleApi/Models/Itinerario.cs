namespace TurismoMauleApi.Data
{

    public class Itinerario
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
    public List<ItinerarioBloque> Bloques { get; set; }
}

public class ItinerarioBloque
{
    public int Id { get; set; }
    public string Bloque { get; set; } // desayuno, actividad1, almuerzo, etc.
    public int LugarId { get; set; }
    public string Hora { get; set; }
}
}
