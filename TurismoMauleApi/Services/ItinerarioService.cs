namespace TurismoMauleApi.Services
{
    public class ItinerarioService
    {
        // Método simulado que genera itinerarios predefinidos
        public string GenerarItinerarioSimulado(string ciudad, string intereses)
        {
            // Ejemplos simples para Curicó y Talca
            if (ciudad.ToLower() == "curicó")
            {
                return "Itinerario para Curicó:\n" +
                       "1. Desayuno en Café Plaza.\n" +
                       "2. Visita a la Plaza de Armas.\n" +
                       "3. Tour por Viña Miguel Torres.\n" +
                       "4. Almuerzo en Restaurante Tradicional.\n" +
                       "5. Caminata en Lago Vichuquén.\n" +
                       "6. Cena en restaurante local y paseo nocturno por la ciudad.";
            }
            else if (ciudad.ToLower() == "talca")
            {
                return "Itinerario para Talca:\n" +
                       "1. Desayuno en Pastelería Talca.\n" +
                       "2. Visita al Museo O'Higginiano.\n" +
                       "3. Almuerzo en Restaurante Río Claro.\n" +
                       "4. Paseo por Río Claro.\n" +
                       "5. Cena en centro histórico y paseo nocturno.";
            }
            else
            {
                return $"Itinerario para {ciudad} no disponible, muestra ejemplos de otra ciudad.";
            }
        }
    }
}


