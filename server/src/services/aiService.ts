import logger from '../utils/logger';

export interface StorageSuggestion {
  storageLocation: string;
  storageTemp: string;
  handlingNotes: string;
  shelfLife: string;
  reasoning: string;
}

export interface ReagentInfo {
  name: string;
  vendor?: string;
  catalogNumber?: string;
  category?: string;
}

export class AIService {
  private apiKey: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('ANTHROPIC_API_KEY not set. AI features will be limited.');
    }
  }

  async generateStorageSuggestions(reagentInfo: ReagentInfo): Promise<StorageSuggestion> {
    if (!this.apiKey) {
      return this.getFallbackSuggestion(reagentInfo);
    }

    try {
      const prompt = `You are a laboratory safety and storage expert. Based on the following reagent information, provide optimal storage recommendations for a biology research laboratory.

Reagent Information:
- Name: ${reagentInfo.name}
- Vendor: ${reagentInfo.vendor || 'Unknown'}
- Catalog Number: ${reagentInfo.catalogNumber || 'Unknown'}
- Category: ${reagentInfo.category || 'Unknown'}

Please provide:
1. Optimal storage location (e.g., "Freezer Box 3, Shelf A" or "Cold Room, Shelf 2" or "RT Cabinet, Drawer 5")
2. Storage temperature (e.g., "-80°C", "-20°C", "4°C", "Room Temperature")
3. Handling notes (e.g., "Light sensitive", "Keep dry", "Use in fume hood", "Flammable")
4. Expected shelf life (e.g., "6 months at -20°C", "1 year unopened", "Use within 2 weeks after opening")

Respond in JSON format:
{
  "storageLocation": "specific location recommendation",
  "storageTemp": "temperature",
  "handlingNotes": "safety and handling notes",
  "shelfLife": "expected shelf life",
  "reasoning": "brief explanation for these recommendations"
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        logger.error(`AI API error: ${response.status} ${response.statusText}`);
        return this.getFallbackSuggestion(reagentInfo);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        return suggestion;
      }

      return this.getFallbackSuggestion(reagentInfo);
    } catch (error) {
      logger.error('AI service error:', error);
      return this.getFallbackSuggestion(reagentInfo);
    }
  }

  private getFallbackSuggestion(reagentInfo: ReagentInfo): StorageSuggestion {
    // Basic heuristics for common reagent types
    const name = reagentInfo.name.toLowerCase();

    let storageTemp = 'Room Temperature';
    let storageLocation = 'General Storage, Shelf 1';
    let handlingNotes = 'Follow standard laboratory safety protocols';
    let shelfLife = '1 year unopened';

    if (name.includes('enzyme') || name.includes('antibody') || name.includes('protein')) {
      storageTemp = '-20°C';
      storageLocation = 'Freezer Box 1, Position A1';
      handlingNotes = 'Avoid freeze-thaw cycles. Aliquot if needed.';
      shelfLife = '1-2 years at -20°C';
    } else if (name.includes('dna') || name.includes('rna') || name.includes('oligo')) {
      storageTemp = '-20°C';
      storageLocation = 'Freezer Box 2, Position A1';
      handlingNotes = 'Keep frozen. Store in TE buffer or water.';
      shelfLife = '1 year at -20°C';
    } else if (name.includes('cell') || name.includes('culture') || name.includes('media')) {
      storageTemp = '4°C';
      storageLocation = 'Cold Room, Shelf 2';
      handlingNotes = 'Keep refrigerated. Check for contamination before use.';
      shelfLife = '6 months refrigerated';
    } else if (name.includes('solvent') || name.includes('ethanol') || name.includes('methanol')) {
      storageTemp = 'Room Temperature';
      storageLocation = 'Flammables Cabinet';
      handlingNotes = 'Flammable. Store away from heat and ignition sources. Use in fume hood.';
      shelfLife = '2-3 years';
    } else if (name.includes('acid') || name.includes('base') || name.includes('hcl') || name.includes('naoh')) {
      storageTemp = 'Room Temperature';
      storageLocation = 'Corrosives Cabinet';
      handlingNotes = 'Corrosive. Wear appropriate PPE. Store separately from incompatible chemicals.';
      shelfLife = '2-3 years';
    }

    return {
      storageLocation,
      storageTemp,
      handlingNotes,
      shelfLife,
      reasoning: 'Generated using basic heuristics. For precise recommendations, configure AI service.',
    };
  }

  async generateProjectInsights(projectData: any): Promise<string> {
    if (!this.apiKey) {
      return 'AI insights not available. Configure ANTHROPIC_API_KEY to enable intelligent project analysis.';
    }

    try {
      const prompt = `You are a research project management assistant. Analyze the following project data and provide brief insights on:
1. Progress assessment
2. Potential bottlenecks or concerns
3. Recommended next steps

Project Data:
${JSON.stringify(projectData, null, 2)}

Provide a concise analysis in 3-4 sentences.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        return 'Unable to generate insights at this time.';
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      logger.error('AI project insights error:', error);
      return 'Unable to generate insights at this time.';
    }
  }
}

export default new AIService();
