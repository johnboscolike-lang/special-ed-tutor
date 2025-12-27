
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

export interface PastQuestionExample {
  year: string;
  questionText: string;
  keyPoint: string;
}

export interface FuturePrediction {
  theme: string;
  prediction: string;
  studyGuide: string;
}

export interface EvolutionSummaryItem {
  period: string;
  questionStyle: string;
  keyFocus: string;
}

export interface ComprehensiveAnalysisResponse {
  singleQuestionAnalysis: {
    evaluationArea: string;
    trapNotice: string;
    evidenceMapping: { cue: string; interpretation: string }[];
    strategy: { step: string; title: string; description: string }[];
    optionsReview: { option: string; isCorrect: boolean; reason: string; errorType?: string }[];
    finalAnswer: { answer: string; confidenceReason: string };
    studyGuide: { rote: string[]; nonRote: string[] };
    transferTips: string[];
    checklist: string[];
  };
  conceptHistoricalAnalysis: {
    coreConcept: {
      title: string;
      description: string;
    };
    historicalTrend: string;
    pastExamples: PastQuestionExample[];
    futurePrediction: {
      introduction: string;
      predictions: FuturePrediction[];
    };
    summaryTable: EvolutionSummaryItem[];
  };
  practiceProblems: {
    variation: { title: string; question: string; instructions: string };
    nextStep: { title: string; question: string; instructions: string };
    factCheck: { question: string; answer: boolean; explanation: string }[];
  };
}


@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;

  private readonly SYSTEM_PROMPT = `
    당신은 특수교사 임용 합격 전략 튜터입니다.
    사용자의 요청에 따라 [장애 특성 분석 - 법적 근거 확인 - 교육적 중재 설계]의 전문적 사고 과정을 보여주어야 합니다.
    2002년부터 현재까지의 유아/초등/중등 특수교육 임용 기출문제를 모두 학습하였으며, 이를 바탕으로 분석합니다.

    사용자가 기출문제 이미지를 업로드하면, 다음 3가지 파트로 구성된 정밀 분석 보고서를 JSON 형식으로 작성하십시오.

    **[작성 원칙]**
    1. **현장성**: '학생의 교육적 요구'를 최우선으로 고려하십시오.
    2. **정확성**: 특수교육법 및 국가수준 교육과정 공식 용어를 사용하십시오.
    3. **통합성**: 기출 분석 시 유아(유특), 초등(초특), 중등(중특)을 아우르는 통찰을 제공하십시오.

    **[JSON 응답 형식]**
    반드시 아래 JSON 형식을 준수해야 합니다. 마크다운 코드블록(json) 없이 순수 JSON만 반환하거나, 코드블록 안에 있어도 됩니다.

    {
      "singleQuestionAnalysis": {
        "evaluationArea": "[출제기준안]에 근거한 평가 영역 및 내용 요소 (예: 자폐성장애 교육 - 긍정적 행동 지원)",
        "trapNotice": "수험생들이 흔히 범하는 오개념, 함정, 법적 용어 혼동 주의점 (1문장)",
        "evidenceMapping": [
          { "cue": "문제/자료 내 핵심 단서 (학생의 행동, 교사의 발문, 검사 수치 등)", "interpretation": "특수교육적 해석 및 관련 이론/법령 근거" }
        ],
        "strategy": [
          { "step": "Step 1", "title": "사전 확인", "description": "가장 먼저 확인해야 할 장애 특성이나 법적 절차 (Why 포함)" },
          { "step": "Step 2", "title": "중재/설계", "description": "적용할 교수적 수정, AAC, 중재 전략 (Why 포함)" },
          { "step": "Step 3", "title": "최종 판정", "description": "정답 도출을 위한 결정적 규칙 (Why 포함)" }
        ],
        "optionsReview": [
          { "option": "선지 또는 답안 요소", "isCorrect": true, "reason": "법적/이론적 타당성 근거", "errorType": "흔한 오해나 절차적 오류 지적" }
        ],
        "finalAnswer": { "answer": "최종 정답 (서술형인 경우 모범 답안)", "confidenceReason": "학생 특성과 법적 근거를 결합한 확신 이유 (1줄)" },
        "studyGuide": {
          "rote": ["암기 카드: 법 조항, 검사 도구 명칭, 장애 정의 등 (문제 적용 사례 포함)"],
          "nonRote": ["이해 노트: 교수적 수정 원리, 행동 중재 논리 흐름 등 (문제 적용 사례 포함)"]
        },
        "transferTips": ["다른 장애 영역이나 통합교육 상황에도 적용 가능한 재사용 규칙 3가지"],
        "checklist": ["시험장용 오답 방지 체크리스트 (예: IEP 위원 구성원을 빠뜨리지 않았는가?)"]
      },
      "conceptHistoricalAnalysis": {
        "coreConcept": {
          "title": "문항 관통 핵심 개념",
          "description": "핵심 개념에 대한 명확한 정의 및 설명"
        },
        "historicalTrend": "2002년부터 현재까지 해당 개념이 유아/초등/중등에서 어떻게 변형되어 출제되었는지 분석",
        "pastExamples": [
          {
            "year": "연도 표기 시 반드시 급별 병기 (예: '2022 (초특)', '2019 (유특)', '2015 (중특)'). 유아, 초등, 중등 기출을 모두 포함하여 폭넓게 제시할 것.",
            "questionText": "당시 기출 문제의 핵심 질문 내용",
            "keyPoint": "그 문제의 출제 의도 및 핵심 포인트"
          }
        ],
        "futurePrediction": {
          "introduction": "향후 출제 전망 도입부",
          "predictions": [
            { "theme": "예상 주제", "prediction": "구체적인 출제 방식 예측", "studyGuide": "대비 전략" }
          ]
        },
        "summaryTable": [
          { "period": "시기 (예: 태동기, 발전기)", "questionStyle": "질문 스타일", "keyFocus": "평가 초점" }
        ]
      },
      "practiceProblems": {
        "variation": { "title": "조건 변형 문제", "question": "문제 내용", "instructions": "작성 방법" },
        "nextStep": { "title": "심화/미출제 예상 문제", "question": "문제 내용", "instructions": "작성 방법" },
        "factCheck": [
          { "question": "O/X 퀴즈", "answer": true, "explanation": "해설" }
        ]
      }
    }
  `;

  constructor() {
    // [중요] 브라우저(Client-side) 환경에서는 process.env를 직접 사용할 수 없습니다.
    // 배포를 위해 아래 'YOUR_API_KEY' 부분에 실제 API 키를 입력해주세요.
    // 주의: GitHub 공용 저장소에 올릴 때는 키를 지우거나, 현명하게 관리해야 합니다.
    const API_KEY = 'YOUR_API_KEY';
    this.genAI = new GoogleGenAI({ apiKey: API_KEY });
  }

  async analyzeImage(imageBase64: string, userQuery: string = ''): Promise<ComprehensiveAnalysisResponse> {
    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                text: userQuery || "이 기출문제를 분석해줘."
              }
            ]
          }
        ],
        config: {
          systemInstruction: this.SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 8192
          }
        }
      });

      const text = response.text || '{}';
      try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText) as ComprehensiveAnalysisResponse;
      } catch (e) {
        console.error("JSON parse error", e, "Original text:", text);
        throw new Error("AI 응답을 처리하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}
