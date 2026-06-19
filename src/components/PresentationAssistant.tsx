import { useState } from 'react';
import { CategoryKey, RegionKey, BusanSpot } from '../types';
import { BUSAN_SPOTS, REGIONS, CATEGORY_LIST } from '../data/busanData';
import { Award, BookOpen, Sparkles, Printer, FileText, CheckCircle, ArrowRight, HelpCircle, Copy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PresentationAssistantProps {
  counts: Record<CategoryKey, number>;
  onSavePresentation?: (state: any) => void;
  savedPresentation?: any;
  selectedRegion: RegionKey;
  collectedSpots?: string[];
}

export default function PresentationAssistant({
  counts,
  selectedRegion,
  collectedSpots = [],
}: PresentationAssistantProps) {
  const [activeTab, setActiveTab] = useState<'max' | 'min'>('max');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'max' ? maxSpeech : minSpeech;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  // 합리적 의사결정 전략 토의판 선택 상태
  const [maxStrategy, setMaxStrategy] = useState<'promote' | 'control' | null>(null);
  const [minStrategy, setMinStrategy] = useState<'develop' | 'preserve' | null>(null);

  const currentRegion = REGIONS[selectedRegion] || REGIONS['all'];
  const regionSpots = BUSAN_SPOTS.filter(s => 
    selectedRegion === 'all' || currentRegion.districts.includes(s.district)
  );

  // 1. 가장 많은 테마 카테고리 판정
  const keys = Object.keys(counts) as CategoryKey[];
  const maxCategoryKey = keys.reduce((a, b) => 
    (counts[a] || 0) >= (counts[b] || 0) ? a : b
  , 'food');

  // 2. 가장 적은 테마 카테고리 판정 (자연 지리적 여건상 해당 구역에 실존 개수가 0개인 카테고리는 건의 대본에서 자동으로 제외되도록 보완)
  const REAL_COUNTS: Record<CategoryKey, number> = {
    food: regionSpots.filter(s => s.category === 'food').length,
    traffic: regionSpots.filter(s => s.category === 'traffic').length,
    play: regionSpots.filter(s => s.category === 'play').length,
    history: regionSpots.filter(s => s.category === 'history').length,
    beach: regionSpots.filter(s => s.category === 'beach').length,
  };

  const validMinKeys = keys.filter(k => (REAL_COUNTS[k] || 0) > 0);
  const minCategoryKey = validMinKeys.length > 0
    ? validMinKeys.reduce((a, b) => (counts[a] || 0) <= (counts[b] || 0) ? a : b, validMinKeys[0])
    : 'history';

  const categoryNames: Record<CategoryKey, string> = {
    food: '맛있는 음식 (먹거리)',
    traffic: '편리한 교통 (정거장과 길)',
    play: '재밌는 놀거리 (체험)',
    history: '역사와 배움 (박물관과 유적)',
    beach: '아름다운 자연 (바다와 공원)',
  };

  const categoryEmojis: Record<CategoryKey, string> = {
    food: '🍕',
    traffic: '🚇',
    play: '🎡',
    history: '🏛️',
    beach: '🌿',
  };

  // 구역 내 카테고리별 구체적 장소 추천 리스트 (실시간 맵핑)
  const getMaxSpotsList = () => {
    const spots = regionSpots.filter(s => s.category === maxCategoryKey);
    if (spots.length === 0) return '우리가 발견할 고장 명소';
    return spots.slice(0, 3).map(s => s.name.split(' (')[0]).join(', ');
  };

  const getMinSpotsList = () => {
    const spots = regionSpots.filter(s => s.category === minCategoryKey);
    if (spots.length === 0) return '지도의 보석처럼 숨은 골목';
    return spots.slice(0, 3).map(s => s.name.split(' (')[0]).join(', ');
  };

  const maxSpotsList = getMaxSpotsList();
  const minSpotsList = getMinSpotsList();

  // 가장 많은 개수를 자랑하기 대본 (초등학교 4학년 맞춤형 쉬운 발표 대본!)
  const maxSpeech = `안녕하세요! 저희는 우리 고장을 직접 조사하고 그래프로 공부한 《우리 모둠》입니다. 친구들에게 우리 동네의 멋진 매력을 가득 소개해 드릴게요!

우리가 발표할 주제는 《우리 구역에서 가장 으뜸가는 '${categoryNames[maxCategoryKey]}' 탐험 여행!》입니다.

우리가 이 주제를 정한 이유는 수학 시간과 사회 시간에 배운 대로, 지도 속 장소들을 표로 정리하고 막대그래프로 직접 그려보았기 때문이에요. 그래프 기둥을 눈으로 열심히 비교해보니, 우리 구역은 다른 곳보다 '${categoryEmojis[maxCategoryKey]} ${categoryNames[maxCategoryKey]}' 장소가 총 ${counts[maxCategoryKey]}곳으로 제일 많았답니다!

그래서 저희 모둠은 우리 고장의 가장 큰 자랑거리를 친구들에게 널리 알리기로 결정했습니다. 특히 추천하고 싶은 유명한 곳은 바로 [${maxSpotsList}]에요!
우리 고장의 멋진 보물들을 더 아끼고 깨끗하게 가꿔서, 더 많은 사람들이 우리 동네에 놀러 와서 행복해지면 좋겠습니다. 저희가 그린 막대그래프와 발표를 들어주셔서 정말 고맙습니다. 지금까지 우리 모둠이었습니다!`;

  // 가장 적은 개수를 보완하기 대본 (초등학교 4학년 맞춤형 쉬운 제안 대본!)
  const minSpeech = `안녕하세요! 저희는 우리 동네 구석구석이 다 함께 사이좋고 골고루 행복해지기를 바라는 마음으로 발표를 준비한 《우리 모둠》입니다.

우리가 정한 제안 제목은 《동네의 숨은 보물을 함께 지켜요! 아름다운 균형 여행》입니다.

우리가 이 제안을 하게 된 이유는, 우리 동네 명소들을 분류하고 막대그래프로 그려보면서 기둥 높이가 유독 낮은 곳을 발견했기 때문이에요. 분석해본 결과, 우리 구역에는 '${categoryEmojis[minCategoryKey]} ${categoryNames[minCategoryKey]}' 관련 장소가 단 ${counts[minCategoryKey]}곳밖에 없어서 다른 동네보다 조금 부족하다는 것을 알았답니다.

그래서 저희 모둠은 '우리 동네 어린이들과 주민들 모두가 어디서나 편리하고 재밌게 지낼 수 있어야 한다'고 생각했어요. 비록 지금은 숫자가 적지만, 숨겨진 예쁜 곳인 [${minSpotsList}] 주변을 더 안전하고 깨끗하게 다듬어서 소중하게 지켜나가면 좋겠습니다. 동네가 더 살기 좋게 변할 수 있도록 모두 함께 힘을 모아주세요! 우리 모둠의 따뜻한 꿈이 담긴 발표를 귀 기울여 들어주셔서 고맙습니다!`;

  return (
    <div className="space-y-6" id="presentation-assistant-section">
      {/* 스테이지 간판 */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 select-none font-black pointer-events-none">
          📢
        </div>
        <div className="relative space-y-3.5 max-w-3xl">
          <span className="bg-white/20 text-white border border-white/20 text-sm sm:text-base font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
            🎤 3단계: 우리 모둠 발표 대본 완성하기
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
            부산 {{all: '각 구역', north: '북부 구역🌲', west: '서부 구역🌅', south: '남부 구역⚓', haeundae: '해운대 구역🏖️', dongnae: '동래 구역♨️', gijang_suyeong: '기장/수영 구역🌉'}[selectedRegion]} 여행 홍보대사 대본실 🧭
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-indigo-100 font-semibold leading-relaxed">
            막대그래프 결과를 활용해 우리 구역의 매력을 어떻게 소개할지 모둠 친구들과 직접 결정을 내려 보는 단계예요! <br />
            <strong className="underline text-yellow-300">아래의 대본 예시와 의사결정 기록지</strong>를 참고하여, 실제 스케치북에 그래프를 채워 넣고 멋지게 발표해 볼까요?
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* 우리 모둠 전용 Dynamic 발표 예시 대본 */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <h4 className="font-extrabold text-slate-850 text-lg sm:text-xl md:text-2xl flex items-center gap-1.5 animate-pulse">
                  <span>💡</span>
                  <span>[실시간 분류표 연동] 우리 구역 맞춤형 발표 대본 예시</span>
                </h4>
                <p className="text-sm sm:text-base text-slate-500 mt-1 font-bold">
                  1단계에서 직접 채운 수량이 연동되어 아주 구체적인 발표 예시글이 완성됩니다.
                </p>
              </div>

              {/* 클립보드 복사 & 인쇄 버튼 */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-black">
                <button
                  onClick={handleCopy}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm sm:text-base font-black transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-3xs"
                  title="스피치 복사하기"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-emerald-650 animate-bounce" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? '복사 성공!' : '스피치 복사'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3 bg-indigo-50 hover:bg-indigo-120 text-indigo-800 rounded-xl text-sm sm:text-base font-black transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-100 shadow-3xs"
                  title="발표 가이드 인쇄"
                >
                  <Printer className="w-5 h-5" />
                  <span>인쇄하기</span>
                </button>
              </div>
            </div>

            {/* 전략 탭 전환기 */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-150">
              <button
                onClick={() => setActiveTab('max')}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black transition-all cursor-pointer ${
                  activeTab === 'max'
                    ? 'bg-white border-slate-205 text-indigo-950 shadow-3xs border-2'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-2xl">📈</span>
                <span className="flex flex-col items-start leading-none text-left">
                  <span className="text-sm sm:text-base md:text-lg font-black">가장 많은 곳 자랑하기</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1">우리 동네의 자랑거리 발표대본</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('min')}
                className={`flex items-center justify-center gap-2 py-4 rounded-xl font-black transition-all cursor-pointer ${
                  activeTab === 'min'
                    ? 'bg-white border-slate-205 text-purple-950 shadow-3xs border-2'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="text-2xl">🌱</span>
                <span className="flex flex-col items-start leading-none text-left">
                  <span className="text-sm sm:text-base md:text-lg font-black">가장 적은 곳 더 채우기</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1">부족한 곳을 아끼는 제안대본</span>
                </span>
              </button>
            </div>

            {/* 실시간 대본 거울 말풍선 */}
            <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-dashed border-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 select-none text-rose-500/10 text-9xl">
                {activeTab === 'max' ? '📣' : '🏡'}
              </div>
              <p className="text-sm sm:text-base font-black text-indigo-705 uppercase mb-3 block select-none">
                {activeTab === 'max' ? '🌟 [알록달록 발표대본 1] 우리 구역의 넘치는 매력 소개' : '🤝 [알록달록 발표대본 2] 골고루 살아나는 상생 전략'}
              </p>
              
              <div className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 leading-loose max-h-[500px] overflow-y-auto font-sans whitespace-pre-wrap pr-1 bg-white/90 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-3xs">
                {activeTab === 'max' ? maxSpeech : minSpeech}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-2 gap-2 text-base font-bold text-slate-650">
            <span>© made by 초등 사회·수학 융합 탐구실</span>
            <span className="font-black text-slate-700 text-sm sm:text-base flex items-center gap-1.5">
              <Award className="w-5.5 h-5.5 text-amber-500" />
              <span>우수 관광 어린이 홍보대사 선정위원회 🏅</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🔬 [사회과 융합 탐구] 우리 자율 모둠의 '지혜로운 선택' 토의판 */}
      <div className="bg-slate-50/70 border border-indigo-150 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧠</span>
          <div>
            <h4 className="text-sm md:text-base font-black text-slate-850">
              [사회 공부 요약] 우리 모둠의 똑똑하고 지혜로운 선택 토의판
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              지도 속에서 무엇이 가장 많고 왜 적은지 공부했나요? 우리 동네를 위해 어떤 선택을 하는 것이 가장 지혜롭고 좋을지 모둠 친구들과 직접 버튼을 누르며 의견을 모아보세요!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. 가장 수가 많은 장소 전략 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs space-y-4">
            <div className="space-y-1">
              <span className="bg-indigo-50 text-indigo-750 text-xs font-black px-2.5 py-1 rounded-lg">
                📈 가장 수가 많은 테마: {categoryEmojis[maxCategoryKey]} {categoryNames[maxCategoryKey]} ({counts[maxCategoryKey]}곳)
              </span>
              <h5 className="text-xs md:text-sm font-black text-slate-800 pt-1">
                우리 동네에서 가장 많은 이 테마의 장소들을 어떻게 다루는 것이 좋을까요?
              </h5>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMaxStrategy('promote')}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-3.5 cursor-pointer ${
                  maxStrategy === 'promote'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-xl mt-0.5">📢</span>
                <div>
                  <h6 className="text-xs md:text-sm font-black">【방안 A: 장점 뽐내기】 재미있는 지도나 포스터를 만들어서 널리 자랑하기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    우리 동네에서 가장 빛나는 멋진 장소들을 널리 소문내서, 다른 지역 전국의 친구들이 많이 놀러 오게 해요!
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMaxStrategy('control')}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-3.5 cursor-pointer ${
                  maxStrategy === 'control'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-xl mt-0.5">🌿</span>
                <div>
                  <h6 className="text-xs md:text-sm font-black">【방안 B: 질서와 규칙 지키기】 쓰레기 버리지 않기 약속과 길 정돈하기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    사람들이 너무 갑자기 몰려와 동네가 어질러지지 않도록, "조용히 아끼며 관람해요" 같은 질서 캠페인을 열어 깨끗하게 지켜요.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. 가장 수가 적은 장소 전략 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs space-y-4">
            <div className="space-y-1">
              <span className="bg-purple-50 text-purple-750 text-xs font-black px-2.5 py-1 rounded-lg">
                🌱 가장 수가 적은 테마: {categoryEmojis[minCategoryKey]} {categoryNames[minCategoryKey]} ({counts[minCategoryKey]}곳)
              </span>
              <h5 className="text-xs md:text-sm font-black text-slate-800 pt-1">
                우리 동네에서 가장 개수가 적고 부족한 이 테마는 어떻게 다루는 것이 좋을까요?
              </h5>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMinStrategy('develop')}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-3.5 cursor-pointer ${
                  minStrategy === 'develop'
                    ? 'border-purple-600 bg-purple-50/40 text-purple-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-xl mt-0.5">🏗️</span>
                <div>
                  <h6 className="text-xs md:text-sm font-black">【방안 A: 부족한 곳 채워주기】 안전한 정거장을 만들고 공원 새로 세워주기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    여기에 사는 친구들과 이웃들이 서운하거나 불편하지 않도록, 시청이나 구청에 예쁜 놀이터나 버스 통학길을 더 지어달라고 편지를 써요.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMinStrategy('preserve')}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-3.5 cursor-pointer ${
                  minStrategy === 'preserve'
                    ? 'border-purple-600 bg-purple-50/40 text-purple-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-xl mt-0.5">🦊</span>
                <div>
                  <h6 className="text-xs md:text-sm font-black">【방안 B: 있는 그대로 소중히 하기】 억지로 짓지 않고, 자연을 지키기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    모든 동네가 다 똑같이 시끄러울 필요는 없어요. 멋진 나무와 조용한 바람 소리를 기후변화로부터 지켜주는 것도 훌륭한 사랑이에요.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 모둠 생각 상자 최종 선택 결과지 */}
        <AnimatePresence>
          {maxStrategy && minStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200 rounded-3xl p-6.5 space-y-5 text-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
                <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                <h5 className="text-sm sm:text-base md:text-lg font-black text-indigo-950">
                  🎉 우리 모둠의 똑똑한 생각 상자 의사결정 보고서 완성!
                </h5>
              </div>

              <div className="space-y-4 text-xs sm:text-sm md:text-base">
                <p className="font-bold leading-relaxed text-slate-705">
                  우리 모둠은 부산 <strong>{currentRegion.name}</strong> 구역의 재미있는 장소들을 모아서, 막대그래프로 직접 크기를 비교해 보았어요.
                  그 결과 가장 많이 발달한 <strong className="text-indigo-750">[{categoryNames[maxCategoryKey]}]</strong>({counts[maxCategoryKey]}곳) 테마에 대해서는 마음 편히{' '}
                  <span className="underline decoration-indigo-550 decoration-2 underline-offset-4 font-black text-indigo-950">
                    {maxStrategy === 'promote' ? '‘방안 A: 재미있는 지도나 포스터를 만들어 더 널리 자랑하기’' : '‘방안 B: 깨끗하고 고요한 길을 함께 꾸미기 위한 약속 캠페인’'}
                  </span>
                  를 선택했고, 반대로 개수가 가장 적고 아쉬웠던 <strong className="text-purple-750">[{categoryNames[minCategoryKey]}]</strong>({counts[minCategoryKey]}곳) 테마에 대해서는{' '}
                  <span className="underline decoration-purple-550 decoration-2 underline-offset-4 font-black text-purple-950">
                    {minStrategy === 'develop' ? '‘방안 A: 편리한 정거장과 놀이터를 새로 세워서 골고루 채워주기’' : '‘방안 B: 무리해서 무언가를 더 짓지 않고 본래의 맑은 자연을 지켜주기’'}
                  </span>
                  를 하기로 다 함께 최종 결정했답니다!
                </p>

                <p className="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-relaxed flex items-start gap-2.5 bg-white py-4 px-5 rounded-2xl border border-indigo-100 shadow-3xs">
                  <span className="text-xl shrink-0">📢</span> 
                  <span className="text-indigo-950 font-black">
                    "우리가 직접 눈으로 보고 센 막대그래프 숫자를 바탕으로, 아끼는 마음과 더 나은 미래를 함께 생각한 ‘지혜로운 어린이 약속’을 발표 스케치북에 예쁘게 적어 친구들 앞에서 씩씩하게 발표하겠습니다!"
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
