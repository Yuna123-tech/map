/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 부산 관광지 카테고리 타입 (제공 코드에 맞춤)
export type CategoryKey = 'food' | 'traffic' | 'play' | 'history' | 'beach';

export interface CategoryInfo {
  key: CategoryKey;
  name: string;
  shortName?: string; // Optional short label for mobile displays
  emoji: string;
  color: string; // Tailwind class
  bgColor: string; // bg & border classes
  borderColor: string;
  description: string;
  stamp: string; // Cute icon stamp for children
}

// 부산 관광지 스팟 인터페이스
export interface BusanSpot {
  id: string;
  name: string;
  category: CategoryKey;
  district: string; // 구 단위 (해운대구, 사하구, 동구 등)
  description: string;
  mapX: number; // 서쪽(0) ~ 동쪽(100)
  mapY: number; // 북쪽(0) ~ 남쪽(100)
  address?: string; // 주소 (선택사항)
  icon?: string; // 이모지 아이콘
  funFact?: string; // 초등학교 4학년 맞춤 상식
  theme?: string; // 테마 구분
  quiz?: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

// 학생 발표 내용 상태
export interface PresentationState {
  themeName: string; // 발표 주제 (예: '맛있는 부산', '바다의 도시 부산')
  selectedCategory: CategoryKey; // 선택한 강조 카테고리
  reasonType: 'most' | 'least' | 'mobility' | 'beach_cluster'; // 발표 논리 유형
  selectedSpotIds: string[]; // 코스로 소개할 스팟 목록
  speechDraft: string; // 초등학생 발표 대본
  teamName: string; // 모둠 이름
  selectedRegion?: RegionKey; // 모둠이 선택한 조사 구역 추가
}

// 퀴즈 진행 피드백 상태
export interface QuizState {
  [spotId: string]: {
    solved: boolean;
    isCorrect: boolean;
    selectedOption: number;
  };
}

export type RegionKey = 'all' | 'north' | 'west' | 'south' | 'haeundae' | 'dongnae' | 'gijang_suyeong';

export interface RegionInfo {
  key: RegionKey;
  name: string;
  emoji: string;
  description: string;
  districts: string[];
}

