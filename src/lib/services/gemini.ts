import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatContext } from '@/types';

/**
 * Gemini AI Service
 * Handles AI interactions using Google's Gemini API
 */
export class GeminiService {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize the Gemini client
   */
  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in environment variables');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Format context data into a structured prompt
   */
  private static formatContext(context: ChatContext): string {
    const { vehicles, owners, locations } = context;

    let contextText = '\n\n# AVAILABLE DATA\n\n';

    // Format Vehicles
    contextText += `## VEHICLES (Total: ${vehicles.length})\n\n`;
    if (vehicles.length > 0) {
      contextText += '| VIN | Make | Model | Year | Color | Status | Owner | Location | Customs Status | Import Duty |\n';
      contextText += '|-----|------|-------|------|-------|--------|-------|----------|----------------|-------------|\n';
      vehicles.forEach((v) => {
        contextText += `| ${v.vin} | ${v.make} | ${v.model} | ${v.year} | ${v.color} | ${v.status} | ${v.owner.name} | ${v.currentLocation.name}, ${v.currentLocation.city} | ${v.customsStatus} | $${v.importDuty} |\n`;
      });
      contextText += '\n';
    }

    // Format Owners
    contextText += `## OWNERS (Total: ${owners.length})\n\n`;
    if (owners.length > 0) {
      contextText += '| Name | Email | Phone | Nationality | ID Number | Vehicle Count |\n';
      contextText += '|------|-------|-------|-------------|-----------|---------------|\n';
      owners.forEach((o) => {
        contextText += `| ${o.name} | ${o.email} | ${o.phone} | ${o.nationality} | ${o.idNumber} | ${o.vehicleCount} |\n`;
      });
      contextText += '\n';
    }

    // Format Locations
    contextText += `## LOCATIONS (Total: ${locations.length})\n\n`;
    if (locations.length > 0) {
      contextText += '| Name | Type | Status | City | Country | Contact |\n';
      contextText += '|------|------|--------|------|---------|----------|\n';
      locations.forEach((l) => {
        contextText += `| ${l.name} | ${l.type} | ${l.status} | ${l.city} | ${l.country} | ${l.contactName || 'N/A'} |\n`;
      });
      contextText += '\n';
    }

    return contextText;
  }

  /**
   * Generate system prompt with guidelines
   */
  private static getSystemPrompt(context: ChatContext): string {
    const contextData = this.formatContext(context);

    return `You are a professional Fleet Management Assistant with access to real-time data about vehicles, owners, and locations.

Your responsibilities:
- Answer questions about vehicles, their status, and locations
- Provide information about vehicle owners and their properties
- Help track vehicles through the shipping and customs process
- Present data in clear, structured formats

${contextData}

# GUIDELINES

1. **Be Concise and Professional**: Provide clear, direct answers without unnecessary elaboration
2. **Use Structured Formats**: 
   - Use markdown tables for multiple records
   - Use bullet lists for single record details
   - Use numbered lists for sequential information
3. **Provide Specific Data**: Always reference actual data from the available information
4. **Handle Missing Data**: If information isn't available, clearly state that
5. **Be Helpful**: Suggest related information that might be useful
6. **Format Tables Properly**: Always include headers and use proper markdown table syntax

# RESPONSE FORMAT EXAMPLES

For multiple vehicles:
\`\`\`
Here are the vehicles matching your query:

| VIN | Make/Model | Year | Status | Owner | Location |
|-----|------------|------|--------|-------|----------|
| ABC123 | Toyota Camry | 2023 | In Transit | John Doe | Port of LA |
| XYZ789 | Honda Accord | 2024 | Delivered | Jane Smith | Miami Warehouse |
\`\`\`

For a single vehicle:
\`\`\`
**Vehicle Details:**
- VIN: ABC123456
- Make/Model: Toyota Camry 2023
- Status: In Transit
- Owner: John Doe (john@example.com)
- Current Location: Port of Los Angeles
- Customs Status: In Progress
- Estimated Delivery: 2024-03-15
\`\`\`

Now, please answer user questions based on this information.`;
  }

  /**
   * Send a message to Gemini and get a response
   */
  static async sendMessage(userMessage: string, context: ChatContext): Promise<string> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const systemPrompt = this.getSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\n# USER QUESTION\n\n${userMessage}`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error communicating with Gemini AI:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Test the Gemini API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

