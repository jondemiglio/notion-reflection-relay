const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/reflect', async (req, res) => {
  const { participant, reflection, poi } = req.body;

  if (!participant || !reflection || !poi) {
    return res.status(400).json({ error: 'Missing participant, reflection, or poi' });
  }

  try {
    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
        },
        properties: {
          Participant: {
            title: [
              {
                text: { content: participant },
              },
            ],
          },
          Reflection: {
            rich_text: [
              {
                text: { content: reflection },
              },
            ],
          },
          POI: {
            rich_text: [
              {
                text: { content: poi },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ success: true, notionResponse: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send to Notion', details: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Relay listening on port ${PORT}`));
