import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface PatientRiskScore {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  summary: string;
}

export async function calculatePatientRisk(patientData: any): Promise<PatientRiskScore> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this patient's medical summary and calculate a risk score (0-100) for preventative health. 100 is highest risk.
      Patient Data: ${JSON.stringify(patientData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["score", "riskLevel", "recommendations", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as PatientRiskScore;
  } catch (error) {
    console.error("AI Scoring Error:", error);
    return {
      score: 0,
      riskLevel: 'LOW',
      recommendations: ["Self-monitoring recommended"],
      summary: "Score unavailable due to system limit. Defaulting to low risk."
    };
  }
}
