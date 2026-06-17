/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusanSpot, CategoryInfo, RegionInfo, CategoryKey } from '../types';
import { northSpots } from './northSpots';
import { westSpots } from './westSpots';
import { southSpots } from './southSpots';
import { haeundaeSpots } from './haeundaeSpots';
import { dongnaeSpots } from './dongnaeSpots';
import { gijangSuyeongSpots } from './gijangSuyeongSpots';

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  food: { 
    key: 'food', 
    name: '🥢 탐미 미식 (먹거리)', 
    emoji: '🍕', 
    stamp: '🥢', 
    shortName: '미식', 
    color: 'text-rose-500', 
    bgColor: 'bg-rose-50', 
    borderColor: 'border-rose-100', 
    description: '부산의 대표적인 산해진미와 구수한 전통 먹거리들이 풍부하게 모인 맛집들이에요.' 
  },
  traffic: { 
    key: 'traffic', 
    name: '🚇 환경 인프라 (교통)', 
    emoji: '🚇', 
    stamp: '🚇', 
    shortName: '교통', 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-50', 
    borderColor: 'border-cyan-100', 
    description: '우리를 안전하고 신속하게 원거리로 태워주는 지하철, 공항, KTX 등의 대중교통들이에요.' 
  },
  play: { 
    key: 'play', 
    name: '🎡 체험 놀거리 (볼거리)', 
    emoji: '🎡', 
    stamp: '🎡', 
    shortName: '놀거리', 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-100', 
    description: '어려운 축제부터 랜드마크 체험과 볼거리를 신나게 탐험하는 구역이에요.' 
  },
  history: { 
    key: 'history', 
    name: '🏛️ 전통 역사 (배움터)', 
    emoji: '🏛️', 
    stamp: '🏛️', 
    shortName: '역사', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-100', 
    description: '피란 시절의 흔적과 고장의 역사 유적을 짚어가며 배우는 소중한 장소들이에요.' 
  },
  beach: { 
    key: 'beach', 
    name: '🏖️ 수평선 바다 (자연관광)', 
    emoji: '🏖️', 
    stamp: '🏖️', 
    shortName: '바다', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-100', 
    description: '모래사장과 몽돌 백사장이 드넓게 트여 바다 동식물 생태와 시원한 파도를 가꾸는 자연이에요.' 
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const rawPlacesData = [
  ...northSpots,
  ...westSpots,
  ...southSpots,
  ...haeundaeSpots,
  ...dongnaeSpots,
  ...gijangSuyeongSpots
];

export const REGIONS: Record<string, RegionInfo> = {
  all: {
    key: 'all',
    name: '부산광역시 전역 통합 조사',
    emoji: '🧭',
    description: '부산의 16개 구·군 전체에 넓게 펼쳐진 100% 리얼 명소를 골고루 탐색하고 분석해요! (가장 방대함)',
    districts: [
      '강서구', '북구', '사상구', '사하구', '금정구', '동래구', '연제구', '부산진구', 
      '서구', '동구', '중구', '영도구', '남구', '수영구', '해운대구', '기장군'
    ]
  },
  north: {
    key: 'north',
    name: '북부 구역 (생태&관문)',
    emoji: '🦆',
    description: '강서구, 북구, 사상구 지역으로 아름다운 생태 공원, 낙동강 자연 생태계, 그리고 부산의 소중한 하늘 관문인 김해국제공항이 모여 있습니다. 자연과 하늘길을 조사해 보아요!',
    districts: ['강서구', '북구', '사상구']
  },
  west: {
    key: 'west',
    name: '서부 구역 (노을&예술)',
    emoji: '🌅',
    description: '사하구, 서구 지역으로 다대포의 명물 노을빛 낙조, 송도 해수욕장 케이블카, 그리고 대저생태공원 및 어촌 체험거리들이 기품을 이룹니다. 바다 일몰과 서부산 풍광을 배워 보아요!',
    districts: ['사하구', '서구']
  },
  south: {
    key: 'south',
    name: '남부 구역 (역사&원도심)',
    emoji: '⚓',
    description: '중구, 동구, 영도구, 남구 지역으로 우뚝 솟은 부산타워, 피란 시절의 이야기를 품은 초량 168계단, 소막골목 유래, 자갈치시장 등 부산광역시 근현대 역사 탐험 구역입니다.',
    districts: ['중구', '동구', '영도구', '남구']
  },
  haeundae: {
    key: 'haeundae',
    name: '해운대 구역 (세계&관광)',
    emoji: '🏙️',
    description: '해운대구 중심 구역으로 시원하게 트인 모래사장 해수욕장, 참신한 해리단길 카페촌, 동해선 해변열차, 신비한 아쿠아리움이 모인 오션브릿지 관광 명소 구역입니다.',
    districts: ['해운대구']
  },
  dongnae: {
    key: 'dongnae',
    name: '동래 구역 (전통&교육)',
    emoji: '⛩️',
    description: '동래구, 금정구, 연제구, 부산진구 지역으로 유서 깊은 동래읍성, 고즈넉한 범어사, 가장 북적이는 서면역 환승거리, 온천천 벚꽃 산책길이 조화로운 역사 문화 배움 구역입니다.',
    districts: ['동래구', '금정구', '연제구', '부산진구']
  },
  gijang_suyeong: {
    key: 'gijang_suyeong',
    name: '기장·수영 구역 (자연&여가)',
    emoji: '⛵',
    description: '기장군, 수영구 지역으로 기장의 활기찬 대게 수산물 시장, 테마파크 롯데월드, 광안대교를 수놓는 멋진 드론쇼가 늘 숨쉬는 해양 레저 생태 구역입니다.',
    districts: ['기장군', '수영구']
  }
};

export const REGION_LIST = Object.values(REGIONS);

const QUIZ_PRESETS: Record<number, { funFact: string; question: string; options: string[]; answerIndex: number; explanation: string }> = {
  1: {
    funFact: "남천동 골목은 전국의 빵 애호가들이 순례하는 '빵천동'이라는 귀여운 별명으로 불려요!",
    question: "남천동 삼익비치 아파트 주변 빵천동 골목에서 가장 유명한 계절 꽃터널은 무엇일까요?",
    options: ["코스모스", "벚꽃", "해바라기", "튤립"],
    answerIndex: 1,
    explanation: "남천동은 봄이 되면 도로 좌우로 화려하게 피어나는 벚꽃길 터널과 골목 빵집들이 어우러져 매년 엄청난 힐링 인파를 끌어모읍니다."
  },
  4: {
    funFact: "이재모피자는 100% 자연산 임실치즈와 친환경 재료를 듬뿍 넣어 오직 맛과 정성으로 승부해요!",
    question: "남포동 이재모피자에서 치즈 크러스트 피자 도우 테두리 속에 가득 채우는 대표 치즈는 무엇일까요?",
    options: ["블루치즈", "모짜렐라 & 햄 또는 치즈", "체다 슬라이스", "카망베르"],
    answerIndex: 1,
    explanation: "이곳의 시그니처 도우인 치즈 크러스트 끝부분에는 쫄깃쫄깃하고 신선한 국산 모짜렐라 고급 치즈가 길쭉하게 들어있어 최고 인기입니다."
  },
  71: {
    funFact: "부산역 분수광장 앞에는 다양한 역사 전시물과 외국인 관광객을 위한 차이나타운(상해거리)이 바로 인접해 있어요!",
    question: "대한민국 서울과 부산을 시속 300km로 달려서 단 2시간 30분 만에 이어주는 고속철도의 이름은 무엇일까요?",
    options: ["새마을호", "무궁화호", "GTX", "KTX"],
    answerIndex: 3,
    explanation: "경부고속철도의 중심 관문인 KTX 덕분에 전국의 수많은 관광객들이 부산 바다와 문화를 하루 만에 신속하게 즐길 수 있게 되었습니다."
  },
  72: {
    funFact: "김해국제공항은 부산 강서구의 탁 트인 낙동강 평야 부근에 있으며, 외국인 관광객과 우리나라 사람들이 비행기로 하늘길을 오가는 멋진 대공항이에요!",
    question: "다른 나라나 아주 먼 지역에서 비행기를 타고 부산에 가려고 할 때, 안전하게 도착해서 내리는 하늘길과 교통의 소중한 문은 어디일까요?",
    options: ["가득 찬 주차장", "쾌적한 지하철역", "김해국제공항", "동해선 기찻길"],
    answerIndex: 2,
    explanation: "김해국제공항은 전 세계의 수많은 사람들과 멀리 사는 여행객들이 부산으로 비행기를 타고 간편하고 빠르게 방문할 수 있도록 완성된 하늘 문이랍니다!"
  },
  121: {
    funFact: "기장 오시리아 관광단지에 우뚝 솟은 롯데월드 부산은 완전한 야외 숲속 동화나라 컨셉이에요!",
    question: "롯데월드 어드벤처 부산의 마스코트 요정들이 살고 있으며 관람객에게 눈을 깜빡이며 직접 말을 건네는 나무의 이름은?",
    options: ["말하는 소나무", "토킹트리 (Talking Tree)", "노래하는 단풍나무", "소망 은행나무"],
    answerIndex: 1,
    explanation: "중앙 광장에 설치된 거대한 거목 토킹트리는 센서를 통해 아이들의 움직임을 감지하며 동화 같은 이야기를 직접 입을 움직여 말해줍니다."
  },
  236: {
    funFact: "해운대 해수욕장은 대한민국에서 가장 넓고 백사장이 잘 발달된 명품 해변이에요!",
    question: "매년 겨울, 해운대 해변 모래사장에서 차가운 얼음 바닷속으로 뛰어드는 세계적으로 이색적인 축제의 이름은 무엇일까요?",
    options: ["해운대 북극곰 축제", "갈매기 날갯짓 대회", "해양 윈드서핑 축제", "해운대 머드 올림픽"],
    answerIndex: 0,
    explanation: "매년 1월 차가운 날씨 속에 맨몸으로 건강한 기운을 내며 해운대 앞바다로 입수하는 '북극곰 수영축제'가 오랜 역사를 지녔습니다."
  },
  239: {
    funFact: "다대포 해수욕장은 바다와 낙동강 해가 만나는 넓은 모래 갯벌과 환성적인 다대포 낙조로 매우 신비로워요!",
    question: "다대포 백사장 입구 광장에 설치된, 최고 높이 55m로 밤하늘을 조명과 함께 쏘아 올리는 음악 분수의 예쁜 이름은?",
    options: ["은하수 분수", "꿈의 낙조분수", "바다 회오리분수", "인어공주 분수"],
    answerIndex: 1,
    explanation: "세계 최대 규모로 공인되었던 '꿈의 낙조분수'는 음악 장단과 오색 찬란한 레이저 조명에 맞춰 물줄기가 춤을 추는 대표 명소입니다."
  }
};

export const BUSAN_SPOTS: BusanSpot[] = rawPlacesData.map((place) => {
  const preset = QUIZ_PRESETS[place.id];
  
  const defaultQuiz = {
    question: `${place.name}은(는) 부산의 "${place.district}"에 자리잡고 있으며, 우리 고장의 빛나는 경제·지리적 소중한 명소 중 하나일까요?`,
    options: ["그렇다 (⭕)", "아니다 (❌)"],
    answerIndex: 0,
    explanation: `맞습니다! ${place.name}은(는) 실제 부산광역시 ${place.district}에 훌륭하게 자리 잡고 있어서 고장의 자랑거리이자 많은 이들이 탐험을 즐기는 핵심 장소입니다.`
  };

  const categoryPreset = CATEGORIES[place.category as CategoryKey] || CATEGORIES.food;

  return {
    id: `spot-${place.id}`,
    name: place.name,
    category: place.category as CategoryKey,
    district: place.district,
    description: place.desc,
    mapX: place.x,
    mapY: place.y,
    address: `부산광역시 ${place.district} 내 명소`,
    icon: place.icon,
    funFact: preset?.funFact ?? `이곳은 부산 ${place.district}의 기후와 자연 환경, 혹은 상업 소비 인프라가 융복합된 멋진 장소적 자산입니다.`,
    theme: categoryPreset.name,
    quiz: {
      question: preset?.question ?? defaultQuiz.question,
      options: preset?.options ?? defaultQuiz.options,
      answerIndex: preset?.answerIndex ?? defaultQuiz.answerIndex,
      explanation: preset?.explanation ?? defaultQuiz.explanation
    }
  };
});
