using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TurismoMauleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GPTController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public GPTController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("atractivos")]
        public async Task<IActionResult> GetAtractivos([FromBody] CiudadRequest request)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "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");

                var body = new
                {
                    model = "gpt-4.1-mini",
                    input = $"Dame 5 atractivos turísticos de la ciudad de {request.Ciudad} en la Región del Maule, Chile. Para cada atractivo dame un título, descripción corta y URL de imagen. Devuelve en JSON: nombre, descripcion, imagen."
                };

                var response = await client.PostAsync(
                    "https://api.openai.com/v1/responses",
                    new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
                );

                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();

                return Ok(json);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class CiudadRequest
    {
        public string Ciudad { get; set; } = null!;
    }
}
