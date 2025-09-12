namespace TurismoMauleApi.Models
{
    public class Lugar
    {
        public int Id { get; set; } 
        public string Nombre { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public double Calificacion { get; set; }
        public string Horario { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string Imagen { get; set; } = string.Empty;
        public bool Nocturno { get; set; } 
    }
}
