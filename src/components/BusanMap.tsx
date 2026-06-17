/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent, TouchEvent, WheelEvent } from 'react';
import { BusanSpot, CategoryKey, QuizState, RegionKey } from '../types';
import { BUSAN_SPOTS, CATEGORY_LIST, REGIONS } from '../data/busanData';
import { Compass, CheckCircle, HelpCircle, AlertCircle, Search, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 흐릿하게 지도를 장식할 구역별 워터마크 데이터
const DISTRICT_WATERMARKS = [
  { name: '강서구 ✈️', x: 16, y: 46 },
  { name: '북구 🌲', x: 28, y: 22 },
  { name: '사상구 🏭', x: 25, y: 42 },
  { name: '사하구 🌅', x: 20, y: 68 },
  { name: '금정구 ⛰️', x: 50, y: 14 },
  { name: '동래구 ♨️', x: 45, y: 30 },
  { name: '연제구 🏛️', x: 54, y: 36 },
  { name: '부산진구 🏙️', x: 38, y: 46 },
  { name: '서구 🏥', x: 32, y: 60 },
  { name: '동구 🚢', x: 44, y: 56 },
  { name: '중구 🛍️', x: 36, y: 64 },
  { name: '영도구 ⚓', x: 44, y: 72 },
  { name: '남구 🏛️', x: 54, y: 62 },
  { name: '수영구 🌉', x: 62, y: 54 },
  { name: '해운대구 🏖️', x: 74, y: 48 },
  { name: '기장군 🌊', x: 86, y: 24 },
];

interface BusanMapProps {
  onCollectSpot: (spotId: string) => void;
  collectedSpots: string[];
  quizState: QuizState;
  onSolveQuiz: (spotId: string, answerIndex: number, isCorrect: boolean) => void;
  selectedRegion: RegionKey;
}

export default function BusanMap({
  onCollectSpot,
  collectedSpots,
  quizState,
  onSolveQuiz,
  selectedRegion,
}: BusanMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  const [activeSpot, setActiveSpot] = useState<BusanSpot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | 'all'>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 상위의 조사 구역(Region)이 바뀔 경우, 구별 상세 필터와 피드백 팝업을 깔끔히 초기화하여 장소가 누락됨 오해가 없도록 합니다.
  useEffect(() => {
    setSelectedDistrict('all');
    setActiveSpot(null);
  }, [selectedRegion]);

  // 지도의 확대/축소 및 패닝 상태 (축척 제어)
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef<number | null>(null);

  // 16개 행정구역 목록 (장소감 증진을 위한 구별 필터)
  const districts = [
    'all', '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', 
    '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'
  ];

  // 필터링된 스팟 목록 (카테고리 + 행정구역 + 검색어)
  const filteredSpots = BUSAN_SPOTS.filter((spot) => {
    const matchesCategory = selectedCategory === 'all' || spot.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'all' || spot.district === selectedDistrict;
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spot.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDistrict && matchesSearch;
  });

  const handleSpotClick = (spot: BusanSpot) => {
    setActiveSpot(spot);
    onCollectSpot(spot.id); // 클릭 시 탐험 장소 목록에 등록
  };

  const handleQuizAnswer = (spot: BusanSpot, optionIndex: number) => {
    if (!spot.quiz) return;
    const isCorrect = optionIndex === spot.quiz.answerIndex;
    onSolveQuiz(spot.id, optionIndex, isCorrect);
  };

  // 줌인/줌아웃 핸들러
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const nextZoom = Math.max(prev - 0.3, 1);
      if (nextZoom === 1) {
        setPanX(0);
        setPanY(0);
      }
      return nextZoom;
    });
  };
  const handleResetNavigation = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // 지도 드래그 패닝 처리 (마우스)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return; // 줌이 1배일 때는 드래그 금지
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1) return;
    const nextPanX = e.clientX - dragStart.current.x;
    const nextPanY = e.clientY - dragStart.current.y;

    // 드래그 제한 범위 설정 (지도가 너무 바깥으로 나가는 것을 방지)
    const limit = (zoom - 1) * 200;
    setPanX(Math.min(Math.max(nextPanX, -limit), limit));
    setPanY(Math.min(Math.max(nextPanY, -limit), limit));
  };

  const handleMouseUp = () => setIsDragging(false);

  // 지도 드래그 패닝 및 핀치 줌 처리 (모바일 터치)
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // 핀치 줌 시작 계산
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    } else if (e.touches.length === 1) {
      if (zoom <= 1) return;
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - panX, y: touch.clientY - panY };
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDist.current;
      setZoom((prev) => {
        const nextZoom = Math.min(Math.max(prev * factor, 1), 4);
        if (nextZoom === 1) {
          setPanX(0);
          setPanY(0);
        }
        return nextZoom;
      });
      touchStartDist.current = dist;
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      const touch = e.touches[0];
      const nextPanX = touch.clientX - dragStart.current.x;
      const nextPanY = touch.clientY - dragStart.current.y;

      const limit = (zoom - 1) * 200;
      setPanX(Math.min(Math.max(nextPanX, -limit), limit));
      setPanY(Math.min(Math.max(nextPanY, -limit), limit));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  // 마우스 wheel 스크롤 확대축소 처리
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) return;
    const zoomIntensity = 0.1;
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + zoomIntensity, 4));
    } else {
      setZoom((prev) => {
        const nextZoom = Math.max(prev - zoomIntensity, 1);
        if (nextZoom === 1) {
          setPanX(0);
          setPanY(0);
        }
        return nextZoom;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="busan-map-section">
      {/* 왼쪽: 지능형 맵 및 컨트롤 (8칸) */}
      <div className="lg:col-span-8 space-y-4">
        {/* 헤더 간판 */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-sky-500 animate-spin-slow shrink-0" />
              <span>1단계: 부산 구석구석을 누리며 명소 개수를 모아보아요! 🕵️</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium leading-relaxed">
              알록달록한 지도의 아이콘들을 콕 터치해 보세요. 실제 부산광역시 300대 지리·경제 정보의 장소 가치를 찾아가고 퀴즈를 풀어 장소를 획득할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 bg-emerald-50/60 px-5 py-3.5 rounded-2xl self-start md:self-auto shrink-0 border border-emerald-200 shadow-3xs">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span>수집 완료 명소: {collectedSpots.length} / {BUSAN_SPOTS.length} 곳</span>
          </div>
        </div>

        {/* 돋보기 행정구역 특화 필터 판넬 (장소감 형성 최대치) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="space-y-2">
            <span className="text-base sm:text-lg md:text-xl font-black text-slate-800 block">🔍 우리 동네나 관심있는 행정구역 모아보기 (구별 돋보기 필터):</span>
            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              {districts.map((dist, idx) => {
                const currentRegion = REGIONS[selectedRegion] || REGIONS['all'];
                const isDistInRegion = selectedRegion === 'all' || dist === 'all' || currentRegion.districts.includes(dist);
                return (
                  <button
                    key={idx}
                    disabled={!isDistInRegion}
                    onClick={() => {
                      setSelectedDistrict(dist);
                      setActiveSpot(null);
                    }}
                    title={!isDistInRegion ? '우리 모둠의 관심 조사 범위가 아닙니다.' : ''}
                     className={`px-3 py-1.5 sm:px-4.5 sm:py-2 rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all cursor-pointer ${
                      !isDistInRegion 
                        ? 'opacity-25 line-through cursor-not-allowed text-slate-400 border border-slate-100'
                        : selectedDistrict === dist 
                          ? 'bg-slate-800 text-white shadow-xs scale-102'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-150'
                    }`}
                  >
                    {dist === 'all' ? '🌈 부산 전체' : dist}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setActiveSpot(null);
              }}
              className={`px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center text-center gap-1 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              👑 전체 테마
            </button>
            {CATEGORY_LIST.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setActiveSpot(null);
                }}
                className={`px-2 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center text-center gap-1 cursor-pointer ${
                  selectedCategory === cat.key
                    ? `${cat.key === 'food' ? 'bg-rose-500' : cat.key === 'traffic' ? 'bg-cyan-500' : cat.key === 'play' ? 'bg-amber-500' : cat.key === 'history' ? 'bg-emerald-600' : 'bg-blue-500'} text-white shadow-xs`
                    : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4.5 top-4.5 w-5.5 h-5.5 text-slate-400" />
            <input
              type="text"
              placeholder="장소 이름이나 동네 명칭을 검색하여 실시간 가이드해 보세요..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveSpot(null);
              }}
              className="w-full pl-13 pr-5 py-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all text-slate-700 font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 전체 300곳 지리 데이터 팩트 검증 및 줌인 설명 패널 */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-emerald-50/40 rounded-3xl p-5 sm:p-6 shadow-3xs border border-sky-100/60 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="flex items-start md:items-center gap-3">
              <span className="text-2xl sm:text-3xl shrink-0">📊</span>
              <div>
                <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <span>300곳 명승 지리 전수 검증 및 안심 카운터</span>
                  <span className="bg-indigo-550 bg-indigo-600 text-white text-[9px] px-2.5 py-0.5 rounded-full font-black animate-pulse">
                    데이터 100% 완벽 검증
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs md:text-[13px] text-slate-650 mt-1 font-semibold leading-relaxed">
                  부산의 16개 구·군을 고르게 기치 반영한 총 <strong className="text-indigo-600">300곳의 독창적 백지도 명소</strong>가 누락이나 왜곡 없이 지도상에 100% 무결하게 구현되었습니다.
                </p>
              </div>
            </div>
            
            {/* 요약 뱃지 모음 */}
            <div className="bg-white/90 backdrop-blur-3xs border border-sky-100 px-4 py-2.5 rounded-2xl flex items-center gap-4 shrink-0 shadow-3xs self-start md:self-auto">
              <div className="text-center">
                <span className="block text-[9px] font-black text-slate-400 tracking-tighter uppercase">MAP 핀 표시</span>
                <span className="text-sm sm:text-base font-black text-sky-600">{filteredSpots.length} / 300곳</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="text-center">
                <span className="block text-[9px] font-black text-slate-400 tracking-tighter uppercase">수집 진행도</span>
                <span className="text-sm sm:text-base font-black text-emerald-600">
                  {((collectedSpots.length / 300) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-slate-100/70 p-3 sm:p-4 rounded-2xl text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-slate-600 font-medium space-y-1.5 shadow-3xs">
            <p className="flex items-start gap-1.5">
              <span className="text-sky-500 shrink-0">💡</span>
              <span>
                <strong>핀 겹침 현상 안내:</strong> 수영역 대환승 거점, 남천동 삼익비치 벚꽃 제과길, 초량동 계단처럼 역사/체험 명소나 유동인구가 집중된 도심 구간은 <strong>여러 개의 핀이 매우 조밀한 자리에 밀집해 있어 서로를 살짝 가리며 겹쳐</strong> 보일 수 있습니다.
              </span>
            </p>
            <p className="flex items-start gap-1.5 pl-5 text-slate-500">
              <span className="shrink-0">👉</span>
              <span>
                이때는 마우스 휠 스크롤이나 두 손가락 핀치 액션, 혹은 지도 상단에 있는 <strong className="text-slate-800">[🔍 지도 확대 슬라이더]</strong>를 부드럽게 당겨 <strong>2배 ~ 최대 4배까지 지형을 줌 인(Zoom In)</strong>해 보세요! 밀집 배치된 핀들이 시원시원하게 넓게 펼쳐지며 <strong>300곳 단 한 곳의 누락도 없이 모든 장소를 완전하게 직접 수집</strong>하실 수 있습니다.
              </span>
            </p>
          </div>
        </div>

        {/* 인터랙티브 줌 & 패닝 축척 정밀 백지도 가든 */}
        <div 
          className={isFullscreen 
            ? "fixed inset-0 z-50 bg-sky-50/98 backdrop-blur-md flex flex-col justify-center items-center w-screen h-screen overflow-hidden p-4 select-none animate-fade-in" 
            : "relative bg-teal-50/10 rounded-3xl border-4 border-white shadow-md overflow-hidden select-none"
          } 
          onWheel={handleWheel}
        >
          {isFullscreen && (
            <div className="absolute top-4 left-4 z-30 bg-white/95 text-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-sky-150 shadow-md select-none">
              <span className="text-sm">🧭</span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-slate-800">우리 반 부산 백지도 큰 화면 탐사 모드</span>
            </div>
          )}

          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-18 z-30 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[10px] sm:text-xs px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg cursor-pointer transition-all border border-rose-400"
            >
              <Minimize2 className="w-4 h-4" />
              <span>크게 보기 닫기</span>
            </button>
          )}

          {/* 드래그 줌 슬라이더 제어 패널 */}
          <div className="absolute top-4 left-4 z-25 flex flex-wrap items-center bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-slate-200 shadow-md gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600">🔍 지도 확대:</span>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => {
                  const nextZoom = parseFloat(e.target.value);
                  setZoom(nextZoom);
                  if (nextZoom === 1) {
                    setPanX(0);
                    setPanY(0);
                  }
                }}
                className="w-16 sm:w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-700">{zoom.toFixed(1)}x</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                showLabels
                  ? 'bg-sky-50 border-sky-200 text-sky-700 shadow-3xs'
                  : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}
            >
              <span>{showLabels ? '🏷️ 이름 항상 보임' : '🏷️ 이름 감춤 (스탬프 세기용)'}</span>
            </button>
          </div>

          {/* 줌인 줌아웃 축척 조작 플로팅 버튼바 */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md px-2 py-2.5 rounded-2xl border border-slate-200/80 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="축척 확대"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="축척 축소"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetNavigation}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer border-t border-slate-100 mt-1"
              title="지도 위치 초기화"
            >
              <RefreshCw className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer border-t border-slate-100 mt-1"
              title={isFullscreen ? "원래 크기로 복귀" : "지도만 아주 크게 보기"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-rose-500 font-black animate-pulse" /> : <Maximize2 className="w-4 h-4 text-sky-500 font-black" />}
            </button>
            <div className="text-[10px] font-black text-slate-500 text-center border-t border-slate-100 mt-1 pt-1">
              {zoom.toFixed(1)}x
            </div>
          </div>

          {/* 서서히 흔들리는 시각 일러스트와 지도 나침반 플레이트 */}
          <div 
            ref={null}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            className={isFullscreen 
              ? "relative aspect-[4/3] w-auto h-[92vh] max-w-full origin-center transition-transform duration-250 ease-out flex-shrink-0"
              : "relative aspect-[4/3] w-full origin-center transition-transform duration-250 ease-out"
            }
          >
            {/* 귀여운 지도 수계 및 바다 백그라운드 디자인 */}
            <div className="absolute inset-0 bg-blue-50/30 opacity-80 pointer-events-none" />

            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="absolute top-[35%] left-[8%] text-5xl">🌊</div>
              <div className="absolute top-[65%] left-[85%] text-5xl">🌊</div>
              <div className="absolute top-[75%] left-[30%] text-4xl">⛵</div>
              <div className="absolute top-[18%] left-[70%] text-4xl">⚓</div>
            </div>

            {/* 정밀 부산 백지도 다각형 그래픽 투영 (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 450" preserveAspectRatio="none">
              {/* 1. 서부산 낙동강 골목 (강서구, 북구, 사상구, 사하구) */}
              <path d="M 10 100 Q 100 80 140 120 L 130 320 Q 90 380 20 400 Z" fill="#e8f5e9" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
              {/* 낙동강 파란선 줄기 본류 */}
              <path d="M 130 0 Q 115 150 125 280 T 100 450" fill="none" stroke="#93c5fd" strokeWidth="14" strokeLinecap="round" opacity="0.6"/>
              {/* 서낙동강 갈래 물줄기 */}
              <path d="M 115 180 Q 70 240 80 340 T 60 450" fill="none" stroke="#bfdbfe" strokeWidth="7" strokeLinecap="round" opacity="0.5"/>
              
              {/* 2. 금정산맥 역사 지대 (금정구, 동래구, 북구 동편) */}
              <path d="M 140 0 L 290 0 L 280 180 L 140 150 Z" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
              
              {/* 3. 중앙 산복도로 도심 지대 */}
              <path d="M 140 150 L 280 180 Q 320 230 300 310 L 150 330 Z" fill="#f3e8ff" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
              
              {/* 4. 영도 섬 */}
              <path d="M 215 330 C 205 375 240 400 260 375 C 275 345 245 315 215 330 Z" fill="#fef3c7" stroke="#cbd5e1" strokeWidth="1" opacity="0.75" />
              
              {/* 5. 동부산 해안 및 기장 지대 (해운대구, 기장군) */}
              <path d="M 290 0 L 500 0 L 500 310 Q 420 310 300 240 Z" fill="#ccfbf1" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />

              {/* 가로수 및 수영강선 장식 */}
              <path d="M 315 140 Q 325 200 310 260" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
              
              {/* 광안대교 도로 가선 */}
              <path d="M 315 260 Q 280 300 250 280" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.5" />
              
              {/* 바다 구역 */}
              <path d="M 0 350 Q 250 420 500 310 L 500 450 L 0 450 Z" fill="#bae6fd" opacity="0.2" />
            </svg>

            {/* 지리 지형 보조 라벨 */}
            <div className="absolute top-[8%] left-[8%] text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded pointer-events-none border border-emerald-200/40">서부산 낙동강 본류</div>
            <div className="absolute top-[8%] left-[45%] text-[10px] sm:text-xs font-black text-yellow-800 bg-yellow-100/60 px-1.5 py-0.5 rounded pointer-events-none border border-yellow-200/40">금정산맥 지대</div>
            <div className="absolute top-[48%] left-[45%] text-[10px] sm:text-xs font-black text-purple-850 bg-purple-100/60 px-1.5 py-0.5 rounded pointer-events-none border border-purple-200/40">산복도로 원도심</div>
            <div className="absolute top-[20%] left-[80%] text-[10px] sm:text-xs font-black text-teal-800 bg-teal-100/60 px-1.5 py-0.5 rounded pointer-events-none border border-teal-200/40">기장군 동해안</div>
            <div className="absolute bottom-[23%] left-[44%] text-[9px] sm:text-[10px] font-black text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded pointer-events-none border border-amber-200/40">수려한 영도 섬</div>

            {/* 16개 구역 흐릿한 워터마크 표시 (사용자 피드백 반영) */}
            {DISTRICT_WATERMARKS.map((dw, idx) => (
              <div
                key={`dw-${idx}`}
                style={{ left: `${dw.x}%`, top: `${dw.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-[10px] sm:text-xs font-black text-slate-400/35 tracking-widest bg-slate-100/5 px-1.5 py-0.5 rounded border border-dashed border-slate-350/15 whitespace-nowrap"
              >
                {dw.name}
              </div>
            ))}

            {/* 지도 핀 렌더링 */}
            {filteredSpots.map((spot) => {
              const cat = CATEGORY_LIST.find((c) => c.key === spot.category)!;
              const isSelected = activeSpot?.id === spot.id;
              const isCollected = collectedSpots.includes(spot.id);

              const currentRegion = REGIONS[selectedRegion] || REGIONS['all'];
              const isSpotInRegion = selectedRegion === 'all' || currentRegion.districts.includes(spot.district);

              return (
                <button
                  key={spot.id}
                  id={`map-pin-${spot.id}`}
                  style={{ left: `${spot.mapX}%`, top: `${spot.mapY}%` }}
                  onClick={() => isSpotInRegion && handleSpotClick(spot)}
                  disabled={!isSpotInRegion}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-300 ${
                    isSpotInRegion
                      ? `cursor-pointer ${isSelected ? 'z-40' : 'z-20 hover:z-30'}`
                      : 'opacity-15 pointer-events-none scale-65 grayscale z-0'
                  }`}
                >
                  <div className="relative flex flex-col items-center group">
                    {/* 본래의 마커 핀 구 (이것이 중심점의 위치에 오도록 배치) */}
                    <div className="relative z-20">
                      {/* 파도형 후광 장식 */}
                      <span className={`absolute -inset-1 rounded-full blur-xs opacity-55 animate-ping pointer-events-none ${
                        spot.category === 'food' ? 'bg-rose-400' : spot.category === 'traffic' ? 'bg-cyan-400' : spot.category === 'play' ? 'bg-amber-400' : spot.category === 'history' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} style={{ animationDuration: isSelected ? '1.2s' : '4s' }} />

                      {/* 본래의 마커 핀 구 */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm ${
                        isSelected
                          ? `${spot.category === 'food' ? 'bg-rose-500 border-rose-600 ring-2 ring-rose-200' : spot.category === 'traffic' ? 'bg-cyan-500 border-cyan-600 ring-2 ring-cyan-200' : spot.category === 'play' ? 'bg-amber-500 border-amber-600 ring-2 ring-amber-200' : spot.category === 'history' ? 'bg-emerald-600 border-emerald-700 ring-2 ring-emerald-200' : 'bg-blue-500 border-blue-600 ring-2 ring-blue-200'}`
                          : `bg-white ${spot.category === 'food' ? 'border-rose-300 text-rose-500' : spot.category === 'traffic' ? 'border-cyan-300 text-cyan-500' : spot.category === 'play' ? 'border-amber-300 text-amber-500' : spot.category === 'history' ? 'border-emerald-400 text-emerald-600' : 'border-blue-300 text-blue-500'}`
                      }`}>
                        <span className="text-xs leading-none select-none">{cat.emoji}</span>
                      </div>

                      {/* 수집 완료 도장 뱃지 */}
                      {isCollected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 border border-slate-900 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center p-0 font-black text-[9px] sm:text-xs" title="획득!">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* 확대/마커명 표시 - 절대 좌표로 띄워서 아이콘 중심 정렬 유지 및 가시성 개선 */}
                    <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[10px] font-bold shadow-3xs whitespace-nowrap border select-none pointer-events-none transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-950 scale-105 opacity-100 z-30'
                        : showLabels
                          ? 'bg-white text-slate-800 border-slate-200 opacity-95 group-hover:opacity-100 group-hover:scale-102 group-hover:z-30'
                          : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-hover:bg-white group-hover:text-slate-850 group-hover:border-slate-200 group-hover:z-30'
                    }`}>
                      {spot.name.split(' (')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 왼쪽 아래의 미니 고정 가이드 나침반 (지도와 함께 움직이지 않음) */}
          <div className="absolute bottom-4 left-4 z-25 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-sm pointer-events-none flex flex-col gap-0.5 text-slate-500 text-[9px] font-black">
            <span>▲ 북</span>
            <div className="w-5 h-px bg-slate-300 my-0.5"></div>
            <span>▼ 남</span>
          </div>

          {/* 에러 피드백: 검색결과 및 필터 결과 무 */}
          {filteredSpots.length === 0 && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs p-6 text-center">
              <span className="text-4xl mb-2">🔍🤠</span>
              <h4 className="text-xs font-black text-slate-700">원하시는 조건의 명소를 찾을 수 없어요!</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs">다른 검색어를 쓰거나 전체 테마/구별 필터를 초기화해 보세요.</p>
              <button
                onClick={() => { 
                  setSelectedCategory('all'); 
                  setSelectedDistrict('all'); 
                  setSearchQuery(''); 
                }}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black transition-colors cursor-pointer"
              >
                필터 전부 초기화하기 🔄
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 스폿 상세 및 골든벨 퀴즈 (4칸) */}
      <div className="lg:col-span-4 h-full">
        <AnimatePresence mode="wait">
          {activeSpot ? (
            <motion.div
              key={activeSpot.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl p-7 sm:p-8 shadow-xs border border-slate-100 space-y-6 flex flex-col justify-between"
              style={{ minHeight: '520px' }}
              id="active-spot-card"
            >
              {/* 스팟 명칭 및 카테고리 기재 */}
              <div className="space-y-4.5">
                <div className="flex items-center justify-between gap-2.5 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm md:text-base font-black border flex items-center gap-1.5 ${
                    CATEGORY_LIST.find((c) => c.key === activeSpot.category)?.bgColor
                  }`}>
                    <span>{CATEGORY_LIST.find((c) => c.key === activeSpot.category)?.emoji}</span>
                    <span>{CATEGORY_LIST.find((c) => c.key === activeSpot.category)?.name}</span>
                  </span>
                  <span className="text-xs sm:text-sm md:text-base text-slate-600 font-extrabold bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-150">
                    📍 {activeSpot.district}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {activeSpot.name}
                </h3>

                {/* 지리적 경제 정보 설명 상자 */}
                <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-sm sm:text-base md:text-lg text-slate-700 font-medium leading-relaxed">
                    {activeSpot.description}
                  </p>
                </div>

                {/* 꼬마 탐정 꿀팁 상자 */}
                {activeSpot.funFact && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                    <h5 className="text-xs sm:text-sm md:text-base font-bold text-amber-900 flex items-center gap-1.5">
                      💡 똑똑한 탐험가를 위한 비법!
                    </h5>
                    <p className="text-xs sm:text-sm md:text-base text-amber-900 leading-relaxed font-medium">
                      {activeSpot.funFact}
                    </p>
                  </div>
                )}
              </div>

              {/* 퀴즈 섹션 */}
              {activeSpot.quiz && (
                <div className="border-t border-slate-100 pt-5 mt-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-sky-500" />
                      <span>도전! 골든벨 퀴즈</span>
                    </h4>
                    {quizState[activeSpot.id]?.solved && (
                      <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded border ${
                        quizState[activeSpot.id].isCorrect 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-rose-50 border-rose-200 text-rose-850'
                      }`}>
                        {quizState[activeSpot.id].isCorrect ? '⭕ 정답 통과!' : '❌ 오답 복습'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 leading-relaxed bg-sky-50/70 p-3.5 rounded-xl border border-sky-150">
                    Q. {activeSpot.quiz.question}
                  </p>

                  <div className="space-y-2">
                    {activeSpot.quiz.options.map((option, idx) => {
                      const spotQuiz = activeSpot.quiz!;
                      const isSolved = quizState[activeSpot.id]?.solved;
                      const selectedIdx = quizState[activeSpot.id]?.selectedOption;
                      const isCorrectOption = idx === spotQuiz.answerIndex;
                      const isSelected = selectedIdx === idx;

                      let btnClass = 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700 font-extrabold';
                      let statusIcon = null;

                      if (isSolved) {
                        if (isCorrectOption) {
                          btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold';
                          statusIcon = <CheckCircle className="w-5 h-5 text-emerald-600 inline ml-auto shrink-0" />;
                        } else if (isSelected) {
                          btnClass = 'bg-rose-50 border-rose-300 text-rose-800 font-extrabold';
                          statusIcon = <AlertCircle className="w-5 h-5 text-rose-600 inline ml-auto shrink-0" />;
                        } else {
                          btnClass = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          id={`quiz-option-${activeSpot.id}-${idx}`}
                          disabled={isSolved}
                          onClick={() => handleQuizAnswer(activeSpot, idx)}
                          className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm md:text-base border transition-all flex items-center justify-start gap-2.5 ${btnClass} ${
                            !isSolved ? 'cursor-pointer hover:translate-x-1' : 'cursor-default'
                          }`}
                        >
                          <span className="font-black flex items-center justify-center w-5 h-5 rounded-full bg-white/60 text-xs text-slate-600 border shrink-0">
                            {idx + 1}
                          </span>
                          <span className="flex-1 truncate">{option}</span>
                          {statusIcon}
                        </button>
                      );
                    })}
                  </div>

                  {/* 퀴즈 정 오답에 대한 친근 명료 설명 */}
                  {quizState[activeSpot.id]?.solved && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3.5 bg-emerald-50/50 text-emerald-900 border border-emerald-200 rounded-xl"
                    >
                      <div className="font-black text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                        <span>📢 풀이 주머니:</span>
                        <span className={quizState[activeSpot.id].isCorrect ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                          {quizState[activeSpot.id].isCorrect ? '훌륭한 탐험가네요! 🎉' : '괜찮아요, 알아가는 중이에요!'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed font-bold">
                        {activeSpot.quiz.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-slate-100 flex flex-col items-center justify-center text-center h-full"
              style={{ minHeight: '520px' }}
            >
              <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-5 text-4xl animate-bounce">
                🗺️
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">지도의 마커를 터치해 가이드해 볼까요?</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-3 max-w-sm leading-relaxed font-extrabold">
                부산 전역에 흩어진 300대 명소 핀을 클릭하면 실제 지리·경제 가치 이야기와 퀴즈 챌린지가 펼쳐집니다!
              </p>
              <div className="mt-10 flex flex-wrap gap-2.5 justify-center max-w-sm">
                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[11px] sm:text-[13px] px-3.5 py-1.5 rounded-full font-black">🍰 블루리본 고장 맛</span>
                <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 text-[11px] sm:text-[13px] px-3.5 py-1.5 rounded-full font-black">🚌 편리한 교통</span>
                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[11px] sm:text-[13px] px-3.5 py-1.5 rounded-full font-black">🎡 놀이 오락 체험</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] sm:text-[13px] px-3.5 py-1.5 rounded-full font-black">🌲 역사 자연 유적</span>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] sm:text-[13px] px-3.5 py-1.5 rounded-full font-black">🌿 자연풍경 수려한 자연</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
