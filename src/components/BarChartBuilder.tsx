/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CategoryKey, RegionKey } from '../types';
import { CATEGORY_LIST, BUSAN_SPOTS, REGIONS } from '../data/busanData';
import { Check, AlertTriangle, LayoutGrid, BarChart3, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';

interface BarChartBuilderProps {
  onCompleteCounts: (counts: Record<CategoryKey, number>) => void;
  savedCounts?: Record<CategoryKey, number> | null;
  selectedRegion: RegionKey;
  tableCounts: Record<CategoryKey, number>;
  onUpdateTableCounts: (counts: Record<CategoryKey, number>) => void;
}

type RenderMode = 'bar' | 'block';

export default function BarChartBuilder({
  onCompleteCounts,
  savedCounts,
  selectedRegion,
  tableCounts,
  onUpdateTableCounts,
}: BarChartBuilderProps) {
  const currentRegion = REGIONS[selectedRegion] || REGIONS['all'];
  // 모둠이 고른 구역별 실제 카테고리별 정답 개수를 동적으로 계산
  const regionSpots = BUSAN_SPOTS.filter(s => 
    selectedRegion === 'all' || currentRegion.districts.includes(s.district)
  );
  
  const CURRENT_REAL_COUNTS: Record<CategoryKey, number> = {
    food: regionSpots.filter(s => s.category === 'food').length,
    traffic: regionSpots.filter(s => s.category === 'traffic').length,
    play: regionSpots.filter(s => s.category === 'play').length,
    history: regionSpots.filter(s => s.category === 'history').length,
    beach: regionSpots.filter(s => s.category === 'beach').length,
  };

  // 사용자가 입력한 개수 상태 - 1단계 표 기록 데이터와 완벽 연동
  const [counts, setCounts] = useState<Record<CategoryKey, number>>({
    food: tableCounts.food ?? savedCounts?.food ?? 0,
    traffic: tableCounts.traffic ?? savedCounts?.traffic ?? 0,
    play: tableCounts.play ?? savedCounts?.play ?? 0,
    history: tableCounts.history ?? savedCounts?.history ?? 0,
    beach: tableCounts.beach ?? savedCounts?.beach ?? 0,
  });

  // 부모의 tableCounts가 바뀌거나 구역이 바뀌었을 때 counts 상태 초기화 연동
  useEffect(() => {
    setCounts({
      food: tableCounts.food,
      traffic: tableCounts.traffic,
      play: tableCounts.play,
      history: tableCounts.history,
      beach: tableCounts.beach,
    });
  }, [tableCounts]);

  useEffect(() => {
    if (savedCounts) {
      setCounts(savedCounts);
    } else {
      setHasChecked(false);
      setIsCorrect(false);
    }
  }, [selectedRegion, savedCounts]);

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>('bar');
  const [barDecoration, setBarDecoration] = useState<'normal' | 'cookie' | 'star'>('normal');

  // 눈금 크기 탐구 상태 (1, 2, 5 중 선택 가능 및 실시간 수학 가이드 멘트)
  const [stepSize, setStepSize] = useState<'1' | '2' | '5'>('5');
  const [stepFeedback, setStepFeedback] = useState('');

  // 개수 직접/증감 입력 핸들러 - 입력 변경 시 즉시 상위 표 상태와도 동기화
  const handleCountChange = (key: CategoryKey, val: number) => {
    const nextVal = Math.min(Math.max(val, 0), 35); // 가장 많은 값 35로 상향 조정
    const newCounts = { ...counts, [key]: nextVal };
    setCounts(newCounts);
    onUpdateTableCounts(newCounts); // 상위 tableCounts 실시간 동기화
    setHasChecked(false); // 재입력 시 다시 채점 대기
  };

  // 정답 평가
  const handleCheckAnswers = () => {
    let allMatch = true;
    for (const key of Object.keys(CURRENT_REAL_COUNTS) as CategoryKey[]) {
      if (counts[key] !== CURRENT_REAL_COUNTS[key]) {
        allMatch = false;
      }
    }
    setIsCorrect(allMatch);
    setHasChecked(true);

    if (allMatch) {
      onCompleteCounts(counts); // 3단계 발표 보드 잠금 해제
    }
  };

  // 자동 채우기 도우미 제거 완료 (학생들이 직접 해보는 경험 중심 유지)

  // 눈금 크기 변경에 따른 멘트 업데이트 연동 (피드백)
  useEffect(() => {
    const maxCount = Math.max(...Object.values(CURRENT_REAL_COUNTS));
    if (stepSize === '5') {
      if (maxCount >= 15) {
        setStepFeedback(
          `👏 대단해요! 우리 모둠이 선택한 구역의 가장 많은 명소 수치가 ${maxCount}개이므로, 눈금 한 칸의 크기를 5개로 정하는 것이 축척을 가장 알맞게 배정하여 깔끔하고 쉽게 비교하기에 아주 적절합니다.`
        );
      } else {
        setStepFeedback(
          `⚠️ 한번 더 생각해 볼까요? 우리 구역의 가장 많은 값이 단 ${maxCount}개밖에 되지 않는데 눈금을 5개 단위로 잡으면, 모든 막대 기둥이 겨우 1~2칸 밑에 납작하게 누워버려서 서로 크기가 잘 비교되지 않는답니다. 이 경우에는 1이나 2를 권장해요!`
        );
      }
    } else if (stepSize === '2') {
      if (maxCount >= 10 && maxCount < 20) {
        setStepFeedback(
          `👏 완벽해요! 우리 구역의 가장 많은 값이 ${maxCount}개이므로 세로축 눈금 한 칸을 2칸씩 묶는 것이 보기에도 선명하고 그래프 크기가 직관적으로 눈에 잘 들어와 아주 기막힌 선택입니다.`
        );
      } else if (maxCount >= 20) {
        setStepFeedback(
          `⚠️ 조금 복잡해요! 우리 구역의 가장 많은 값이 ${maxCount}개라 눈금을 2개 단위로 쪼개면 눈금을 무려 ${Math.ceil(maxCount / 2)}칸 이상 그려야 하므로 세로축이 지나치게 길어져서 한눈에 담가 보기 영 조심스럽답니다.`
        );
      } else {
        setStepFeedback(
          `👏 훌륭해요! 가장 많은 값이 ${maxCount}개로 아담해 눈금 한 칸을 2로 두면 썩 깔끔한 그래프가 완성됩니다.`
        );
      }
    } else { // stepSize === '1'
      if (maxCount <= 8) {
        setStepFeedback(
          `👏 대단해요! 우리 구역은 명소 수량이 적어 가장 많은 값이 단 ${maxCount}개이므로, 눈금 크기를 상세하게 1개씩 꼼꼼히 표시해 주는 것이 정확도를 최고로 살려 비교하기 적절한 신의 한 수입니다.`
        );
      } else {
        setStepFeedback(
          `❌ 오, 그건 너무 빼곡해요! 우리 구역의 가장 많은 값이 ${maxCount}개인데 눈금 크기를 1개씩 나누면 Y축 눈금을 수십 개 이상 빼곡히 다 그려야 해서, 그래프 본래의 장점인 '한눈에 수치 견주어보기' 효과가 무뎌집니다.`
        );
      }
    }
  }, [stepSize, selectedRegion]);

  // 눈금 크기(1, 2, 5)에 따라 세로 눈금 및 가장 많은 값을 똑똑하고 유연하게 자동 설계
  const stepValue = Number(stepSize);
  const maxCount = Math.max(...(Object.values(counts) as number[]), 1);
  
  // maxVal은 세로축 눈금에 딱 맞게 떨어지는 가장 큰 값
  let maxVal = Math.ceil(maxCount / stepValue) * stepValue;
  
  // Y축 높이가 너무 납작해지는 것(예: 눈금 칸수가 5개 미만)을 방지하기 위해 최소 5칸 확보
  if (maxVal / stepValue < 5) {
    maxVal = stepValue * 5;
  }
  
  // 동적 세로축 눈금 생성
  const yTicks: number[] = [];
  for (let val = maxVal; val >= 0; val -= stepValue) {
    yTicks.push(val);
  }

  return (
    <div className="space-y-6" id="barchart-builder-section">
      {/* 아침 미션 약점 오답 대시보드 힌트 박스 */}
      <div className="bg-indigo-950 text-purple-100 py-4.5 px-6 rounded-2xl text-sm sm:text-base md:text-lg font-bold flex flex-col xl:flex-row items-center gap-3 shadow-md border border-indigo-900">
        <span className="bg-yellow-400 text-indigo-950 px-3 py-1 rounded-lg text-xs sm:text-sm font-black animate-pulse shrink-0">
          💡 AIDT 아침 약점 피드백
        </span>
        <p className="text-left leading-relaxed">
          우리 4학년 5반은 아침 미션에서 <strong className="underline text-yellow-300">"자료에 알맞은 눈금 한 칸의 크기 정하기"</strong> 문항 오답률이 35%로 가장 높았습니다! Y축 눈금을 1개, 2개, 5개 중 어떤 것으로 선택해야 보기에 깔끔할지 직접 분석해 보세요.
        </p>
      </div>

      {/* 안내 교구판 */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 justify-center md:justify-start">
            <span>📊</span>
            <span>[활동 2] 스마트 막대그래프 융합 빌더</span>
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-bold leading-relaxed max-w-2xl">
            1단계 지도에서 직접 파악하고 분류한 테마별 수치를 빈칸에 기재해 주세요. <br />
            개수 수치에 맞춤화해 막대그래프 기둥이 실시간으로 조율되며, 아이들의 자주적 통계 이해도를 높여줍니다 ✨
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 왼쪽: 학생 직접 숫자 입력 테이블 (5칸) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-5">
          
          {/* 수학 탐구: 눈금 크기 정하기 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="block text-sm sm:text-base md:text-lg font-black text-slate-805 mb-3">
              📏 [수학 탐구] 세로 눈금 한 칸의 크기를 얼마로 선택할까요?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: '1', label: '눈금 1개' },
                { value: '2', label: '눈금 2개' },
                { value: '5', label: '눈금 5개(추천)' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border text-xs sm:text-sm font-black cursor-pointer transition-all ${
                    stepSize === opt.value
                      ? 'bg-slate-800 border-slate-900 text-white shadow-3xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-655'
                  }`}
                >
                  <input
                    type="radio"
                    name="stepSize"
                    value={opt.value}
                    checked={stepSize === opt.value}
                    onChange={(e: any) => setStepSize(e.target.value)}
                    className="sr-only"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* 실시간 탐정 멘트 박스 */}
            <div className="mt-4 bg-indigo-50 border border-indigo-150 p-4 sm:p-5 rounded-xl text-sm sm:text-base md:text-lg leading-relaxed text-indigo-955 font-bold">
              📢 윤아 쌤의 수학 꿀팁: {stepFeedback}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1">
              <span>✏️</span>
              <span>수집한 개수를 입력해 보세요</span>
            </h4>
            <span className="text-xs sm:text-sm text-slate-600 font-bold">최대 35개까지</span>
          </div>

          {/* 입력 폼 리스트 */}
          <div className="space-y-3.5">
            {CATEGORY_LIST.map((cat) => {
              const currentVal = counts[cat.key];
              const isWrong = hasChecked && currentVal !== CURRENT_REAL_COUNTS[cat.key];

              return (
                <div
                  key={cat.key}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isWrong
                      ? 'bg-rose-50 border-rose-300 animate-shake'
                      : 'bg-slate-50/60 border-slate-150 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none bg-white w-10 h-10 rounded-full shadow-3xs flex items-center justify-center border border-slate-100">
                      {cat.emoji}
                    </span>
                    <div>
                      <h5 className="text-sm sm:text-base font-black text-slate-850">{cat.name}</h5>
                      <span className="text-xs sm:text-sm text-slate-505 font-bold">{cat.stamp} 마커 아이콘</span>
                    </div>
                  </div>

                  {/* 수치 조정 증감 박스 */}
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-250 shrink-0">
                    <button
                      onClick={() => handleCountChange(cat.key, currentVal - 1)}
                      className="w-9 h-9 rounded-lg bg-slate-55 hover:bg-slate-100 text-slate-705 font-black text-base flex items-center justify-center cursor-pointer border border-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={currentVal === 0 ? '' : currentVal}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value);
                        handleCountChange(cat.key, isNaN(parsed) ? 0 : parsed);
                      }}
                      placeholder="0"
                      className="w-10 text-center font-black text-slate-850 bg-transparent text-sm sm:text-base focus:outline-none"
                    />
                    <button
                      onClick={() => handleCountChange(cat.key, currentVal + 1)}
                      className="w-9 h-9 rounded-lg bg-slate-55 hover:bg-slate-100 text-slate-705 font-black text-base flex items-center justify-center cursor-pointer border border-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 space-y-3">
            <button
              onClick={handleCheckAnswers}
              className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base transition-shadow flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isCorrect
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-600 text-white'
              }`}
            >
              {isCorrect ? <Check className="w-5 h-5 animate-bounce" /> : '📊'}
              <span>막대그래프 정답 확인 및 채점하기</span>
            </button>

            {hasChecked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-start gap-3 border ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-950'
                    : 'bg-rose-50 border-rose-250 text-rose-955'
                }`}
              >
                {isCorrect ? (
                  <>
                    <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                     <div className="space-y-0.5">
                       <h6 className="text-sm sm:text-base font-black text-emerald-900">정확도 100%! 개수를 모두 맞췄습니다! 🎉</h6>
                       <p className="text-xs sm:text-sm md:text-base leading-relaxed font-bold text-emerald-800">
                         이제 수학 막대그래프 결과를 활용해 방문객과 관광객 분들에게 멋지게 제안할 논리를 만들러 3단계 발표 보드장으로 떠나볼까요?
                       </p>
                     </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                     <div className="space-y-0.5">
                       <h6 className="text-sm sm:text-base font-black text-rose-900">앗! 일치하지 않는 숫자가 있어요! 🧐</h6>
                       <p className="text-xs sm:text-sm md:text-base leading-relaxed font-bold text-rose-800">
                         빨갛게 표시된 카테고리의 개수를 다시 조심히 세어가며 정정해 보아요. 1단계 지도를 확대해서 개수를 세어보면 편리합니다!
                       </p>
                     </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 오른쪽 막대그래프 시각화 교구 (7칸) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base md:text-lg flex items-center gap-1.5">
                <span>🎨</span>
                <span>우리 교실 막대그래프 보드</span>
              </h4>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 font-bold">숫자에 따라 막대가 즉각적으로 멋지게 자라나며 한눈에 비교됩니다.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                <button
                  onClick={() => setRenderMode('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black cursor-pointer transition-all ${
                    renderMode === 'bar' ? 'bg-white text-slate-805 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  막대 모드
                </button>
                <button
                  onClick={() => setRenderMode('block')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black cursor-pointer transition-all ${
                    renderMode === 'block' ? 'bg-white text-slate-805 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  블록 쌓기
                </button>
              </div>

              {renderMode === 'bar' && (
                <select
                  value={barDecoration}
                  onChange={(e: any) => setBarDecoration(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-black text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer hover:bg-slate-100 border border-slate-250"
                >
                  <option value="normal">🎨 기본 막대</option>
                  <option value="cookie">🍬 알탕 막대</option>
                  <option value="star">⭐ 별빛 막대</option>
                </select>
              )}
            </div>
          </div>

          {/* 그래프 캔버스 그리기 */}
          <div className="relative w-full aspect-[16/10] bg-slate-50/40 rounded-2xl border border-slate-100 p-4">
            {/* 세로축 가이드 */}
            <div className="absolute top-4 bottom-14 left-8 right-2 flex flex-col justify-between pointer-events-none">
              {yTicks.map((num) => {
                const shouldShowLabel = yTicks.length <= 15 || num % 5 === 0 || num === maxVal || num === 0;
                return (
                  <div key={num} className="w-full flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-600 w-5 text-right select-none">
                      {shouldShowLabel ? num : ''}
                    </span>
                    <div className="flex-1 border-t border-dashed border-slate-250" />
                  </div>
                );
              })}
            </div>

            {/* 실제 막대 기둥 그리드 */}
            <div className="absolute top-4 bottom-14 left-16 right-2 grid grid-cols-5 gap-3.5 items-end">
              {CATEGORY_LIST.map((cat) => {
                const countVal = counts[cat.key];
                // 실제 입력 갯수와 Y축 기준값에 따른 높이 퍼센트 (최대 30 기준)
                const heightPercentage = Math.min((countVal / maxVal) * 100, 100);

                return (
                  <div key={cat.key} className="h-full flex flex-col justify-end items-center relative">
                    
                    {/* 상단 펄쩍 뛰는 수치 뱃지 */}
                    {countVal > 0 && (
                      <div className="absolute -top-7 select-none">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-black text-white shadow-3xs ${
                          cat.key === 'food' ? 'bg-rose-500' : cat.key === 'traffic' ? 'bg-cyan-500' : cat.key === 'play' ? 'bg-amber-500' : cat.key === 'history' ? 'bg-emerald-600' : 'bg-blue-500'
                        }`}>
                          {countVal}개
                        </span>
                      </div>
                    )}

                    {renderMode === 'bar' ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ type: 'spring', damping: 16 }}
                        className={`w-full max-w-[36px] rounded-t-lg relative overflow-hidden flex flex-col justify-end ${
                          cat.key === 'food' ? 'bg-gradient-to-t from-rose-400 to-rose-300' : cat.key === 'traffic' ? 'bg-gradient-to-t from-cyan-400 to-cyan-300' : cat.key === 'play' ? 'bg-gradient-to-t from-amber-400 to-amber-300' : cat.key === 'history' ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' : 'bg-gradient-to-t from-blue-400 to-blue-300'
                        }`}
                        style={{ minHeight: countVal > 0 ? '6px' : '0' }}
                      >
                        {barDecoration === 'cookie' && (
                          <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-around items-center opacity-45 pointer-events-none">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span key={i} className="text-[10px] select-none">🟡</span>
                            ))}
                          </div>
                        )}
                        {barDecoration === 'star' && (
                          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.75)_0.8px,_transparent_0.8px)] bg-[size:6px_6px] opacity-45" />
                        )}
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-white/40" />
                      </motion.div>
                    ) : (
                      /* 쌓아올리기 블록 모드 (1개 블록당 가치 3~5개 환산 혹은 실제 스탬프) */
                      <div className="w-full flex flex-col justify-end items-center gap-1 overflow-y-auto max-h-[85%] pr-0.5">
                        {countVal > 0 ? (
                          Array.from({ length: countVal }).map((_, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0, y: 10 }}
                              animate={{ scale: 1, y: 0 }}
                              transition={{ delay: idx * 0.015 }}
                              className={`w-6 h-4 sm:w-8 sm:h-5 rounded-xs flex items-center justify-center border text-[10px] font-black shadow-3xs shrink-0 ${
                                cat.key === 'food' ? 'bg-rose-100 border-rose-350 text-rose-700' : cat.key === 'traffic' ? 'bg-cyan-100 border-cyan-300 text-cyan-705' : cat.key === 'play' ? 'bg-amber-100 border-amber-300 text-amber-700' : cat.key === 'history' ? 'bg-emerald-100 border-emerald-300 text-emerald-705' : 'bg-blue-100 border-blue-305 text-blue-700'
                              }`}
                            >
                              {cat.stamp}
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-[10px] text-slate-300 font-bold border border-dashed border-slate-200 w-6 h-4 sm:w-8 sm:h-5 rounded-xs flex items-center justify-center bg-white">
                            0
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 바닥선 */}
            <div className="absolute bottom-13 left-6 right-2 border-b-2 border-slate-400" />
          </div>

          {/* X축 카테고리 레이블 */}
          <div className="grid grid-cols-5 gap-3.5 left-16 right-2 relative text-center">
            {CATEGORY_LIST.map((cat) => (
              <div key={cat.key} className="flex flex-col items-center">
                <span className="text-base select-none mb-0.5">{cat.emoji}</span>
                <span className="text-sm sm:text-base font-black text-slate-700 block line-clamp-1">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
