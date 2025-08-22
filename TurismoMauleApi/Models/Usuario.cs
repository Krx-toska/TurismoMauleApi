namespace TurismoMauleApi.Data { 
using System.ComponentModel.DataAnnotations;

public class Usuario
{
    public int Id { get; set; }
    [Required] public string Nombre { get; set; }
    [Required] public string Email { get; set; }
    [Required] public string PasswordHash { get; set; }
}
}
