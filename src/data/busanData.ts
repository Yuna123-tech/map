/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusanSpot, CategoryInfo, RegionInfo } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  food: {
    key: 'food',
    name: '블루리본 맛집',
    shortName: '맛집',
    emoji: '🍰',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 border-rose-200',
    borderColor: 'border-rose-400',
    description: '맛있기로 소문난 부산의 대표 빵집, 돼지국밥, 불백 식당들이에요!',
    stamp: '🍰',
  },
  traffic: {
    key: 'traffic',
    name: '교통 편의',
    shortName: '교통',
    emoji: '🚌',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 border-cyan-200',
    borderColor: 'border-cyan-400',
    description: '외국인 관광객들이 기차, 비행기, 배를 편리하게 갈아타고 이동할 수 있는 관문이에요!',
    stamp: '🚌',
  },
  play: {
    key: 'play',
    name: '체험 놀거리',
    shortName: '놀거리',
    emoji: '🎡',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 border-amber-200',
    borderColor: 'border-amber-400',
    description: '놀이공원, 오션뷰 케이블카, 수족관 등 부산에서 신나게 체험할 수 있어요!',
    stamp: '🎡',
  },
  history: {
    key: 'history',
    name: '역사 및 자연 볼거리',
    shortName: '역사자연',
    emoji: '🌲',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 border-emerald-200',
    borderColor: 'border-emerald-400',
    description: '부산의 피란민 아픔이 담긴 조용한 골목과 웅장한 수목, 천년 사찰이 숨쉬고 있어요!',
    stamp: '🌲',
  },
  beach: {
    key: 'beach',
    name: '해수욕장 바다',
    shortName: '바다',
    emoji: '🏖️',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    borderColor: 'border-blue-400',
    description: '시원한 바람과 모래사장, 화려하게 반짝이는 부산 밤바다 등 환상적인 경관을 제공해요!',
    stamp: '🏖️',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

// 진짜 부산의 100대 실생활 지리·경제 정보 데이터 (총 100개)
const rawPlacesData = [
  // 1. 맛집 테마 (🍰 24곳)
  { id: 1, category: 'food' as const, name: '남천동 빵천동 거리', icon: '🍰', x: 62, y: 56, district: '수영구', desc: '부산에서 빵집이 가장 밀집한 골목으로, 소상공인 상생과 경제 교류의 상징적 장소입니다.' },
  { id: 2, category: 'food' as const, name: '초량 불백 거리', icon: '🔥', x: 42, y: 55, district: '동구', desc: '합리적인 가격으로 맛있는 백반을 맛볼 수 있는 서민들의 든든한 식사 공간입니다.' },
  { id: 3, category: 'food' as const, name: '신발원 만두', icon: '🥟', x: 44, y: 56, district: '동구', desc: '부산역 앞 차이나타운에서 대를 이어오며 물적 소비를 유치하는 대표 맛집입니다.' },
  { id: 4, category: 'food' as const, name: '남포동 이재모피자', icon: '🍕', x: 38, y: 65, district: '중구', desc: '품질 좋은 국산 임실치즈를 아낌없이 사용해 원도심 경제에 활력을 주는 외식 브랜드입니다.' },
  { id: 5, category: 'food' as const, name: '개금골목시장 개금밀면', icon: '🍲', x: 35, y: 44, district: '부산진구', desc: '전란 시절 이주민들이 냉면 대신 밀가루로 만든 구휼 음식에서 출발한 부산 향토 맛집입니다.' },
  { id: 6, category: 'food' as const, name: '동래할매파전', icon: '🥞', x: 48, y: 32, district: '동래구', desc: '조선시대 동래 장터의 명물 파전의 맛을 오늘날까지 그대로 보존해 온 무형 유산형 식당입니다.' },
  { id: 7, category: 'food' as const, name: '부평동 족발골목', icon: '🐷', x: 34, y: 64, district: '중구', desc: '남포동 극장가 옆에 위치해 영화 상영 전후로 풍부한 상업 소비가 정착된 특화 거리입니다.' },
  { id: 8, category: 'food' as const, name: '해운대 금수복국', icon: '🥣', x: 74, y: 48, district: '해운대구', desc: '뚝배기에 담아내는 독창적인 탕 요리를 유행시킨 고장의 유명 외식 자산입니다.' },
  { id: 9, category: 'food' as const, name: '영도 삼진어묵 본점', icon: '🍢', x: 45, y: 69, district: '영도구', desc: '부산에서 가장 오래된 어묵 제조 공장으로 어촌 자원을 가공 판매하는 고부가가치 상업 공간입니다.' },
  { id: 10, category: 'food' as const, name: '자갈치시장 꼼장어 골목', icon: '🔥', x: 36, y: 67, district: '중구', desc: '바다 어민들의 거친 삶과 영양가 높은 먹거리가 집결하여 밤 문화를 깨우는 경제 지대입니다.' },
  { id: 11, category: 'food' as const, name: '사상 밀면 골목', icon: '🍜', x: 25, y: 48, district: '사상구', desc: '서부산 공업지대 근로자들의 땀을 시원하게 식혀주던 오랜 서민 경제형 국수 식당입니다.' },
  { id: 12, category: 'food' as const, name: '동래 소문난파전', icon: '🥗', x: 45, y: 30, district: '동래구', desc: '금정산 자락 등산객들이 내려오며 즐겨 찾는 친환경 농가 자원 활용 식당입니다.' },
  { id: 13, category: 'food' as const, name: '서면 국밥골목', icon: '🍲', x: 40, y: 42, district: '부산진구', desc: '서면 번화가 중심에 있어 청년들과 외지인들의 지속적인 먹거리 순환 소비를 일으키는 곳입니다.' },
  { id: 14, category: 'food' as const, name: '수변공원 포장마차촌', icon: '🎪', x: 64, y: 54, district: '수영구', desc: '밤바다와 회 센터가 융합되어 청년 관광객의 소비를 이끌어내던 계절형 상업 밀집 구역입니다.' },
  { id: 15, category: 'food' as const, name: '기장시장 대게거리', icon: '🦀', x: 88, y: 22, district: '기장군', desc: '동해안에서 갓 잡은 대게들이 대규모로 거래되며 지역 유통 소득을 올리는 특산물 경제지입니다.' },
  { id: 16, category: 'food' as const, name: '남포동 단팥죽 골목', icon: '🍯', x: 35, y: 62, district: '중구', desc: '할머니들의 정성이 담긴 팥죽 한 그릇으로 원도심 골목 상권의 숨결을 잇는 따뜻한 장소입니다.' },
  { id: 17, category: 'food' as const, name: '해운대 해리단길 카페촌', icon: '☕', x: 71, y: 45, district: '해운대구', desc: '폐철길 부지를 활용해 아기자기한 독립 매장들이 들어선 현대식 소상공인 골목입니다.' },
  { id: 18, category: 'food' as const, name: '전포 카페거리', icon: '🧁', x: 42, y: 44, district: '부산진구', desc: '공구 상가와 커피 향이 공존하는 뉴욕 타임즈 선정 글로벌 이색 맛집 거리입니다.' },
  { id: 19, category: 'food' as const, name: '온천천 낙민 카페거리', icon: '🍹', x: 50, y: 36, district: '연제구', desc: '벚꽃 산책로 and 맛집 소비가 유기적으로 연계되어 사계절 주민 힐링을 돕는 자연 융합 상권입니다.' },
  { id: 20, category: 'food' as const, name: '부평 깡통시장 야시장', icon: '🍢', x: 33, y: 63, district: '중구', desc: '다문화 상인들이 모여 세계의 퓨전 음식을 제공하는 다국적 경제 문화 교류 중심지입니다.' },
  { id: 21, category: 'food' as const, name: '기장 연화리 해녀촌', icon: '🐚', x: 87, y: 36, district: '기장군', desc: '해녀들이 직접 채취한 신선한 해산물과 전복죽을 공급하여 바다 자원의 가치를 극대화하는 곳입니다.' },
  { id: 22, category: 'food' as const, name: '수영 팔도시장 국밥길', icon: '🍲', x: 58, y: 49, district: '수영구', desc: '조선시대 수영 수군 주둔지 역사가 깃든 시장에서 전통 소비 활성화를 지켜온 밥집 골목입니다.' },
  { id: 23, category: 'food' as const, name: '구포시장 묵자 골목', icon: '🍛', x: 26, y: 28, district: '북구', desc: '낙동강 나루터 장터의 맥을 이어 전통 국수와 가마솥 음식을 생산하는 역사 경제 공간입니다.' },
  { id: 24, category: 'food' as const, name: '대연동 쌍둥이국밥', icon: '🍲', x: 54, y: 60, district: '남구', desc: '대학가와 평화공원 인근에 위치해 대학생들과 관광객의 합리적 외식을 도모하는 국밥 명소입니다.' },

  // 2. 교통 편의 테마 (🚌 16곳)
  { id: 25, category: 'traffic' as const, name: 'KTX 부산역 역사', icon: '🚄', x: 44, y: 59, district: '동구', desc: '고장 외부의 대규모 인적·물적 자원이 유입되는 핵심 고속철도 역사입니다.' },
  { id: 26, category: 'traffic' as const, name: '김해국제공항 활주로', icon: '✈️', x: 16, y: 40, district: '강서구', desc: '하늘길을 열어 글로벌 관광객과의 상호 의존 교류를 실현하는 하늘 관문입니다.' },
  { id: 27, category: 'traffic' as const, name: '노포 종합버스터미널', icon: '🚌', x: 52, y: 11, district: '금정구', desc: '경부고속도로 초입이자 지하철 종점에 놓여 고속 상호 소통을 돕는 정류장입니다.' },
  { id: 28, category: 'traffic' as const, name: '사상 서부버스터미널', icon: '🚍', x: 24, y: 46, district: '사상구', desc: '경남 서부권 상공업 자원의 정기적 이동과 통근 교류를 촉진하는 관문입니다.' },
  { id: 29, category: 'traffic' as const, name: '동해선 신해운대역', icon: '🚃', x: 75, y: 43, district: '해운대구', desc: '해운대만 도심과 기장의 한적한 농촌을 쾌적하게 묶어주는 복선전철역입니다.' },
  { id: 30, category: 'traffic' as const, name: '서면역 지하철 교차점', icon: '🚇', x: 41, y: 43, district: '부산진구', desc: '지하철 1호선과 2호선이 가로세로 교차하여 환승 편의성을 최대화하는 대중교통 심장부입니다.' },
  { id: 31, category: 'traffic' as const, name: '부산국제여객터미널', icon: '🚢', x: 46, y: 57, district: '동구', desc: '일본 등 해외 선박 교류가 직접 체결되는 동북아 해상 교통의 핵심 교두보입니다.' },
  { id: 32, category: 'traffic' as const, name: '동래역 광역 환승센터', icon: '🚇', x: 47, y: 35, district: '동래구', desc: '북부 금정지역과 도심지 동래를 밀착 연계하는 지리적 분배 및 승차 요충지입니다.' },
  { id: 33, category: 'traffic' as const, name: '영도대교 개폐시설', icon: '🌉', x: 39, y: 69, district: '영도구', desc: '원도심과 영도 섬을 물리적으로 잇고 배들이 가로막힘 없이 통과할 수 있게 돕는 도개교입니다.' },
  { id: 34, category: 'traffic' as const, name: '광안대교 교량로', icon: '🌉', x: 63, y: 57, district: '수영구', desc: '바다 한가운데를 비행하듯 통과해 동부산 이동 시간을 비약적으로 단축해 주는 도로 자산입니다.' },
  { id: 35, category: 'traffic' as const, name: '부산항대교 해안선', icon: '🌉', x: 48, y: 64, district: '남구', desc: '영도와 남구를 공중에서 안전하게 연결해 물류비용의 기회비용을 합리적으로 낮춘 다리입니다.' },
  { id: 36, category: 'traffic' as const, name: '가덕도 신공항 예정지', icon: '✈️', x: 4, y: 88, district: '강서구', desc: '미래 동남권 해상 물류의 핵심 거점으로 성장하여 지리적 확장을 도모할 예정지입니다.' },
  { id: 37, category: 'traffic' as const, name: '신선대 컨테이너 터미널', icon: '🚢', x: 55, y: 66, district: '남구', desc: '전 세계의 산업 자원 선박이 정박하여 수출입 무역을 수행하는 부산 경제의 심장입니다.' },
  { id: 38, category: 'traffic' as const, name: '부전역 복합 환승역', icon: '🚉', x: 43, y: 40, district: '부산진구', desc: '중앙선 기차와 서면 역세권이 바로 인접하여 고장 교통을 입체적으로 분배하는 거점입니다.' },
  { id: 39, category: 'traffic' as const, name: '다대포항 수산 물류역', icon: '⚓', x: 26, y: 84, district: '사하구', desc: '서부산 어민들의 수산물 자원을 가공하고 전국으로 배송하는 관문 항구입니다.' },
  { id: 40, category: 'traffic' as const, name: '오시리아역 동해선', icon: '🚉', x: 81, y: 37, district: '기장군', desc: '기장 오시리아 대형 테마파크 단지로 신속하고 편리하게 진입할 수 있는 특화 전철역입니다.' },

  // 3. 체험 놀거리 테마 (🎡 18곳)
  { id: 41, category: 'play' as const, name: '기장 롯데월드 테마파크', icon: '🎡', x: 82, y: 33, district: '기장군', desc: '가족 및 동료 가이드들과 즐거운 협동 체험을 나누고 즐기는 야외 어트랙션 단지입니다.' },
  { id: 42, category: 'play' as const, name: '광안리 드론쇼 중앙광장', icon: '🛸', x: 64, y: 55, district: '수영구', desc: '밤바다와 디지털 정보통신 기술이 융합되어 특별한 주말 힐링을 주는 랜드마크 스펙터클입니다.' },
  { id: 43, category: 'play' as const, name: '송도 바다 케이블카', icon: '🚡', x: 35, y: 78, district: '서구', desc: '바다 해안의 멋진 기암절벽 경관을 높은 하늘에서 입체적으로 체험하는 스릴 넘치는 기구입니다.' },
  { id: 44, category: 'play' as const, name: '해운대 블루라인 철길파크', icon: '🚃', x: 74, y: 49, district: '해운대구', desc: '동해남부선 폐선 철로를 예쁜 관광 열차로 새 단장하여 멋진 바다 모습을 가까이서 볼 수 있습니다.' },
  { id: 45, category: 'play' as const, name: '신세계 센텀시티 스파랜드', icon: '♨️', x: 66, y: 44, district: '해운대구', desc: '세계 최대 규모 백화점 내부에서 따뜻한 천연 온천 자원을 소비하고 회복하는 힐링 공간입니다.' },
  { id: 46, category: 'play' as const, name: 'BEXCO 전시장', icon: '🎪', x: 67, y: 42, district: '해운대구', desc: '글로벌 게임 전시회와 모바일 비즈니스가 상호 교류되는 문화 콘텐츠 경제 중심지입니다.' },
  { id: 47, category: 'play' as const, name: '서면 삼정타워 엔터테인먼트', icon: '🏢', x: 42, y: 45, district: '부산진구', desc: 'e스포츠 경기장과 다양한 가상 게임 체험이 한 빌딩에 입점해 젊은 세대를 끌어들이는 상업 타워입니다.' },
  { id: 48, category: 'play' as const, name: '남포동 BIFF 영화광장', icon: '🎬', x: 36, y: 64, district: '중구', desc: '부산국제영화제의 태동지로 길거리 간식을 사 먹으며 대중 예술을 수용하는 문화 광장입니다.' },
  { id: 49, category: 'play' as const, name: '용두산공원 부산타워', icon: '🗼', x: 38, y: 62, district: '중구', desc: '원도심의 지리와 바다 수평선을 360도 입체적으로 조망할 수 있는 하늘 전망 타워입니다.' },
  { id: 50, category: 'play' as const, name: '영도 피아크 복합문화원', icon: '🏭', x: 50, y: 74, district: '영도구', desc: '오래된 조선소 공업 부지를 초대형 오션뷰 카페와 전시장으로 환골탈태시킨 공간 혁신지입니다.' },
  { id: 51, category: 'play' as const, name: '기장 스카이라인 루지', icon: '🏎️', x: 84, y: 32, district: '기장군', desc: '바람을 가르며 달리는 무동력 카트 레이싱 시설로 역동적인 오락 에너지를 제공하는 체험지입니다.' },
  { id: 52, category: 'play' as const, name: '온천동 금강림 케이블카', icon: '🚡', x: 46, y: 25, district: '동래구', desc: '금정산의 고요한 원시 자연 산림 속을 구름을 타고 가듯 감상할 수 있는 클래식한 케이블카입니다.' },
  { id: 53, category: 'play' as const, name: '태종대 해안 다누비열차', icon: '🚂', x: 49, y: 88, district: '영도구', desc: '영도 끝자락 산길과 가파른 절벽 코스를 아이들이 힘들이지 않고 탐색하게 돕는 친근한 기차입니다.' },
  { id: 54, category: 'play' as const, name: '삼락공원 수상레저타운', icon: '⛵', x: 20, y: 44, district: '사상구', desc: '서부산 낙동강 물줄기 위에서 안전하게 보트와 카약을 즐길 수 있는 이색 친수 레저 지구입니다.' },
  { id: 55, category: 'play' as const, name: '부전 보드게임 아지트', icon: '🎲', x: 43, y: 38, district: '부산진구', desc: '친구들과 브레인스톰 수학 퍼즐과 보드게임을 나누며 논리적 추론을 기르는 주말 오락실입니다.' },
  { id: 56, category: 'play' as const, name: '연산동 부산아시아드 주경기장', icon: '⚽', x: 44, y: 36, district: '연제구', desc: '우리 반 응원단이 모여 스포츠의 정정당당한 가치를 배우고 목소리를 높이는 주 경기장입니다.' },
  { id: 57, category: 'play' as const, name: '삼정 더파크(구) 생태전시', icon: '🦁', x: 38, y: 34, district: '부산진구', desc: '초록 백양산 속에 숨겨져 고장의 식생 동식물들을 관찰할 수 있는 친환경 학습 장소입니다.' },
  { id: 58, category: 'play' as const, name: '해운대 아쿠아리움 수족관', icon: '🐠', x: 71, y: 52, district: '해운대구', desc: '해운대 백사장 지하에 펼쳐진 거대 해양 수조로, 신비로운 해양 생태계 보존 가치를 가르쳐 줍니다.' },

  // 4. 역사 및 자연 볼거리 테마 (🌲 15곳)
  { id: 59, category: 'history' as const, name: '아미동 피란 비석마을', icon: '🏡', x: 32, y: 62, district: '서구', desc: '비석 위에 놓인 집들을 보며 아픈 피란 역사와 고장 재생의 필연적 가치를 배우는 장소입니다.' },
  { id: 60, category: 'history' as const, name: '금정산성 범어사 대웅전', icon: '🌲', x: 46, y: 18, district: '금정구', desc: '천년의 숲과 사찰 건축을 품어, 고장의 역사를 깊은 장소 정서로 체험하게 하는 전통 유산입니다.' },
  { id: 61, category: 'history' as const, name: '동래읍성 북문 성곽길', icon: '⛩️', x: 49, y: 34, district: '동래구', desc: '외적 침입에 단결해 맞섰던 조상들의 국방 유적지로, 수려한 야경을 품은 지리 역사 자원입니다.' },
  { id: 62, category: 'history' as const, name: '영도 태종대 망부석', icon: '🌲', x: 48, y: 86, district: '영도구', desc: '기암절벽과 무성한 해송이 만나 남해의 푸른 바닷소리를 선물하는 국가 지정 자연 명승지입니다.' },
  { id: 63, category: 'history' as const, name: '우암동 산복도로 소막마을', icon: '🐂', x: 50, y: 58, district: '남구', desc: '피란 시절 소 축사를 거처로 개조해 살아왔던 흔적이 보존된 민중 생활사 박물관마을입니다.' },
  { id: 64, category: 'history' as const, name: '초량 168 이바구길 계단', icon: '🪜', x: 42, y: 57, district: '동구', desc: '원도심의 가파른 비탈길에 설치된 모노레일을 타며, 피란 시절 산등성이 삶을 체화하는 장소입니다.' },
  { id: 65, category: 'history' as const, name: '기장 죽성 드림성당', icon: '⛪', x: 89, y: 31, district: '기장군', desc: '바위에 부딪히는 하얀 파도와 동화 같은 세트 건물이 어우러진 이색적인 해안 자연 명소입니다.' },
  { id: 66, category: 'history' as const, name: 'UN 기념공원 추모묘역', icon: '🎖️', x: 55, y: 62, district: '남구', desc: '6·25 참전 연합군 장병들의 넋이 잠든 세계 유일의 UN 성지로 공동체 안보 평화 교육장입니다.' },
  { id: 67, category: 'history' as const, name: '민주공원 충혼탑', icon: '🔥', x: 41, y: 60, district: '중구', desc: '부산의 산등성이 꼭대기에 세워져 조국 수호와 민주화 운동의 숭고한 정신을 기리는 곳입니다.' },
  { id: 68, category: 'history' as const, name: '수영 사적공원 팽나무', icon: '🌲', x: 57, y: 47, district: '수영구', desc: '수영성 수군을 지키던 400년 묵은 수호나무가 서 있어, 고장의 기후와 수목 가치를 보존합니다.' },
  { id: 69, category: 'history' as const, name: '오륙도 등대 스카이워크', icon: '🏝️', x: 61, y: 73, district: '남구', desc: '보는 각도에 따라 섬이 5개 혹은 6개로 보여 부산 지명의 원류가 된 해상 국가지정 문화유산입니다.' },
  { id: 70, category: 'history' as const, name: '을숙도 철새 도래지 습지', icon: '🦆', x: 14, y: 68, district: '강서구', desc: '낙동강 물줄기와 남해가 만나 철새들의 중간 기착지가 된 세계적 생태 보호 구역입니다.' },
  { id: 71, category: 'history' as const, name: '영도 흰여울 문화마을', icon: '🏡', x: 42, y: 76, district: '영도구', desc: '절벽 위에 소박한 집들이 바다를 마주 보는 곳으로 영화 변호인 촬영지로도 유명한 골목마을입니다.' },
  { id: 72, category: 'history' as const, name: '대저 생태공원 대나무숲', icon: '🎋', x: 19, y: 25, district: '강서구', desc: '강서 낙동강변에 울창하게 조성되어 유수지 정화와 봄철 대규모 꽃 축제를 여는 환경 자원입니다.' },
  { id: 73, category: 'history' as const, name: '범일동 피란민 안창마을', icon: '🏡', x: 45, y: 53, district: '동구', desc: '골짜기 안쪽에 숨겨져 전쟁 시기 피란민들의 안전을 지켜준 소박하고 조용한 역사적 정착마을입니다.' },

  // 5. 해수욕장 바다 테마 (🏖️ 27곳)
  { id: 74, category: 'beach' as const, name: '해운대 메인 해수욕장', icon: '🏖️', x: 72, y: 51, district: '해운대구', desc: '고운 모래사장과 첨단 빌딩 숲이 어우러진 대한민국 대표 넘버원 해안 랜드마크입니다.' },
  { id: 75, category: 'beach' as const, name: '광안리 민락 해수욕장', icon: '🏝️', x: 62, y: 60, district: '수영구', desc: '바다 한가운데를 비추는 광안대교 다리 경관과 멋진 야간 문화 소비가 집중되는 바다입니다.' },
  { id: 76, category: 'beach' as const, name: '송도 원조 해수욕장', icon: '🌊', x: 41, y: 72, district: '서구', desc: '개장 100년을 훌륭히 돌파한 한국 최초 공설 해변으로, 바다 위 구름산책로가 발달했습니다.' },
  { id: 77, category: 'beach' as const, name: '다대포 일몰 해수욕장', icon: '🌅', x: 27, y: 78, district: '사하구', desc: '낙동강 고운 흙이 쌓여 생긴 초대형 갯벌 백사장으로, 붉게 물드는 전설적인 낙조 명소입니다.' },
  { id: 78, category: 'beach' as const, name: '송정 서핑 특화 해수욕장', icon: '🏄', x: 79, y: 44, district: '해운대구', desc: '수심이 얕고 파도가 적당해 청년 레저 스포츠인들이 전국에서 모이는 활동적 바다 상권입니다.' },
  { id: 79, category: 'beach' as const, name: '일광 평화로운 해수욕장', icon: '🐚', x: 88, y: 27, district: '기장군', desc: '고려시대 정철이 다녀간 아늑한 조개 모양 해변으로 잔잔한 어촌 힐링을 선사합니다.' },
  { id: 80, category: 'beach' as const, name: '임랑 동해선 해수욕장', icon: '🏖️', x: 92, y: 18, district: '기장군', desc: '깨끗한 동해 파도와 고요한 민박 텐트촌이 조성되어 캠핑족의 사랑을 받는 평화로운 바다입니다.' },
  { id: 81, category: 'beach' as const, name: '청사포 등대 해변', icon: '⚓', x: 76, y: 46, district: '해운대구', desc: '해질녘 붉게 빛나는 하얀색, 빨간색 쌍둥이 등대와 조개구이 소비가 활발한 포구입니다.' },
  { id: 82, category: 'beach' as const, name: '영도 감지자갈해변', icon: '🪨', x: 47, y: 83, district: '영도구', desc: '모래 대신 동글동글 조약돌이 파도에 구르는 소리를 감상하며 해녀 해산물을 즐기는 장소입니다.' },
  { id: 83, category: 'beach' as const, name: '미포 선착장 해변', icon: '⛵', x: 73, y: 52, district: '해운대구', desc: '오륙도와 광안리를 가로지르는 유람선이 출발하며 해상 레저 산업을 육성하는 선착지입니다.' },
  { id: 84, category: 'beach' as const, name: '수영 민락수변공원 광장', icon: '⛲', x: 63, y: 54, district: '수영구', desc: '광안대교를 바로 밑에서 감상하며 바닷바람과 상업 소비를 융합했던 명품 친수 공간입니다.' },
  { id: 85, category: 'beach' as const, name: '해운대 영화의거리 산책로', icon: '🎬', x: 67, y: 53, district: '해운대구', desc: '마린시티 방파제 벽면을 영화 명장면 타일로 꾸며 해안 도보 관광 소득을 촉진하는 길입니다.' },
  { id: 86, category: 'beach' as const, name: '기장 시랑대 바위해안', icon: '🪨', x: 85, y: 35, district: '기장군', desc: '용궁사 사찰 바로 옆에 기암괴석 바위가 병풍처럼 펼쳐진 신비로운 해안 지명 지형입니다.' },
  { id: 87, category: 'beach' as const, name: '감천항 방파제 등대', icon: '⚓', x: 31, y: 75, district: '사하구', desc: '남해에서 유입되는 강한 파도를 줄여서 서부산 산업 항구의 안전을 도모하는 교통 해안 시설입니다.' },
  { id: 88, category: 'beach' as const, name: '이기대 해안 동굴산책길', icon: '🌲', x: 61, y: 66, district: '남구', desc: '군사 보호구역에서 해제되어 보존된 청정 원시 해안 지형으로 오륙도를 바라보는 비경길입니다.' },
  { id: 89, category: 'beach' as const, name: '신선대 바위 해벽', icon: '🪨', x: 57, y: 64, district: '남구', desc: '신선이 내려와 놀았다는 설화가 담긴 바위 기하 지형으로 영도 앞바다의 조망권을 소장했습니다.' },
  { id: 90, category: 'beach' as const, name: '암남공원 바다낚시터', icon: '🎣', x: 36, y: 81, district: '서구', desc: '남해안의 울창한 해송 숲 속 절벽 밑에 위치해 친환경 해양 낚시를 안전하게 소비하는 공원입니다.' },
  { id: 91, category: 'beach' as const, name: '기장 오랑대 일출 바위', icon: '🌅', x: 86, y: 31, district: '기장군', desc: '기암절벽 끝에 세워진 조그만 암자에 파도가 부서지는 황홀한 일출을 구경하는 자연 비경입니다.' },
  { id: 92, category: 'beach' as const, name: '영도 태종대 자갈마당', icon: '🪨', x: 50, y: 89, district: '영도구', desc: '태종대 기암절벽 정중앙 밑에 수많은 자갈이 파도에 씻기며 청량한 소리를 내는 마당입니다.' },
  { id: 93, category: 'beach' as const, name: '다대포 낙조분수 광장', icon: '⛲', x: 26, y: 80, district: '사하구', desc: '세계 최대 규모 음악 낙조 분수 쇼를 제공하여 고요하던 서부산 바다에 사람을 유치하는 자원입니다.' },
  { id: 94, category: 'beach' as const, name: '기장 죽성항 해안 등대', icon: '⚓', x: 90, y: 29, district: '기장군', desc: '조용하고 아담한 기장 어민들의 포구 앞을 환하게 밝혀 선박 교통의 충돌을 예방하는 등대입니다.' },
  { id: 95, category: 'beach' as const, name: '동백섬 인어상 해안길', icon: '🧜', x: 70, y: 53, district: '해운대구', desc: '해운대 바다의 서쪽 끝에 위치한 울창한 해송 섬 산책길로 황옥공주 전설 유산을 가졌습니다.' },
  { id: 96, category: 'beach' as const, name: '가덕도 외양포 몽돌해변', icon: '🪨', x: 3, y: 92, district: '강서구', desc: '부산 서쪽 끝 가덕도 섬 안쪽에 보존되어 고요한 파도와 파스텔 몽돌이 부딪히는 자연 해변입니다.' },
  { id: 97, category: 'beach' as const, name: '수영강 민락 나루터길', icon: '⛵', x: 62, y: 51, district: '수영구', desc: '온천천과 수영강 바다가 만나는 역사적 나루터 부지로 수영강 보트 체험이 가능합니다.' },
  { id: 98, category: 'beach' as const, name: '기장 오시리아 동해 해안 산책로', icon: '🚶', x: 84, y: 36, district: '기장군', desc: '대형 오시리아 호텔 군과 동해안 암석 지형이 멋지게 연결되어 해안 휴양을 극대화하는 길입니다.' },
  { id: 99, category: 'beach' as const, name: '청사포 해변 다릿돌 전망대', icon: '🚶', x: 77, y: 46, district: '해운대구', desc: '바다 위로 70m 이상 뻗어 나가 유리 바닥을 걷는 아슬아슬한 친해양 체험을 파는 명소입니다.' },
  { id: 100, category: 'beach' as const, name: '영도 신선놀음 몽돌자갈길', icon: '🪨', x: 44, y: 81, district: '영도구', desc: '영도 서편 해안 절벽 아래 숨겨져 파도의 정화 소리를 독점할 수 있는 100번째 비밀 바다 지대입니다.' }
];

export const REGIONS: Record<string, RegionInfo> = {
  all: {
    key: 'all',
    name: '부산광역시 전역 통합 조사',
    emoji: '🧭',
    description: '부산의 16개 구·군 전체에 걸쳐 넓게 펼쳐진 100대 명소를 골고루 수집 분석해요! (가장 방대함)',
    districts: [
      '강서구', '북구', '사상구', '사하구', '금정구', '동래구', '연제구', '부산진구', 
      '서구', '동구', '중구', '영도구', '남구', '수영구', '해운대구', '기장군'
    ]
  },
  north: {
    key: 'north',
    name: '북부 구역 (생태&관문)',
    emoji: '🦆',
    description: '강서구, 북구, 사상구 지역으로 낙동강 습지 생태 공원과 하늘길 공항 등 교통의 요충지입니다. 푸른 강과 보트 체험, 수목원의 자연을 조사해 보아요!',
    districts: ['강서구', '북구', '사상구']
  },
  west: {
    key: 'west',
    name: '서부 구역 (노을&예술)',
    emoji: '🌅',
    description: '사하구, 서구 지역으로 다대포의 명물 낙조, 송도 해수욕장 케이블카, 그리고 비석마을이 모여 있습니다. 바다와 노을, 역사 예술을 조사해 보아요!',
    districts: ['사하구', '서구']
  },
  south: {
    key: 'south',
    name: '남부 구역 (역사&원도심)',
    emoji: '⚓',
    description: '중구, 동구, 영도구, 남구 지역으로 우뚝 솟은 부산타워, 168 피란 계단길, 흰여울마을, 부산항 오륙도 등 생생한 역사가 깃든 원도심과 바다를 함께 탐색합니다.',
    districts: ['중구', '동구', '영도구', '남구']
  },
  haeundae: {
    key: 'haeundae',
    name: '해운대 구역 (세계&관광)',
    emoji: '🏙️',
    description: '해운대구 중심 구역으로 메인 해수욕장, 해리단길 카페촌, 블루라인 기찻길, 수족관 등이 집중된 첨단 해상 글로벌 관광지구입니다.',
    districts: ['해운대구']
  },
  dongnae: {
    key: 'dongnae',
    name: '동래 구역 (전통&교육)',
    emoji: '⛩️',
    description: '동래구, 금정구, 연제구, 부산진구 지역으로 유서 깊은 동래읍성, 천년사찰 범어사, 서면의 환승 허브, 식생 관찰 백양산 숲이 있는 교육 지대입니다.',
    districts: ['동래구', '금정구', '연제구', '부산진구']
  },
  gijang_suyeong: {
    key: 'gijang_suyeong',
    name: '기장·수영 구역 (자연&여가)',
    emoji: '⛵',
    description: '기장군, 수영구 지역으로 오시리아 테마파크, 기장 해변과 대게거리, 광안리 백사장과 드론쇼 등이 어울린 자연과 레저의 대표 융합 지대입니다.',
    districts: ['기장군', '수영구']
  }
};

export const REGION_LIST = Object.values(REGIONS);

// 대표 장소들의 퀴즈와 상식 정의 데이터
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
  25: {
    funFact: "부산역 분수광장 앞에는 다양한 역사 전시물과 외국인 관광객을 위한 차이나타운(상해거리)이 바로 인접해 있어요!",
    question: "대한민국 서울과 부산을 시속 300km로 달려서 단 2시간 30분 만에 이어주는 고속철도의 이름은 무엇일까요?",
    options: ["새마을호", "무궁화호", "GTX", "KTX"],
    answerIndex: 3,
    explanation: "경부고속철도의 중심 관문인 KTX 덕분에 전국의 수많은 관광객들이 부산 바다와 문화를 하루 만에 신속하게 즐길 수 있게 되었습니다."
  },
  26: {
    funFact: "김해국제공항은 부산 가덕도와 강서구 낙동강 평야 사이에 자리해 외국인들이 하늘을 날아 도착하는 첫 문이에요!",
    question: "비행기가 안전하게 하늘로 떠오르고 다시 사뿐히 바퀴를 내릴 수 있도록 공항에 기레 닦인 평평한 아스팔트 길은 무엇일까요?",
    options: ["휴게소", "고속도로 터널", "활주로", "철도 선로"],
    answerIndex: 2,
    explanation: "공항의 활주로(Runway)는 무거운 비행기들이 엄청난 속도로 가속하여 하늘로 이륙하도록 튼튼하고 길게 닦여진 이착륙 특수 도로입니다."
  },
  41: {
    funFact: "기장 오시리아 관광단지에 우뚝 솟은 롯데월드 부산은 완전한 야외 숲속 동화나라 컨셉이에요!",
    question: "롯데월드 어드벤처 부산의 마스코트 요정들이 살고 있으며 관람객에게 눈을 깜빡이며 직접 말을 건네는 나무의 이름은?",
    options: ["말하는 소나무", "토킹트리 (Talking Tree)", "노래하는 단풍나무", "소망 은행나무"],
    answerIndex: 1,
    explanation: "중앙 광장에 설치된 거대한 거목 토킹트리는 센서를 통해 아이들의 움직임을 감지하며 동화 같은 이야기를 직접 입을 움직여 말해줍니다."
  },
  74: {
    funFact: "해운대 해수욕장은 대한민국에서 가장 넓고 백사장이 잘 발달된 명품 해변이에요!",
    question: "매년 겨울, 해운대 해변 모래사장에서 차가운 얼음 바닷속으로 뛰어드는 세계적으로 이색적인 축제의 이름은 무엇일까요?",
    options: ["해운대 북극곰 축제", "갈매기 날갯짓 대회", "해양 윈드서핑 축제", "해운대 머드 올림픽"],
    answerIndex: 0,
    explanation: "매년 1월 차가운 날씨 속에 맨몸으로 건강한 기운을 내며 해운대 앞바다로 입수하는 '북극곰 수영축제'가 오랜 역사를 지녔습니다."
  },
  77: {
    funFact: "다대포 해수욕장은 바다와 낙동강 해가 만나는 넓은 모래 갯벌과 환성적인 다대포 낙조로 매우 신비로워요!",
    question: "다대포 백사장 입구 광장에 설치된, 최고 높이 55m로 밤하늘을 조명과 함께 쏘아 올리는 음악 분수의 예쁜 이름은?",
    options: ["은하수 분수", "꿈의 낙조분수", "바다 회오리분수", "인어공주 분수"],
    answerIndex: 1,
    explanation: "세계 최대 규모로 공인되었던 '꿈의 낙조분수'는 음악 장단과 오색 찬란한 레이저 조명에 맞춰 물줄기가 춤을 추는 대표 명소입니다."
  }
};

// 100개 명소를 BusanSpot 규격으로 매핑하여 내보내는 데이터 가공
export const BUSAN_SPOTS: BusanSpot[] = rawPlacesData.map((place) => {
  const preset = QUIZ_PRESETS[place.id];
  
  // 퀴즈가 누락된 나머지 장소들은 고장 명칭과 행정구역에 걸맞은 교육적 OX 퀴즈로 지능적 대체
  const defaultQuiz = {
    question: `${place.name}은(는) 부산의 "${place.district}"에 자리잡고 있으며, 우리 고장의 빛나는 경제·지리적 소중한 명소 중 하나일까요?`,
    options: ["그렇다 (⭕)", "아니다 (❌)"],
    answerIndex: 0,
    explanation: `맞습니다! ${place.name}은(는) 실제 부산광역시 ${place.district}에 훌륭하게 자리 잡고 있어서 고장의 자랑거리이자 많은 이들이 탐험을 즐기는 핵심 장소입니다.`
  };

  return {
    id: `spot-${place.id}`,
    name: place.name,
    category: place.category,
    district: place.district,
    description: place.desc,
    mapX: place.x,
    mapY: place.y,
    address: `부산광역시 ${place.district} 내 명소`,
    icon: place.icon,
    funFact: preset?.funFact ?? `이곳은 부산 ${place.district}의 기후와 자연 환경, 혹은 상업 소비 인프라가 융복합된 멋진 장소적 자산입니다.`,
    theme: CATEGORIES[place.category].name,
    quiz: {
      question: preset?.question ?? defaultQuiz.question,
      options: preset?.options ?? defaultQuiz.options,
      answerIndex: preset?.answerIndex ?? defaultQuiz.answerIndex,
      explanation: preset?.explanation ?? defaultQuiz.explanation
    }
  };
});
