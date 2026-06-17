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
    food: '탐미 미식 (먹거리)',
    traffic: '환경 인프라 (교통)',
    play: '체험 놀거리 (볼거리)',
    history: '전통 역사 (배움터)',
    beach: '수평선 바다 (자연관광)',
  };

  const categoryEmojis: Record<CategoryKey, string> = {
    food: '🍕',
    traffic: '🚇',
    play: '🎡',
    history: '🏛️',
    beach: '🏖️',
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

  // 가장 많은 개수를 자랑하기 대본 (진지하고 격조 높은 4학년 맞춤형 발표대본)
  const maxSpeech = `안녕하십니까? 저희는 우리 고장의 다양한 명소들을 성실하게 조사하고, 막대그래프 통계 자료를 바탕으로 발표를 준비한 《우리 모둠》입니다.

저희 모둠이 부산 ${currentRegion.name}의 명소들을 깊이 있게 분석하고, 우리 고장을 찾아오는 분들에게 공식적으로 추천하기 위해 정한 발표 주제는 《${maxSpotsList.split(',')[0] || '부산'} 중심의 핵심 테마 탐구 여행》입니다.

저희가 이러한 주제를 선택하게 된 확실한 지리적·수학적 근거는, 부산 지도 속 장소들을 분류표로 꼼꼼히 정리하고 이를 막대그래프로 나타내어 각 테마별 수량을 정확하게 비교해 보았기 때문입니다. 그래프를 통해 조사한 결과를 분석해 보니, 우리 구역은 다른 테마에 비해 '${categoryEmojis[maxCategoryKey]} ${categoryNames[maxCategoryKey]}' 분야의 장소가 총 ${counts[maxCategoryKey]}곳으로 가장 많은 수치를 나타냈습니다.

따라서 저희 모둠은 우리 고장의 가장 뛰어난 특징과 장점을 적극적으로 살려 소개하는 계획이 가장 합리적인 선택이라는 결론에 도달하였습니다. 특히 ${maxSpotsList} 등은 우리 고장이 가진 자랑스러운 보물입니다. 이러한 훌륭한 자원들을 아끼고 가꾸며 널리 알린다면, 우리 고장을 더욱 발전시키고 찾아오는 이웃들에게 큰 기쁨을 선사할 것입니다. 통계와 지도를 정성껏 분석하여 도출한 저희 발표를 끝까지 경청해 주셔서 대단히 감사합니다. 이상으로 저희 모둠의 발표를 마치겠습니다.`;

  // 가장 적은 개수를 보완하기 대본 (상생과 균형발전에 초점을 둔 진지하고 진솔한 4학년 공공 제안 대본)
  const minSpeech = `안녕하십니까? 저희는 우리 고장의 모든 구역이 조화롭고 균형 있게 발전하기를 바라는 마음으로, 균형 성장 제안을 준비하여 발표하게 된 《우리 모둠》입니다.

저희 모둠이 부산 ${currentRegion.name}를 더 살기 좋은 곳으로 만들기 위해 고민하고 마련한 우리 고장 상생 계획의 공식 제목은 《지역의 소중한 가치를 가꾸는 ${minSpotsList.split(',')[0] || '부산'} 균형 투어》입니다.

저희가 이 제안을 올바르게 발의하게 된 명확한 지리적 근거는, 우리 구역의 자원들을 분류표로 꼼꼼히 정리하고 이를 막대그래프의 기둥 높낮이로 비교하여 장소의 여건 차이를 눈으로 직접 분석해보았기 때문입니다. 데이터 분석 결과, 우리 구역은 다른 분야에 비해 상대적으로 '${categoryEmojis[minCategoryKey]} ${categoryNames[minCategoryKey]}' 분야의 관련 장소가 단 ${counts[minCategoryKey]}곳에 머물러 있어, 타 지역에 비해 관련 시설들이 조금 소외되어 있다는 사실을 확인하였습니다.

이에 저희 모둠은 '고장의 모든 주민들이 차별 없이 균형 있는 편리와 시설 혜택을 골고루 누리는 것이 정의롭고 이롭다'는 믿음을 가지게 되었습니다. 비록 아직은 숫자가 부족하지만 소중한 ${minSpotsList} 주변 환경을 깨끗하고 안전하게 보강하고 널리 전수하며, 마을을 조화롭게 상생 관리해 달라고 공공기관에 건의합니다. 통계를 바탕으로 지역사회의 아름다운 내일을 고민한 저희 모둠의 발표글을 경청해 주셔서 정말 고맙습니다. 이상으로 발표를 마치겠습니다.`;

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
                  <span className="text-base sm:text-lg md:text-xl font-black">가장 많은 곳 홍보 전략</span>
                  <span className="text-xs sm:text-sm text-slate-505 font-bold mt-1.5">가장 많은 테마를 자랑해요</span>
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
                  <span className="text-base sm:text-lg md:text-xl font-black">가장 적은 곳 발전 전략</span>
                  <span className="text-xs sm:text-sm text-slate-550 font-bold mt-1.5">개수가 적은 테마를 보완해요</span>
                </span>
              </button>
            </div>

            {/* 실시간 대본 거울 말풍선 */}
            <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-dashed border-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 select-none text-rose-500/10 text-9xl">
                {activeTab === 'max' ? '📣' : '🏡'}
              </div>
              <p className="text-sm sm:text-base font-black text-indigo-700 uppercase mb-3 block select-none">
                {activeTab === 'max' ? '🌟 [알록달록 발표대본 1] 우리 구역의 넘치는 매력 소개' : '🤝 [알록달록 발표대본 2] 골고루 살아나는 나눔 전략'}
              </p>
              
              <div className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 leading-loose max-h-[500px] overflow-y-auto font-sans whitespace-pre-wrap pr-1 bg-white/90 p-5 sm:p-6 rounded-2xl border border-slate-205/60 shadow-3xs">
                {activeTab === 'max' ? maxSpeech : minSpeech}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-2 gap-2 text-base font-bold text-slate-600">
            <span>© made by 초등 사회·수학 교재 융합실</span>
            <span className="font-black text-slate-700 text-sm sm:text-base flex items-center gap-1.5">
              <Award className="w-5.5 h-5.5 text-amber-500" />
              <span>우수 관광 어린이 홍보대사 선정위원회 🏅</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🔬 [사회과 융합 탐구] 우리 자율 모둠의 '합리적 의사결정' 토의판 */}
      <div className="bg-slate-50/70 border border-indigo-150 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧠</span>
          <div>
            <h4 className="text-sm md:text-base font-black text-slate-800">
              [사회 탐구 미션] 우리 모둠의 합리적 의사결정(합리적 선택) 토의지
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              단순히 지도를 관측하고 그리는 것에서 한 걸음 더 나아가 보아요! 무엇이 가장 많고, 무엇이 가장 적은지 눈으로 확인했으니, 가장 지혜롭고 이로운 모둠 선택은 무엇일지 직접 버튼을 누르며 골라보세요.
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
                구역에서 가장 수가 많은 장소를 어떻게 가꾸는 것이 현명할까요?
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
                  <h6 className="text-xs md:text-sm font-black">【방안 A: 특색 살리기】 대대적 홍보로 최고 인기 구역 만들기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    이미 많은 장소와 가게들이 잘 발달해 있으므로, 장점을 한껏 돋보이게 하는 멋진 여행 지도를 만들어 전 세계 친구들에게 널리 알려 지역 활기를 돋웁니다!
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
                  <h6 className="text-xs md:text-sm font-black">【방안 B: 질서 정돈하기】 복잡함과 쓰레기를 예방하고 관리하기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    장소가 너무 빽빽하고 사람이 많이 온다면 주변 한적한 주택가가 오염되거나 번잡해질 수 있습니다. 질서 지키기 약속 캠페인을 열어 깨끗하고 쾌적하게 한숨 가다듬는 거리를 꾸밉니다.
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
                구역에서 가장 수가 적고 부족한 테마를 어떻게 다루면 현명할까요?
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
                  <h6 className="text-xs md:text-sm font-black">【방안 A: 골고루 키우기】 새로운 체험 시설이나 관광지 새로 만들기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    그 구역에 사는 시민들이나 어린이들이 놀거리나 혜택을 받지 못해 소외되지 않도록, 대중교통을 놓아주고 체험 놀이터를 새로 만들어 균형있게 영토를 발달시킵니다.
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
                  <h6 className="text-xs md:text-sm font-black">【방안 B: 그대로 보호하기】 억지로 짓지 않고 본래 자연이나 장점 지키기!</h6>
                  <p className="text-xs mt-1 font-semibold leading-relaxed text-slate-500">
                    모든 동네가 똑같은 모양일 필요는 없고 가치가 부족하다면 기회비용이 생깁니다. 푸른 숲과 전통은 그대로 보존하고, 부족한 놀거리는 옆동네 교류를 통해 해결하는 똑똑한 자원절약 방안입니다.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 종합 모둠 의사결정 선언서 결과지 출력 피드백 */}
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
                  🎉 우리 모둠의 최종 합리적 공공의사결정 보고서가 완성되었습니다!
                </h5>
              </div>

              <div className="space-y-4 text-xs sm:text-sm md:text-base">
                <p className="font-bold leading-relaxed text-slate-700">
                  우리 모둠은 부산 <strong>{currentRegion.name}</strong> 구역의 명소 지도 수량 통계를 적극 조사하여 막대그래프로 개수를 비교해 본 결과, 
                  가장 장소가 많이 발달된 테마인 <strong className="text-indigo-750">[{categoryNames[maxCategoryKey]}]</strong>({counts[maxCategoryKey]}곳)에 대해 토의를 거쳐{' '}
                  <span className="underline decoration-indigo-550 decoration-2 underline-offset-4 font-black text-indigo-950">
                    {maxStrategy === 'promote' ? '‘홍보 마케팅 특색 살리기’' : '‘생활 질서 정돈 캠페인’'}
                  </span>
                  를 선택하였고, 반대로 가장 장소 개수가 적은 테마인 <strong className="text-purple-750">[{categoryNames[minCategoryKey]}]</strong>({counts[minCategoryKey]}곳)에 대해서는{' '}
                  <span className="underline decoration-purple-550 decoration-2 underline-offset-4 font-black text-purple-950">
                    {minStrategy === 'develop' ? '‘생활 놀이터 및 교통거점 새로 골고루 키우기’' : '‘자연의 쉼터와 기회비용 지혜롭게 보존하기’'}
                  </span>
                  를 과감히 최종 결정하였습니다.
                </p>

                <p className="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-relaxed flex items-start gap-2.5 bg-white py-4 px-5 rounded-2xl border border-indigo-100 shadow-3xs">
                  <span className="text-xl shrink-0">📢</span> 
                  <span className="text-indigo-950 font-black">
                    "우리 모둠은 우리가 조사해서 알게 된 막대그래프 숫자들을 근거 삼아, 아끼는 마음과 더 나은 발전을 지혜롭게 절충한 ‘합리적인 장소 선별 의사결정’을 스케치북 발표지에 멋지게 적어 자랑할 것을 약속합니다!"
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
