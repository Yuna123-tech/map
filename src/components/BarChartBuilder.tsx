/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CategoryKey, RegionKey } from '../types';
import { CATEGORY_LIST, BUSAN_SPOTS, REGIONS } from '../data/busanData';
import { Check, AlertTriangle, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';

interface BarChartBuilderProps {
  onCompleteCounts: (counts: Record<CategoryKey, number>) => void;
  savedCounts?: Record<CategoryKey, number> | null;
  selectedRegion: RegionKey;
  tableCounts: Record<CategoryKey, number>;
  onUpdateTableCounts: (counts: Record<CategoryKey, number>) => void;
}

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

  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [barDecoration, setBarDecoration] = useState<'normal' | 'cookie' | 'star'>('normal');
  const [stepSize, setStepSize] = useState<string>('2');
  const [stepFeedback, setStepFeedback] = useState<string>('');

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
          `⚠️ 한번 더 생각해 볼까요? 우리 구역의 가장 많은 명소 수치는 ${maxCount}개로 크지 않아서, 눈금 한 칸을 5개 단위로 성큼 성큼 표현하면 막대 간의 미세한 수량 차이를 눈으로 견주기 어려워져요. 눈금을 더 좁게 골라보세요!`
        );
      }
    } else if (stepSize === '2') {
      if (maxCount >= 8 && maxCount <= 22) {
        setStepFeedback(
          `👏 훌륭해요! 가장 많은 값이 ${maxCount}개로 적당하여, 눈금 한 칸을 2개 단위로 그리면 미세형상 비교와 한눈에 전반을 보기에 최적의 배치가 됩니다.`
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

  // 눈금 크기(1, 2, 5)에 따라 세로 눈금 및 가장 많은 값을 유연하게 자동 설계
  const stepValue = Number(stepSize);
  const maxCountVal = Math.max(...(Object.values(counts) as number[]), 1);
  
  // maxVal은 세로축 눈금에 딱 맞게 떨어지는 가장 큰 값
  let maxVal = Math.ceil(maxCountVal / stepValue) * stepValue;
  
  // Y축 높이가 너무 납작해지는 것을 방지하기 위해 최소 5칸 확보
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
      {/* 재미있는 수학 그래프 설계 판넬 상단 */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>📊</span>
            <span>2단계: 우리 구역 통계 자료로 나만의 그래프 만들기</span>
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 font-bold leading-relaxed">
            1단계 탐험을 통해 우리가 찾아낸 자랑스러운 지명 분류 개수 통계를 바탕으로, 세로축 눈금 크기를 설계하고 완벽한 수학 막대그래프 대조표를 손수 올려 보아요! 🧭✏️
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 왼쪽 패널 (5칸): 정답 입력 및 눈금 설계 */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 space-y-6">
          {/* 수학 탐구: 눈금 크기 정하기 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="block text-xs sm:text-sm md:text-base font-black text-slate-900 mb-3">
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
                  className={`flex items-center justify-center gap-1 p-3 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-all ${
                    stepSize === opt.value
                      ? 'bg-slate-800 border-slate-900 text-white shadow-3xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
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
            <div className="mt-4 bg-indigo-50 border border-indigo-150 p-5 rounded-xl text-sm sm:text-base md:text-lg leading-relaxed text-indigo-950 font-bold">
              📢 윤아 쌤의 수학 꿀팁: {stepFeedback}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-1.5">
              <span>✏️</span>
              <span>수집한 개수를 입력해 보세요</span>
            </h4>
            <span className="text-sm sm:text-base text-slate-600 font-bold">최대 35개까지</span>
          </div>

          {/* 입력 폼 리스트 */}
          <div className="space-y-4">
            {CATEGORY_LIST.map((cat) => {
              const currentVal = counts[cat.key];
              const isWrong = hasChecked && currentVal !== CURRENT_REAL_COUNTS[cat.key];

              return (
                <div
                  key={cat.key}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    isWrong
                      ? 'bg-rose-50 border-rose-350 animate-shake'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl leading-none bg-white w-12 h-12 rounded-full shadow-3xs flex items-center justify-center border border-slate-200 shrink-0">
                      {cat.emoji}
                    </span>
                    <div>
                      <h5 className="text-base sm:text-lg md:text-xl font-black text-slate-900">{cat.name}</h5>
                      <span className="text-xs sm:text-sm md:text-base text-slate-500 font-bold">지도에서 파란색 [{cat.stamp}] 도장 세기</span>
                    </div>
                  </div>

                  {/* 수치 조정 증감 박스 */}
                  <div className="flex items-center gap-2.5 bg-white p-1.5 rounded-xl border border-slate-300 shrink-0">
                    <button
                      onClick={() => handleCountChange(cat.key, currentVal - 1)}
                      className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer border border-slate-200 active:scale-95 transition-transform"
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
                      className="w-12 text-center font-black text-slate-900 bg-transparent text-base sm:text-lg md:text-xl focus:outline-none"
                    />
                    <button
                      onClick={() => handleCountChange(cat.key, currentVal + 1)}
                      className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg flex items-center justify-center cursor-pointer border border-slate-200 active:scale-95 transition-transform"
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
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-955'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
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
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 font-bold">숫자를 적으면 막대가 마법처럼 쑥쑥 자라나 한눈에 비교됩니다! 📈</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={barDecoration}
                onChange={(e: any) => setBarDecoration(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs sm:text-sm font-black text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer hover:bg-slate-100 shadow-3xs"
              >
                <option value="normal">🎨 기본 막대</option>
                <option value="cookie">🍬 알탕 막대</option>
                <option value="star">⭐ 별빛 막대</option>
              </select>
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
                    <div className="flex-1 border-t border-dashed border-slate-305" />
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
                <span className="text-sm sm:text-base select-none mb-0.5">{cat.emoji}</span>
                <span className="text-[10px] sm:text-sm md:text-base font-black text-slate-700 block line-clamp-1">
                  <span className="hidden sm:inline">{cat.name}</span>
                  <span className="inline sm:hidden">{cat.shortName || cat.name}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
