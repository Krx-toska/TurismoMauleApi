import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Ruta para obtener atractivos turísticos
app.post("/api/atractivos", async (req, res) => {
    const { ciudad } = req.body;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: `Dame 5 atractivos turísticos de la ciudad de ${ciudad}, en la Región del Maule, Chile. 
        Para cada atractivo entrega un título, una descripción corta y una sugerencia de imagen (puede ser genérica o relacionada). 
        Devuélvelo en formato JSON con: nombre, descripcion, imagen.`,
            }),
        });

        const data = await response.json();

        res.json({ atractivos: JSON.parse(data.output[0].content[0].text) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error consultando API de OpenAI" });
    }
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
