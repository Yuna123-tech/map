/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CategoryKey, QuizState, PresentationState, RegionKey } from './types';
import { BUSAN_SPOTS, REGIONS, REGION_LIST, CATEGORY_LIST } from './data/busanData';
import BusanMap from './components/BusanMap';
import BarChartBuilder from './components/BarChartBuilder';
import PresentationAssistant from './components/PresentationAssistant';
import { BookOpen, Sparkles, Compass, BarChart3, Award, RefreshCw, CheckCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 활성 단계: 1(지도 탐색), 2(그래프 가설), 3(발표 보드)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // 모둠별 관심 조사 구역 상태 추가
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('all');
  // 수집한 스팟 목록
  const [collectedSpots, setCollectedSpots] = useState<string[]>([]);
  // 퀴즈 푼 상태 목록
  const [quizState, setQuizState] = useState<QuizState>({});
  // 학생들이 1단계 표 작성 코너에서 기록하는 수치
  const [tableCounts, setTableCounts] = useState<Record<CategoryKey, number>>({
    food: 0,
    traffic: 0,
    play: 0,
    history: 0,
    beach: 0,
  });
  const [tableChecked, setTableChecked] = useState(false);
  const [tableCorrect, setTableCorrect] = useState(false);
  // 학생들이 검증 완료한 수치
  const [verifiedCounts, setVerifiedCounts] = useState<Record<CategoryKey, number> | null>(null);
  // 저장된 최종 발표 상태
  const [presentation, setPresentation] = useState<PresentationState | null>(null);

  // 커스텀 컨펌 모달 창 상태 (iFrame 내 window.confirm 대안)
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRegionConfirm, setShowRegionConfirm] = useState<RegionKey | null>(null);

  // 로컬 저장소 동기화
  useEffect(() => {
    const savedRegion = localStorage.getItem('busan_selected_region') as RegionKey;
    const savedCollected = localStorage.getItem('busan_collected_spots');
    const savedQuiz = localStorage.getItem('busan_quiz_state');
    const savedCounts = localStorage.getItem('busan_verified_counts');
    const savedTableCounts = localStorage.getItem('busan_table_counts');
    const savedPresentation = localStorage.getItem('busan_presentation_state');

    if (savedRegion && REGIONS[savedRegion]) {
      setSelectedRegion(savedRegion);
    } else {
      setSelectedRegion('all');
    }
    if (savedCollected) setCollectedSpots(JSON.parse(savedCollected));
    if (savedQuiz) setQuizState(JSON.parse(savedQuiz));
    if (savedCounts) setVerifiedCounts(JSON.parse(savedCounts));
    if (savedTableCounts) setTableCounts(JSON.parse(savedTableCounts));
    if (savedPresentation) setPresentation(JSON.parse(savedPresentation));
  }, []);

  const handleRegionChange = (region: RegionKey) => {
    setShowRegionConfirm(region);
  };

  const executeRegionChange = (region: RegionKey) => {
    setSelectedRegion(region);
    localStorage.setItem('busan_selected_region', region);
    // 수치 검증 상태 및 테이블 입력 상태 초기화
    setVerifiedCounts(null);
    localStorage.removeItem('busan_verified_counts');
    const resetCounts = { food: 0, traffic: 0, play: 0, history: 0, beach: 0 };
    setTableCounts(resetCounts);
    localStorage.setItem('busan_table_counts', JSON.stringify(resetCounts));
    setTableChecked(false);
    setTableCorrect(false);
    setShowRegionConfirm(null);
  };

  const handleCollectSpot = (spotId: string) => {
    if (!collectedSpots.includes(spotId)) {
      const nextSpots = [...collectedSpots, spotId];
      setCollectedSpots(nextSpots);
      localStorage.setItem('busan_collected_spots', JSON.stringify(nextSpots));
    }
  };

  const handleSolveQuiz = (spotId: string, answerIndex: number, isCorrect: boolean) => {
    const nextQuiz = {
      ...quizState,
      [spotId]: { solved: true, isCorrect, selectedOption: answerIndex },
    };
    setQuizState(nextQuiz);
    localStorage.setItem('busan_quiz_state', JSON.stringify(nextQuiz));
    
    // 퀴즈를 맞추거나 풀면 자동으로 해당 spot 수집 인정
    handleCollectSpot(spotId);
  };

  const handleUpdateTableCounts = (newCounts: Record<CategoryKey, number>) => {
    setTableCounts(newCounts);
    localStorage.setItem('busan_table_counts', JSON.stringify(newCounts));
  };

  const handleCompleteCounts = (counts: Record<CategoryKey, number>) => {
    setVerifiedCounts(counts);
    localStorage.setItem('busan_verified_counts', JSON.stringify(counts));
  };

  const handleSavePresentation = (state: PresentationState) => {
    setPresentation(state);
    localStorage.setItem('busan_presentation_state', JSON.stringify(state));
  };

  // 탐험 상태 초기화
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    setCollectedSpots([]);
    setQuizState({});
    setVerifiedCounts(null);
    setTableCounts({ food: 0, traffic: 0, play: 0, history: 0, beach: 0 });
    setTableChecked(false);
    setTableCorrect(false);
    setPresentation(null);
    setActiveStep(1);
    localStorage.clear();
    setShowResetConfirm(false);
  };

  const quizSolvedCount = Object.keys(quizState).length;
  const correctQuizCount = Object.values(quizState).filter((q: any) => q && q.isCorrect).length;

  // 선택된 구역에 들어가는 명소 목록 필터링
  const currentRegion = REGIONS[selectedRegion] || REGIONS['all'];
  const currentRegionSpots = BUSAN_SPOTS.filter(s => 
    selectedRegion === 'all' || currentRegion.districts.includes(s.district)
  );
  // 현재 구역에서 수집 완료된 명소 개수
  const regionCollectedCount = collectedSpots.filter(id => 
    currentRegionSpots.some(s => s.id === id)
  ).length;

  // 구역별 실제 카테고리별 명소 통계 동적 획득
  const getRealRegionCounts = (): Record<CategoryKey, number> => {
    return {
      food: currentRegionSpots.filter(s => s.category === 'food').length,
      traffic: currentRegionSpots.filter(s => s.category === 'traffic').length,
      play: currentRegionSpots.filter(s => s.category === 'play').length,
      history: currentRegionSpots.filter(s => s.category === 'history').length,
      beach: currentRegionSpots.filter(s => s.category === 'beach').length,
    };
  };
  const realRegionCounts = getRealRegionCounts();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-100 font-sans" id="applet-container">
      {/* 귀여운 물결 그라데이션 가로선 */}
      <div className="h-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-400" />

      {/* 헤더 바 */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-150 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* 타이틀 명가 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-505 to-sky-600 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-sm transform hover:rotate-6 transition-transform">
              <span className="text-xl select-none">🧭</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-indigo-100 text-indigo-850 text-xs md:text-sm font-black px-2.5 py-1 rounded-full select-none">
                  🏫 {presentation?.teamName ? `👥 ${presentation?.teamName} 모둠` : '🏫 초등 4학년 활기찬 교실'}
                </span>
                <span className="bg-sky-100 text-sky-900 text-xs md:text-sm font-black px-2.5 py-1 rounded-full select-none">
                  사회 · 수학 융합 교과
                </span>
              </div>
              <h1 className="text-sm md:text-base lg:text-xl font-black text-slate-800 tracking-tight mt-1 animate-fade-in flex items-center gap-1">
                <span>막대그래프로 소개하는 부산 100대 명소 지리 지도</span>
                <Sparkles className="w-4.5 h-4.5 text-sky-500 animate-pulse shrink-0" />
              </h1>
            </div>
          </div>

          {/* 스코어 리포트 대시보드 */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
              <div className="text-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-extrabold leading-none">
                  {(REGIONS[selectedRegion] || REGIONS['all']).emoji} 조사 범위 발견율
                </p>
                <p className="text-xs sm:text-sm md:text-base font-black text-slate-850 mt-1.5">
                  🔑 <span className="text-indigo-650 font-black">{regionCollectedCount}</span> / {currentRegionSpots.length} <span className="text-[10px] md:text-xs text-slate-500">곳</span>
                </p>
              </div>
              <div className="h-6 w-px bg-slate-250" />
              <div className="text-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-extrabold leading-none">골든벨 점수</p>
                <p className="text-xs sm:text-sm md:text-base font-black text-emerald-600 mt-1.5">💯 {correctQuizCount} / {quizSolvedCount} <span className="text-[10px] md:text-xs text-slate-500 font-bold">개</span></p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-650 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer shadow-3xs"
              title="모든 조사 데이터를 처음으로 초기화합니다"
            >
              <RefreshCw className="w-4 h-4" />
              <span>🎒 처음부터 다시 조사 (초기화)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 실시간 이정표 (스텝 가이드) */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-5 flex-1 space-y-5">
        
        {/* 모둠별 조사 범위(권역) 커스텀 선택 장치 (고민 완벽 해결책) */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-150/80 shadow-3xs hover:shadow-2xs transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-850 flex items-center gap-2">
                <span className="p-1 px-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs md:text-sm">활동 조율</span>
                <span>우리 모둠의 관심 탐색 구역(조사 범위)을 정해 볼까요? 🎒🌎</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-650 font-semibold mt-1">
                구역을 정하면 지도에 해당 명소들이 선명해지고, <strong>각 권역의 고유한 지리 통계에 따라 2단계 막대그래프 목표치(정답 수)와 3단계 발표 자료가 완전히 달라집니다!</strong>
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 rounded-full border border-amber-150 text-xs font-bold text-amber-800">
              <span>💡 모둠별로 서로 다른 구역을 선택하면 더욱 풍부하고 입체적인 공유 발표회가 된답니다!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {REGION_LIST.map((rg) => {
              const isSelected = selectedRegion === rg.key;
              return (
                <button
                  key={rg.key}
                  onClick={() => handleRegionChange(rg.key)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/65 border-indigo-400 ring-2 ring-indigo-200/50 shadow-xs'
                      : 'bg-slate-50/40 border-slate-200/75 hover:bg-slate-50/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl select-none group-hover:scale-110 transition-transform">{rg.emoji}</span>
                    <span className="text-xs sm:text-sm font-black text-slate-850 tracking-tight">{rg.name}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1.5 leading-relaxed line-clamp-2">
                    {rg.description}
                  </p>
                  
                  {/* 정적 구 표시 장식 */}
                  <div className="mt-2 pt-1.5 border-t border-slate-150/60 flex flex-wrap gap-0.5 pointer-events-none">
                    {rg.districts.slice(0, 3).map((dist, dIdx) => (
                      <span key={dIdx} className="text-[9.5px] sm:text-[10px] px-1 bg-white/60 text-slate-650 rounded border border-slate-200/50 font-semibold">
                        {dist.replace('구', '').replace('군', '')}
                      </span>
                    ))}
                    {rg.districts.length > 3 && (
                      <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold">...</span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 👥 1인 1기기 사회-수학 모둠 협동 미션 흐름도 (수업용 쌍방향 길잡이) */}
        <div className="bg-amber-50/40 border border-amber-250 rounded-3xl p-6 shadow-3xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none text-9xl">
            👥
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-150 border border-amber-200 rounded-full text-xs md:text-sm font-black text-amber-950 select-none">
                👥 1인 1기기 사회·수학 모둠 융합학습법
              </span>
              <h3 className="text-base md:text-lg font-black text-amber-950 flex items-center gap-1.5">
                <span>지도가 완성되고 표·그래프 수치가 딱 맞춰지는 4회전 비밀 흐름</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-650 font-bold leading-relaxed">
                각자 자리에 개인 태블릿이나 노트북(1인 1기기)이 있어도, 아래 4단계 미션을 올바르게 따라 하면 수량이 삐뚤어지지 않고 <strong>전체 모둠원이 완벽히 일치하는 아름다운 결과 분석</strong>을 이뤄낼 수 있답니다!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
            {/* Step 1: 구역 통일 */}
            <div className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] ${
              selectedRegion !== 'all'
                ? 'bg-emerald-50/40 border-emerald-250 shadow-3xs'
                : 'bg-white border-slate-205 shadow-2xs'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5.5 h-5.5 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">1</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">모둠 구역 통일</span>
                  </div>
                  {selectedRegion !== 'all' ? (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black border border-emerald-150">일치 성공</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-amber-100 text-amber-850 rounded font-black border border-amber-150 animate-pulse">선택 필수</span>
                  )}
                </div>
                <p className="text-xs text-slate-605 mt-2.5 leading-relaxed font-bold">
                  <strong>먼저 구역을 정해요!</strong> 모둠 친구들과 은밀히 의논하여 위 가로 타일 목록에서 <strong>동일한 관심지(동래, 사하 등)를 다같이 클릭</strong>하여 고정합니다.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-150/50">
                {selectedRegion !== 'all' ? (
                  <p className="text-xs text-emerald-700 font-extrabold">
                    📍 {REGIONS[selectedRegion].emoji} [{REGIONS[selectedRegion].name}] 구역 지정 완료!
                  </p>
                ) : (
                  <p className="text-xs text-rose-600 font-extrabold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>아직 구역이 [전체]입니다. 정해 보세요!</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 2: 공동 수집 지도조사 */}
            <div className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] ${
              regionCollectedCount > 0 && activeStep === 1
                ? 'bg-sky-50/40 border-sky-300 ring-2 ring-sky-100/30'
                : regionCollectedCount === currentRegionSpots.length && currentRegionSpots.length > 0
                ? 'bg-emerald-50/40 border-emerald-250'
                : 'bg-white border-slate-205 opacity-90'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5.5 h-5.5 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">2</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">백지도 공동 조사</span>
                  </div>
                  {regionCollectedCount === currentRegionSpots.length && currentRegionSpots.length > 0 ? (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black border border-emerald-150">수집 100%</span>
                  ) : regionCollectedCount > 0 ? (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-black border border-sky-150 animate-pulse">수집 중</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded font-black border border-slate-200">대기</span>
                  )}
                </div>
                <p className="text-xs text-slate-605 mt-2.5 leading-relaxed font-bold">
                  <strong>표가 똑같이 나옵니다!</strong> 1단계 부산 백지도를 보며 파란색 명소를 터치하고 퀴즈를 풀러 도장을 얻으세요. 모량 표 데이터가 모두에게 똑같이 완성됩니다.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-150/50">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-450">수집 진행:</span>
                  <span className="text-sky-600 font-extrabold">{regionCollectedCount} / {currentRegionSpots.length} 곳</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-sky-500 h-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, currentRegionSpots.length > 0 ? (regionCollectedCount / currentRegionSpots.length) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: 개별 막대 작도 */}
            <div className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] ${
              verifiedCounts
                ? 'bg-emerald-50/40 border-emerald-250'
                : activeStep === 2
                ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-100/30'
                : 'bg-white border-slate-205 opacity-90'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5.5 h-5.5 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">3</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">각자 그래프 그리기</span>
                  </div>
                  {verifiedCounts ? (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black border border-emerald-150">정답 확인</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded font-black border border-slate-200">대기</span>
                  )}
                </div>
                <p className="text-xs text-slate-605 mt-2.5 leading-relaxed font-bold">
                  <strong>각자 기기에서 따로!</strong> 모여진 표의 개수 수치를 2단계 빌더에 기입하고 세로 눈금 한 칸의 양(1, 2, 5)을 직접 고른 뒤, 정답 채점 버튼을 터치해 그래프 검정을 마칩니다.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-150/50">
                {verifiedCounts ? (
                  <p className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                    <span>✨</span>
                    <span>검증 완료! 친구 그래프와 맞대어보세요</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-bold">
                    📊 2단계 빌더에서 작도 대기 중
                  </p>
                )}
              </div>
            </div>

            {/* Step 4: 공동 발표 해석 */}
            <div className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] ${
              presentation
                ? 'bg-indigo-50/40 border-indigo-250 text-indigo-900 shadow-3xs'
                : activeStep === 3
                ? 'bg-indigo-50/20 border-indigo-300 ring-2 ring-indigo-100/30'
                : 'bg-white border-slate-205 opacity-90'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5.5 h-5.5 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">4</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">모여서 대본 쓰기</span>
                  </div>
                  {presentation ? (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-black border border-indigo-150">제출완료</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded font-black border border-slate-200">대기</span>
                  )}
                </div>
                <p className="text-xs text-slate-605 mt-2.5 leading-relaxed font-bold font-semibold">
                  <strong>다시 동그랗게 모여서!</strong> 각자의 그래프가 같음을 확인했다면, 대본 단계로 넘어가서 우리 구역이 품은 최고의 3대 명소 코스를 토의해 가이드 원고를 최종 완성합니다!
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-150/50">
                {presentation ? (
                  <p className="text-xs text-indigo-700 font-extrabold">
                    🎉 《{presentation.themeName}》 제출!
                  </p>
                ) : (
                  <p className="text-xs text-slate-550 font-bold">
                    ✏️ 모둠 3대 명소 의사결정 대본 쓰기
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-3xs border border-slate-100 flex flex-col md:flex-row items-stretch justify-between gap-3">
          
          {/* STEP 1 */}
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all text-slate-700 cursor-pointer ${
              activeStep === 1
                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-100'
                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-3xs ${
              activeStep === 1 ? 'bg-sky-500 text-white' : 'bg-slate-205 text-slate-500'
            }`}>
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-black text-slate-500">STEP 01</span>
                {regionCollectedCount >= Math.min(15, currentRegionSpots.length) && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">🔍 백지도 탐정단</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">지명 확대 탐색 & 상식 퀴즈풀기</p>
            </div>
          </button>

          <div className="hidden md:flex items-center text-slate-300 select-none">➡️</div>

          {/* STEP 2 */}
          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all text-slate-700 cursor-pointer ${
              activeStep === 2
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100'
                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-3xs ${
              activeStep === 2 ? 'bg-amber-500 text-white' : 'bg-slate-205 text-slate-500'
            }`}>
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-black text-slate-500">STEP 02</span>
                {verifiedCounts && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">📊 그래프 빌더</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">눈금 크기 설계 & 막대 기둥 대조</p>
            </div>
          </button>

          <div className="hidden md:flex items-center text-slate-300 select-none">➡️</div>

          {/* STEP 3 */}
          <button
            onClick={() => {
              setActiveStep(3);
            }}
            className={`flex-1 p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all text-slate-700 cursor-pointer ${
              activeStep === 3
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100'
                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-3xs ${
              activeStep === 3 ? 'bg-indigo-500 text-white' : 'bg-slate-205 text-slate-500'
            }`}>
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-black text-slate-500">STEP 03</span>
                {presentation && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">📢 여행 홍보대사</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">수학적 타당성 발표 보드 대본</p>
            </div>
          </button>
        </div>

        {/* 렌더러 전환 */}
        <div className="transition-all duration-200">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <BusanMap
                  onCollectSpot={handleCollectSpot}
                  collectedSpots={collectedSpots}
                  quizState={quizState}
                  onSolveQuiz={handleSolveQuiz}
                  selectedRegion={selectedRegion}
                />

                {/* 📋 [기록지 1단계] 우리 모둠 수집 명소 분류표 (표로 먼저 작성하고 연동하기) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-150/80 shadow-3xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <span>📋</span>
                        <span>[기록지 1단계] 우리 모둠의 관찰 기록지 (구역별 수집 분류표)</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        백지도를 적극 탐색하며 우리 구역 <strong>[{currentRegion.name}]</strong>의 명소 분포를 테마별로 스스로 세어서 표를 완성해 주세요. (아이들이 직접 지도를 보며 하나씩 세어 입력하여 학습 동기를 촉진하는 공간입니다 🔍)
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-[10px] font-extrabold uppercase">
                          <th className="py-2.5 px-4 font-black">탐색 테마</th>
                          <th className="py-2.5 px-4 text-center font-black">장소 스탬프</th>
                          <th className="py-2.5 px-4 text-center font-black">우리가 세어본 분류 개수</th>
                          <th className="py-2.5 px-4 font-black">의견 의사결정 탐정단 코멘트</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150/40 font-semibold text-slate-705">
                        {CATEGORY_LIST.map((cat) => {
                          const count = tableCounts[cat.key] || 0;
                          return (
                            <tr key={cat.key} className="hover:bg-slate-50/20 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-2">
                                <span className="text-xl select-none">{cat.emoji}</span>
                                <span className="font-extrabold text-slate-800 text-xs">{cat.name}</span>
                              </td>
                              <td className="py-3 px-4 text-center text-sm select-none">{cat.stamp}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                  <button
                                    onClick={() => {
                                      const next = Math.max(0, count - 1);
                                      const nextCounts = { ...tableCounts, [cat.key]: next };
                                      handleUpdateTableCounts(nextCounts);
                                      setTableChecked(false);
                                    }}
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center cursor-pointer select-none"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="text"
                                    value={count === 0 ? '' : count}
                                    onChange={(e) => {
                                      const parsed = parseInt(e.target.value);
                                      const next = isNaN(parsed) ? 0 : Math.min(35, Math.max(0, parsed));
                                      const nextCounts = { ...tableCounts, [cat.key]: next };
                                      handleUpdateTableCounts(nextCounts);
                                      setTableChecked(false);
                                    }}
                                    placeholder="0"
                                    className="w-8 text-center font-black text-slate-800 bg-transparent text-xs focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const next = Math.min(35, count + 1);
                                      const nextCounts = { ...tableCounts, [cat.key]: next };
                                      handleUpdateTableCounts(nextCounts);
                                      setTableChecked(false);
                                    }}
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center cursor-pointer select-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[10.5px]">
                                {count > 0 ? (
                                  count === realRegionCounts[cat.key] ? (
                                    <span className="text-emerald-600 font-black flex items-center gap-1">
                                      <span>✓</span> <span>완벽해요! 실제 명소 개수와 정확히 일치합니다.</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">실제 지도와 비교하여 숫자를 맞춰보아요!</span>
                                  )
                                ) : (
                                  <span className="text-slate-350 font-normal">개수 파악 대기 중</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          let matches = true;
                          for (const key of Object.keys(realRegionCounts) as CategoryKey[]) {
                            if (tableCounts[key] !== realRegionCounts[key]) {
                              matches = false;
                            }
                          }
                          setTableChecked(true);
                          setTableCorrect(matches);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs"
                      >
                        🔎 작성한 관찰 기록표 채점 및 검정하기
                      </button>

                      {tableChecked && (
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
                          tableCorrect 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          {tableCorrect 
                            ? '🎉 오예! 우리 모둠의 분류표 숫자가 실제 명소 수량과 100% 완벽하게 일치합니다!' 
                            : '🧐 앗, 분류표 숫자와 실제 지명 명소 수량이 다른 곳이 있어요! 다시 세어보세요.'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        let matches = true;
                        for (const key of Object.keys(realRegionCounts) as CategoryKey[]) {
                          if (tableCounts[key] !== realRegionCounts[key]) {
                            matches = false;
                          }
                        }
                        handleCompleteCounts(tableCounts);
                        setActiveStep(2);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      <span>2단계 그래프 그리기로 연동 ➡️</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <BarChartBuilder
                  onCompleteCounts={handleCompleteCounts}
                  savedCounts={verifiedCounts}
                  selectedRegion={selectedRegion}
                  tableCounts={tableCounts}
                  onUpdateTableCounts={handleUpdateTableCounts}
                />
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <PresentationAssistant
                  counts={verifiedCounts || realRegionCounts}
                  onSavePresentation={handleSavePresentation}
                  savedPresentation={presentation}
                  selectedRegion={selectedRegion}
                  collectedSpots={collectedSpots}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 교육적 배움 팁 상자 */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-6xl opacity-5 select-none pointer-events-none">
            🎓
          </div>
          <div className="relative space-y-3.5 max-w-4xl">
            <h4 className="text-sm font-extrabold flex items-center gap-1.5 text-indigo-300">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
              <span>함께 배우는 장소 중심 사회수업 가이드 🏫👩‍🏫</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-bold leading-relaxed text-slate-300">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                <h5 className="font-extrabold text-white flex items-center gap-1">
                  <span>🗺️</span>
                  <span>1단계: 왜 행정구역(구)과 테마를 엮을까요?</span>
                </h5>
                <p>
                  부산 전역의 지리적 자원(낙동강 삼각주, 금정산맥, 산복도로 역사지, 기장 동해연안)을 5개 고유 범주로 분류함으로써 명소의 분포 특징인 <strong>공간적 규칙성을 확인하고 깊은 장소감</strong>을 형성할 수 있기 때문입니다.
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                <h5 className="font-extrabold text-white flex items-center gap-1">
                  <span>📊</span>
                  <span>2단계: 막대그래프 의사결정의 이점</span>
                </h5>
                <p>
                  단순 데이터 나열보다, 높낮이가 뚜렷한 막대그래프로 가공하면 <strong>수량 크기를 한눈에 견주어 보기 용이</strong>합니다. 또한 한정된 가이드 여행 일정(자원의 희소성) 내에서 최적의 추천 코스를 만드는 객관성을 길러 줍니다.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-sky-250 italic font-black text-center mt-2.5">
              &quot;우리는 부산 탐정단이자 똑똑한 막대 모델링 전문가입니다. 친구들과 함께 전 세계 모든 방문객 친구들에게 멋진 소개를 보내봅시다!&quot;
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 (메이드 윤아 기재) */}
      <footer className="bg-white border-t border-slate-150 py-4 text-center text-slate-400 text-[10px] font-bold">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 made by 윤아 · 초등 4학년 사회 · 수학 융합 교재</p>
          <p className="text-slate-350 font-semibold">
            아름다운 부산을 찾은 전 세계 모든 방문객 친구들의 기분 좋은 발자국을 응원합니다 🏖️🧭
          </p>
        </div>
      </footer>

      {/* 📍 구역 변경 커스텀 컨펌 모달 (iFrame 완벽 지원) */}
      <AnimatePresence>
        {showRegionConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center text-2xl mx-auto animate-bounce">
                🧭
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-850">
                  🏫 조사 범위를 [{REGIONS[showRegionConfirm].name}]으로 바꿀까요?
                </h3>
                <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  조사 구역을 변경하시면 이전에 완료한 2단계 막대그래프의 정답 통계가 새로운 구역에 맞추어 자동으로 다시 설계됩니다. <br />
                  <span className="text-indigo-600 font-extrabold">(💡 단, 이미 획득한 퀴즈도장과 수집 명소 기록은 안전하게 유지됩니다!)</span>
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowRegionConfirm(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => executeRegionChange(showRegionConfirm)}
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs"
                >
                  바꿀게요! 🧭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎒 탐험 초기화 커스텀 컨펌 모달 (iFrame 완벽 지원) */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-xl max-w-sm w-full p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto animate-pulse">
                🎒
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-rose-950">
                  정말로 처음부터 다시 조사할까요?
                </h3>
                <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  모든 데이터가 리셋됩니다!<br />
                  지금까지 수집한 지도 명소 스탬프와 모둠이 함께 준비한 멋진 발표 보드 대본 기록이 지워집니다.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  계속 탐험하기
                </button>
                <button
                  onClick={executeReset}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs"
                >
                  새로 시작할래요
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
