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
  // 1단계 분류표 내 모둠별 코멘트/메모 보드 상태
  const [tableMemos, setTableMemos] = useState<Record<CategoryKey, string>>({
    food: '',
    traffic: '',
    play: '',
    history: '',
    beach: '',
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
  
  // 모둠 협동 가이드 아코디언 상태
  const [showGuide, setShowGuide] = useState(false);

  // 로컬 저장소 동기화
  useEffect(() => {
    const savedRegion = localStorage.getItem('busan_selected_region') as RegionKey;
    const savedCollected = localStorage.getItem('busan_collected_spots');
    const savedQuiz = localStorage.getItem('busan_quiz_state');
    const savedCounts = localStorage.getItem('busan_verified_counts');
    const savedTableCounts = localStorage.getItem('busan_table_counts');
    const savedTableMemos = localStorage.getItem('busan_table_memos');
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
    if (savedTableMemos) setTableMemos(JSON.parse(savedTableMemos));
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
    const resetMemos = { food: '', traffic: '', play: '', history: '', beach: '' };
    setTableMemos(resetMemos);
    localStorage.setItem('busan_table_memos', JSON.stringify(resetMemos));
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

  const handleUpdateTableMemos = (key: CategoryKey, text: string) => {
    const nextMemos = { ...tableMemos, [key]: text };
    setTableMemos(nextMemos);
    localStorage.setItem('busan_table_memos', JSON.stringify(nextMemos));
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
    setTableMemos({ food: '', traffic: '', play: '', history: '', beach: '' });
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

  // activeStep에 따른 동적 배경 테마 클래스 지정 (창 전환 분위기 인지 돕기)
  const getStepBgClass = () => {
    switch (activeStep) {
      case 1:
        return 'from-sky-50/80 via-slate-50 to-sky-50/40';
      case 2:
        return 'from-amber-100/50 via-slate-50 to-amber-50/20';
      case 3:
        return 'from-indigo-100/50 via-slate-50 to-purple-50/35';
      default:
        return 'from-slate-50 via-slate-50 to-slate-50';
    }
  };

  // activeStep에 따른 페이지네이션 및 워크북 테마 스타일 맵
  const getPaginationStyles = () => {
    switch (activeStep) {
      case 1:
        return {
          wrapper: 'bg-sky-100/40 border-2 border-sky-300 text-sky-950',
          btnPrev: 'bg-white text-slate-800 border-sky-300 hover:bg-sky-50 shadow-3xs active:scale-95',
          btnNext: 'bg-white text-slate-800 border-sky-450 hover:bg-sky-50 shadow-3xs active:scale-95',
          num1: 'bg-sky-500 text-white shadow-md ring-4 ring-sky-100 scale-110',
          num2: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num3: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          lineColor: 'bg-sky-200',
          underline: 'decoration-sky-500'
        };
      case 2:
        return {
          wrapper: 'bg-amber-100/60 border-2 border-amber-355 text-amber-955',
          btnPrev: 'bg-white text-slate-800 border-sky-450 hover:bg-sky-50 shadow-3xs active:scale-95',
          btnNext: 'bg-white text-slate-800 border-indigo-400 hover:bg-indigo-50 shadow-3xs active:scale-95',
          num1: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num2: 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 scale-110',
          num3: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          lineColor: 'bg-amber-200',
          underline: 'decoration-amber-500'
        };
      case 3:
        return {
          wrapper: 'bg-indigo-100/60 border-2 border-indigo-300 text-indigo-950',
          btnPrev: 'bg-white text-slate-800 border-amber-450 hover:bg-amber-50 shadow-3xs active:scale-95',
          btnNext: 'bg-white text-slate-800 border-indigo-305 hover:bg-indigo-50 shadow-3xs active:scale-95',
          num1: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num2: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num3: 'bg-indigo-500 text-white shadow-md ring-4 ring-indigo-100 scale-110',
          lineColor: 'bg-indigo-200',
          underline: 'decoration-indigo-500'
        };
      default:
        return {
          wrapper: 'bg-slate-100 border-2 border-slate-300 text-slate-800',
          btnPrev: 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50',
          btnNext: 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50',
          num1: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num2: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          num3: 'bg-white border-2 border-slate-250 text-slate-600 hover:bg-slate-100',
          lineColor: 'bg-slate-100',
          underline: 'decoration-slate-500'
        };
    }
  };
  const theme = getPaginationStyles();

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getStepBgClass()} flex flex-col justify-between selection:bg-purple-100 font-sans transition-all duration-700 ease-in-out`} id="applet-container">
      {/* 귀여운 물결 그라데이션 가로선 */}
      <div className="h-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-400" />

      {/* 헤더 바 */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col xl:flex-row items-center justify-between gap-6">
          
          {/* 타이틀 명가 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-600 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-md transform hover:rotate-6 transition-transform shrink-0">
              <span className="text-4xl select-none">🧭</span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-indigo-100 text-indigo-805 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full select-none shadow-3xs">
                  🏫 {presentation?.teamName ? `👥 ${presentation?.teamName} 모둠` : '초등 4학년 활기찬 교실'}
                </span>
                <span className="bg-sky-100 text-sky-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full select-none shadow-3xs">
                  사회 · 수학 융합 교과
                </span>
              </div>
              <h1 className="text-sm min-[400px]:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-slate-900 tracking-tight mt-3 animate-fade-in flex items-center gap-1.5 whitespace-nowrap overflow-x-auto no-scrollbar">
                <span>막대그래프로 소개하는 부산 300대 명소 지리 지도</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 animate-pulse shrink-0" />
              </h1>
            </div>
          </div>

          {/* 스코어 리포트 대시보드 */}
          <div className="flex items-center gap-4 text-sm md:text-base flex-wrap xl:flex-nowrap shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl shadow-3xs shrink-0 select-none">
              <div className="text-center min-w-[110px]">
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-none mb-1.5 whitespace-nowrap">
                  {(REGIONS[selectedRegion] || REGIONS['all']).emoji} 조사 범위 발견율
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-slate-800 whitespace-nowrap">
                  🔑 <span className="text-indigo-600 font-black">{regionCollectedCount}</span> / {currentRegionSpots.length} <span className="text-xs text-slate-400 font-normal">곳</span>
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 self-center" />
              <div className="text-center min-w-[95px]">
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-none mb-1.5 whitespace-nowrap">전체 수집한 명소</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-700 whitespace-nowrap">⭐ <span className="text-emerald-700 font-black">{collectedSpots.length}</span> / {BUSAN_SPOTS.length} <span className="text-xs text-slate-400 font-normal">곳</span></p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-3xs shrink-0 whitespace-nowrap"
              title="모든 조사 데이터를 처음으로 초기화합니다"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow shrink-0" />
              <span>🎒 처음부터 다시 조사 (초기화)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">

        {/* 👥 모둠 협동 미션 흐름 가이드 (기본 접힘, 상단 우선 배치) */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 md:p-6 shadow-3xs transition-all mb-4">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-left cursor-pointer focus:outline-none gap-3 animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl select-none">👥</span>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-amber-955 flex items-center gap-2 flex-wrap">
                  <span>모둠 친구들과 함께 공부하는 방법</span>
                  <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-black shrink-0">1인 1기기 협동 미션</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 font-extrabold mt-1">
                  모둠 친구들과 협동하여 지도를 정하고, 그래프를 그린 뒤 발표 대본을 같이 완성해 보세요!
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-black text-amber-950 select-none bg-amber-100/90 hover:bg-amber-200/90 px-4 py-2 rounded-xl border border-amber-300 shrink-0 self-start sm:self-auto shadow-3xs">
              {showGuide ? '접기 🔼' : '공부 순서 보기 🔽'}
            </span>
          </button>

          {showGuide && (
            <div className="mt-5 pt-5 border-t border-amber-200 transition-all space-y-6">
              {/* 🏫 오늘의 디지털 수학 사회 지형 융합 수업 흐름도 (도입 ➡️ 전개 ➡️ 정리) */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs border border-slate-700 animate-fade-in">
                <h4 className="text-sm sm:text-base font-black text-indigo-300 flex items-center gap-2 select-none mb-3.5">
                  <span>🏫 오늘의 수업 흐름 한 눈에 보기</span>
                  <span className="bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">도입 - 전개 - 정리 약속</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* 도입 */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-505 bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-black select-none">도입 🎯</span>
                        <strong className="text-xs sm:text-sm font-extrabold text-white">중요 개념 같이 짚기</strong>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed mt-2.5">
                        선생님과 함께 AIDT 단원평가에서 한 번 더 확인하고 싶은 내용이나, 많은 학생들이 헷갈려했던 핵심 오답 및 필수 그래프 개념들을 다 같이 칠판에서 짚어보고 탐험을 시작해요!
                      </p>
                    </div>
                  </div>

                  {/* 전개 */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-black select-none">전개 🗺️</span>
                        <strong className="text-xs sm:text-sm font-extrabold text-white">수집 ➡️ 종이 작도 ➡️ 대조</strong>
                      </div>
                      <ol className="text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed mt-2.5 list-decimal list-inside space-y-1.5">
                        <li>모둠에서 고른 구역의 백지도를 보며 숨겨진 스탬프 개수를 꼼꼼히 분류표에 조사해요.</li>
                        <li><strong className="text-rose-400">✨ 필수 미션!! 2쪽으로 가기 전에, 각자 준비된 종이 학습지(공책/스케치북)에 자 대고 직접 직접 손으로 그리기!</strong></li>
                        <li>디지털 빌더로 대치하여 정답 채점합니다.</li>
                        <li>가장 많은/적은 곳의 비교 해석 대본을 쓰고 보드에 올립니다.</li>
                      </ol>
                    </div>
                  </div>

                  {/* 정리 */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-black select-none">정리 ✍️</span>
                        <strong className="text-xs sm:text-sm font-extrabold text-white">AIDT 형성평가 해결</strong>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-305 text-slate-300 font-semibold leading-relaxed mt-2.5">
                        협동 작전을 완벽하게 마친 뒤 AIDT 코너로 이동해 오늘의 형성평가를 해결해요! 빨리 공부를 마친 멋쟁이 대원들은 AI 추천 추가 문제를 한 걸음 더 풀어 봅니다!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4개 세부 협동 공부 순서지 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {/* Step 1: 구역 통일 */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                  selectedRegion !== 'all' ? 'bg-emerald-50/80 border-emerald-300 shadow-3xs' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-rose-105 pb-2">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-black flex items-center justify-center shrink-0">1</span>
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-950">모둠 구역 정하기</span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-2.5 leading-relaxed">
                      친구들과 의논해서 동일한 관심 구역(예: 동래, 수영 등)을 정해 <strong>위에서 똑같이</strong> 눌러주세요.
                    </p>
                  </div>
                  <p className="mt-2 text-center">
                    {selectedRegion !== 'all' ? (
                      <span className="text-emerald-800 bg-emerald-100/50 px-1 py-1.5 rounded-lg border border-emerald-300 block text-center text-[9px] min-[380px]:text-[10px] sm:text-xs lg:text-[9.5px] xl:text-[11px] 2xl:text-xs font-bold tracking-tighter whitespace-nowrap" title={`📍 [${REGIONS[selectedRegion].name}] 선택 완료!`}>
                        📍 [{REGIONS[selectedRegion].name}] 선택 완료!
                      </span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-1 py-1.5 rounded-lg border border-rose-200 animate-pulse block text-center text-[9px] min-[380px]:text-[10px] sm:text-xs lg:text-[9.5px] xl:text-[11px] 2xl:text-xs font-bold tracking-tighter whitespace-nowrap">
                        ⚠️ 위에서 구역을 골라보세요!
                      </span>
                    )}
                  </p>
                </div>

                {/* Step 2: 공동 수집 지도조사 */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                  regionCollectedCount > 0 ? 'bg-sky-50/80 border-sky-305 shadow-3xs' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-rose-105 pb-2">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-black flex items-center justify-center shrink-0">2</span>
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-950">지도 탐험 & 퀴즈</span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-2.5 leading-relaxed">
                      1단계 부산 지도에서 관심 장소를 골라 터치하여 세부 내용을 탐사하고, 명소 상식 퀴즈를 해결하며 스탬프를 모읍니다.
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-black mt-2 text-sky-850 bg-sky-100/50 px-2.5 py-1 rounded-lg border border-sky-300 text-center">
                    수집 개수: {regionCollectedCount} / {currentRegionSpots.length} 곳
                  </p>
                </div>

                {/* Step 3: 개별 막대 작도 */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                  verifiedCounts ? 'bg-emerald-50/80 border-emerald-300 shadow-3xs' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-rose-105 pb-2">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-black flex items-center justify-center shrink-0">3</span>
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-950">종이 직접 그리기 ✏️</span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-2.5 leading-relaxed">
                      <strong className="text-rose-600 block mb-1">⚠️ 필수 미션:</strong> 2단계 버튼을 눌러 디지털 입력을 대치하기 전에, <strong>개별 공책이나 종이 학습지에 직접 연필과 자로 막대그래프를 직접 완성</strong>하고 나서 이곳에서 검토 채점해 봅니다!
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-black mt-2 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-center">
                    {verifiedCounts ? '✅ 채점 통과 완료!' : '✏️ 종이에 그린 그래프 정답 대조!'}
                  </p>
                </div>

                {/* Step 4: 공동 발표 해석 */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                  presentation ? 'bg-indigo-50/80 border-indigo-305 shadow-3xs' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2.5 border-b border-rose-105 pb-2">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-black flex items-center justify-center shrink-0">4</span>
                      <span className="text-sm sm:text-base md:text-lg font-black text-slate-950">모둠 발표 & 전송</span>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-2.5 leading-relaxed">
                      가장 수치가 큰 부분과 작아 보충이 필요한 지역 명물들을 비교 분석하여 멋진 발표 스크립트 대본을 쓰고, 모둠 협동 공유판에 올려 발표 연습을 시작해 봐요!
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-black mt-2 text-indigo-850 bg-indigo-100/50 px-2.5 py-1 rounded-lg border border-indigo-300 text-center">
                    {presentation ? '🎉 제출 성공! 발표 준비' : '✏️ 3단계에서 대본 쓰기'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-3xs border border-slate-150 flex flex-col md:flex-row items-stretch justify-between gap-3 animate-fade-in animate-once">
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
              activeStep === 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">STEP 01</span>
                {regionCollectedCount >= Math.min(15, currentRegionSpots.length) && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">🔍 백지도 탐정단</h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5">지명 확대 탐색 & 상식 퀴즈풀기</p>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-550">STEP 02</span>
                {verifiedCounts && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-800 mt-0.5">📊 그래프 빌더</h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5">눈금 크기 설계 & 막대 기둥 대조</p>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-550">STEP 03</span>
                {presentation && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 inline" />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-805 mt-0.5">📢 여행 홍보대사</h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-0.5">수학적 타당성 발표 보드 대본</p>
            </div>
          </button>
        </div>

        {/* 📖 어린이 친화적 학습지 책장 넘기기 제어기 (상단) */}
        <div id="workbook-top-pagination" className={`${theme.wrapper} rounded-3xl p-4.5 flex flex-col sm:flex-row items-center justify-between shadow-3xs gap-4 mt-3 animate-fade-in`}>
          <button
            type="button"
            id="book-prev-btn-top"
            disabled={activeStep === 1}
            onClick={() => {
              setActiveStep((prev) => Math.max(1, prev - 1) as any);
              const element = document.getElementById('workbook-top-pagination');
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeStep === 1
                ? 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : theme.btnPrev
            }`}
          >
            <span>◀️ 이전 쪽으로</span>
          </button>

          <div className="flex flex-col items-center gap-1.5 shrink-0 text-center">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="book-page1-btn-top"
                onClick={() => {
                  setActiveStep(1);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num1}`}
              >
                1쪽
              </button>
              <div className={`w-5 h-1 ${theme.lineColor} rounded-full`} />
              <button
                type="button"
                id="book-page2-btn-top"
                onClick={() => {
                  setActiveStep(2);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num2}`}
              >
                2쪽
              </button>
              <div className={`w-5 h-1 ${theme.lineColor} rounded-full`} />
              <button
                type="button"
                id="book-page3-btn-top"
                onClick={() => {
                  setActiveStep(3);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num3}`}
              >
                3쪽
              </button>
            </div>
            <span className="text-[11px] sm:text-xs font-black text-slate-700 select-none">
              총 3단계 중 <strong className={`text-slate-950 font-black text-xs sm:text-sm underline ${theme.underline} decoration-2`}>{activeStep}쪽 ({activeStep === 1 ? '백지도 탐정단' : activeStep === 2 ? '그래프 빌더' : '여행 홍보대사'})</strong>을 학습하는 중이에요!
            </span>
          </div>

          <button
            type="button"
            id="book-next-btn-top"
            disabled={activeStep === 3}
            onClick={() => {
              setActiveStep((prev) => Math.min(3, prev + 1) as any);
              const element = document.getElementById('workbook-top-pagination');
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeStep === 3
                ? 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : theme.btnNext
            }`}
          >
            <span>다음 쪽으로 ▶️</span>
          </button>
        </div>

        {/* 모둠별 조사 범위(권역) 커스텀 선택 장치 (고민 완벽 해결책) */}
        {activeStep === 1 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-150 shadow-3xs hover:shadow-2xs transition-shadow animate-fade-in animate-once">
          <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 flex-wrap">
                <span className="p-1 py-0.5 px-2 bg-indigo-50 text-indigo-750 text-sm rounded-md border border-indigo-150 font-bold shrink-0">활동 1</span>
                <span>모둠의 부산 탐험 조사 범위 선택하기 🧭</span>
              </h3>
              <p className="text-sm text-slate-500 font-bold leading-normal">
                조사 구역을 변경하면 지도의 명소 목록과 통계 대시보드가 실시간 동기화 교정됩니다.
              </p>
            </div>
          </div>

          {/* 전역 통합 조사 단독 특수 배치 */}
          {(() => {
            const allRegion = REGION_LIST.find((rg) => rg.key === 'all');
            if (!allRegion) return null;
            const isSelected = selectedRegion === 'all';
            return (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => handleRegionChange('all')}
                  className={`w-full p-6 sm:p-7 rounded-3xl border-3 text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-50/90 to-sky-50 bg-indigo-50 border-indigo-500 ring-4 ring-indigo-200/50 shadow-md'
                      : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50/90 hover:border-indigo-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4.5">
                      <span className="text-4xl sm:text-5xl select-none group-hover:scale-110 transition-transform shrink-0">🧭</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg sm:text-xl font-black text-indigo-950 tracking-tight">{allRegion.name}</span>
                          <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">전체 조사권역 ⭐</span>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-slate-700 mt-1.5 leading-relaxed">
                          {allRegion.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* 구 표시 장식 */}
                    <div className="pt-2 md:pt-0 flex flex-wrap gap-1 pointer-events-none self-start md:self-center shrink-0">
                      <span className="text-xs px-3 py-1 bg-white text-indigo-700 rounded-xl border border-indigo-200 font-extrabold shadow-3xs">
                        부산 16개 구 · 군 전체 탐험학습용
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
                  )}
                </button>
              </div>
            );
          })()}

          {/* 일반 조사 구역들 (3개씩 그리드 배치) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REGION_LIST.filter((rg) => rg.key !== 'all').map((rg) => {
              const isSelected = selectedRegion === rg.key;
              return (
                <button
                  key={rg.key}
                  type="button"
                  onClick={() => handleRegionChange(rg.key)}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-4 ring-emerald-100 shadow-md'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50/90 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl select-none group-hover:scale-110 transition-transform">{rg.emoji}</span>
                    <span className="text-lg font-black text-slate-900 tracking-tight">{rg.name}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-bold mt-2.5 leading-relaxed line-clamp-3">
                    {rg.description}
                  </p>
                  
                  {/* 구 표시 장식 */}
                  <div className="mt-4 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-1 pointer-events-none">
                    {rg.districts.slice(0, 3).map((dist, dIdx) => (
                      <span key={dIdx} className="text-xs px-2 py-0.5 bg-white text-slate-700 rounded-lg border border-slate-305 font-bold">
                        {dist.replace('구', '').replace('군', '')}
                      </span>
                    ))}
                    {rg.districts.length > 3 && (
                      <span className="text-xs text-slate-500 font-bold px-1.5 py-0.5 bg-slate-100 rounded-lg">+{rg.districts.length - 3}</span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        )}

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
                <div className="bg-white rounded-3xl p-6.5 sm:p-8 border border-slate-150/80 shadow-3xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                        <span>📋</span>
                        <span>[기록지 1단계] 우리 모둠의 관찰 기록지 (구역별 수집 분류표)</span>
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 font-bold mt-2 leading-relaxed">
                        백지도를 적극 탐색하며 우리 구역 <strong className="text-indigo-650">[{currentRegion.name}]</strong>의 명소 분포를 테마별로 스스로 세어서 표를 완성해 주세요. (아이들이 직접 지도를 보며 하나씩 세어 입력하여 학습 동기를 촉진하는 공간입니다 🔍)
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto animate-fade-in">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50/50 text-slate-600 text-xs sm:text-sm font-semibold uppercase">
                          <th className="py-3.5 px-5 font-bold">탐색 테마</th>
                          <th className="py-3.5 px-5 text-center font-bold">장소 스탬프</th>
                          <th className="py-3.5 px-5 text-center font-bold">우리가 세어본 분류 개수</th>
                          <th className="py-3.5 px-5 font-bold">우리 모둠 관찰 메모 및 토의 내용</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700 text-sm sm:text-base">
                        {CATEGORY_LIST.map((cat) => {
                          const count = tableCounts[cat.key] || 0;
                          return (
                            <tr key={cat.key} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-5 flex items-center gap-3">
                                <span className="text-2xl select-none">{cat.emoji}</span>
                                <span className="font-semibold text-slate-800 text-sm sm:text-base">{cat.name}</span>
                              </td>
                              <td className="py-4 px-5 text-center text-sm sm:text-base select-none">{cat.stamp}</td>
                              <td className="py-4 px-5 text-center">
                                <div className="inline-flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                  <button
                                    onClick={() => {
                                      const next = Math.max(0, count - 1);
                                      const nextCounts = { ...tableCounts, [cat.key]: next };
                                      handleUpdateTableCounts(nextCounts);
                                      setTableChecked(false);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base flex items-center justify-center cursor-pointer select-none border border-slate-200"
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
                                    className="w-10 text-center font-bold text-slate-800 bg-transparent text-sm sm:text-base focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const next = Math.min(35, count + 1);
                                      const nextCounts = { ...tableCounts, [cat.key]: next };
                                      handleUpdateTableCounts(nextCounts);
                                      setTableChecked(false);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base flex items-center justify-center cursor-pointer select-none border border-slate-200"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <textarea
                                  value={tableMemos[cat.key] || ''}
                                  onChange={(e) => handleUpdateTableMemos(cat.key, e.target.value)}
                                  placeholder="지도에서 발견한 수치나 모둠 친구들과 이야기 나눈 특징을 메모해 두세요!"
                                  rows={1}
                                  className="w-full text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-indigo-300 focus:outline-none p-2 rounded-xl resize-y placeholder:text-slate-400 font-medium transition-all"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-slate-500 leading-relaxed text-center sm:text-left">
                      🧭 <strong>우리 모둠 관찰 분류 끝!</strong> 분류표의 입력을 모두 마치셨나요? <br />
                      이제 <strong>오른쪽 버튼</strong>을 눌러, 작성한 분류 결과를 2단계 막대그래프 빌더로 넘겨서 실물과 대조 채점해 보아요!
                    </p>

                    <button
                      onClick={() => {
                        handleCompleteCounts(tableCounts);
                        setActiveStep(2);
                      }}
                      className="w-full sm:w-auto px-7 py-4.5 bg-slate-900 hover:bg-black active:scale-95 text-white rounded-2xl text-sm sm:text-base font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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

        {/* 📖 어린이 친화적 학습지 책장 넘기기 제어기 (하단) */}
        <div id="workbook-bottom-pagination" className={`${theme.wrapper} rounded-3xl p-4.5 flex flex-col sm:flex-row items-center justify-between shadow-3xs gap-4 mt-1 animate-fade-in`}>
          <button
            type="button"
            id="book-prev-btn-bottom"
            disabled={activeStep === 1}
            onClick={() => {
              setActiveStep((prev) => Math.max(1, prev - 1) as any);
              const element = document.getElementById('workbook-top-pagination');
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeStep === 1
                ? 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : theme.btnPrev
            }`}
          >
            <span>◀️ 이전 쪽으로</span>
          </button>

          <div className="flex flex-col items-center gap-1.5 shrink-0 text-center">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="book-page1-btn-bottom"
                onClick={() => {
                  setActiveStep(1);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num1}`}
              >
                1쪽
              </button>
              <div className={`w-5 h-1 ${theme.lineColor} rounded-full`} />
              <button
                type="button"
                id="book-page2-btn-bottom"
                onClick={() => {
                  setActiveStep(2);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num2}`}
              >
                2쪽
              </button>
              <div className={`w-5 h-1 ${theme.lineColor} rounded-full`} />
              <button
                type="button"
                id="book-page3-btn-bottom"
                onClick={() => {
                  setActiveStep(3);
                  const element = document.getElementById('workbook-top-pagination');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-10 h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${theme.num3}`}
              >
                3쪽
              </button>
            </div>
            <span className="text-[11px] sm:text-xs font-black text-slate-700 select-none">
              총 3단계 중 <strong className={`text-slate-950 font-black text-xs sm:text-sm underline ${theme.underline} decoration-2`}>{activeStep}쪽 ({activeStep === 1 ? '백지도 탐정단' : activeStep === 2 ? '그래프 빌더' : '여행 홍보대사'})</strong>을 학습하는 중이에요!
            </span>
          </div>

          <button
            type="button"
            id="book-next-btn-bottom"
            disabled={activeStep === 3}
            onClick={() => {
              setActiveStep((prev) => Math.min(3, prev + 1) as any);
              const element = document.getElementById('workbook-top-pagination');
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
              activeStep === 3
                ? 'bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : theme.btnNext
            }`}
          >
            <span>다음 쪽으로 ▶️</span>
          </button>
        </div>

      </main>

      {/* 푸터 (메이드 윤아 기재) */}
      <footer className="bg-white border-t border-slate-150 py-6 text-center text-slate-500 text-xs sm:text-sm font-bold">
        <div className="w-[98%] max-w-[2100px] mx-auto px-4 space-y-1.5">
          <p>© 2026 made by 윤아 · 초등 4학년 사회 · 수학 융합 탐구 활동</p>
          <p className="text-slate-450 font-semibold">
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
