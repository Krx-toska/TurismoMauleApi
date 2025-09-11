using Microsoft.EntityFrameworkCore;
using TurismoMauleApi.Services;
using TurismoMauleApi.Data; // <--- para TurismoContext


var builder = WebApplication.CreateBuilder(args);

// 🔹 Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 🔹 Configurar conexión a SQL Server con EF Core
builder.Services.AddDbContext<TurismoContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 Agregar controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 Servicios personalizados
builder.Services.AddSingleton<ItinerarioService>();

var app = builder.Build();

// 🔹 Configurar middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseStaticFiles();
app.UseCors("AllowAll"); // Activar CORS
app.MapControllers();

// 🔹 Seeder de lugares de prueba
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TurismoContext>();

    try
    {
        if (!context.Lugares.Any())
        {
            context.Lugares.AddRange(
                new Lugar { Nombre = "Café Central", Ciudad = "Curicó", Categoria = "cafe", Calificacion = 4.5, Horario = "08:00-20:00", Direccion = "Av. Principal 123", Imagen = "", Nocturno = false },
                new Lugar { Nombre = "Museo de Curicó", Ciudad = "Curicó", Categoria = "cultura", Calificacion = 4.8, Horario = "10:00-18:00", Direccion = "Calle Museo 1", Imagen = "", Nocturno = false },
                new Lugar { Nombre = "Parque Río Claro", Ciudad = "Curicó", Categoria = "Naturaleza", Calificacion = 4.7, Horario = "08:00-19:00", Direccion = "Ruta 5 Sur", Imagen = "", Nocturno = false },
                new Lugar { Nombre = "Hostal Los Andes", Ciudad = "Curicó", Categoria = "hospedaje", Calificacion = 4.2, Horario = "", Direccion = "Calle Hostal 7", Imagen = "", Nocturno = false }
            );
            context.SaveChanges();
            Console.WriteLine("Lugares semilla creados.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error al inicializar lugares: " + ex.Message);
    }
}


app.Run();
