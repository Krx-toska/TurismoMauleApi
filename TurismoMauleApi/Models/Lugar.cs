namespace TurismoMauleApi.Data
{

    public class Lugar
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public string Ciudad { get; set; }
    public string Categoria { get; set; } // comida, cafe, cultura, paisajes, hospedaje
    public double Calificacion { get; set; }
    public string Horario { get; set; }
    public string Detalle { get; set; }
    public string Direccion { get; set; }
    public string Imagen { get; set; }
    public bool Nocturno { get; set; } = false;
}
}
