namespace TurismoMauleApi.Data
{
    public class Itinerario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string Descripcion { get; set; } = "";
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;
    }
}
