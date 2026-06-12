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

  // 2. 가장 적은 테마 카테고리 판정
  const minCategoryKey = keys.reduce((a, b) => 
    (counts[a] || 0) <= (counts[b] || 0) ? a : b
  , 'history');

  const categoryNames: Record<CategoryKey, string> = {
    food: '블루리본 고장 맛 탐방',
    traffic: '편리한 교통 거점',
    play: '체험 놀거리 & 오락',
    history: '역사 자연 유적지',
    beach: '해수욕장 랜드마크 바다',
  };

  const categoryEmojis: Record<CategoryKey, string> = {
    food: '🍰',
    traffic: '🚌',
    play: '🎡',
    history: '🌲',
    beach: '🏖️',
  };

  // 구역 내 카테고리별 구체적 장소 추천 리스트 (실시간 맵핑)
  const getMaxSpotsList = () => {
    const spots = regionSpots.filter(s => s.category === maxCategoryKey);
    if (spots.length === 0) return '우리가 발견할 귀여운 장소들';
    return spots.slice(0, 3).map(s => s.name.split(' (')[0]).join(', ');
  };

  const getMinSpotsList = () => {
    const spots = regionSpots.filter(s => s.category === minCategoryKey);
    if (spots.length === 0) return '지도의 보석처럼 숨은 장소들';
    return spots.slice(0, 3).map(s => s.name.split(' (')[0]).join(', ');
  };

  const maxSpotsList = getMaxSpotsList();
  const minSpotsList = getMinSpotsList();

  // 가장 많은 개수를 자랑하기 대본 (풍부성 추천 모델)
  const maxSpeech = `안녕하세요 여러분! 저희는 [우리 모둠]입니다.\n\n저희 모둠이 부산 ${currentRegion.name} 구역을 친구들에게 추천하고 홍보하는 멋진 추천 코스 제목은 《${maxSpotsList.split(',')[0] || '부산'}와 함께하는 가이드 투어》 입니다.\n\n저희가 이 계획을 짜게 된 수학적이고 지리적인 이유는, 직접 막대그래프로 나타내고 분석하여 가장 많은 곳이 어디인지 발견했기 때문입니다. 우리 구역은 [${categoryEmojis[maxCategoryKey]} ${categoryNames[maxCategoryKey]}] 명소가 총 ${counts[maxCategoryKey]}개로 모든 테마 중에서 가장 많고 풍부했습니다!\n\n이런 명확한 조사 자료를 보았을 때, 우리 구역의 가장 큰 매력은 바로 이 테마라고 생각됩니다. 따라서 이곳을 오시는 국내외 어린이 친구들에게 [${maxSpotsList}]과(와) 같은 대표적인 명소들을 우선적으로 추천하고 대대적으로 홍보하여 우리 구역의 첫걸음을 장식하는 것이 최고의 가이드 결정이라는 선택 결론을 도출하였습니다.\n\n이상으로 저희 모둠의 데이터 기반 발표를 마치겠습니다. 여러분 감사합니다!`;

  // 가장 적은 개수를 채우기 대본 (부족 지역 보완 모델)
  const minSpeech = `안녕하세요 여러분! 저희는 [우리 모둠]입니다.\n\n저희가 부산 ${currentRegion.name} 구역의 분포를 치밀하게 막대그래프로 완성해서 눈금을 대조했더니, 아주 소중한 발견을 할 수 있었습니다. 바로 우리 구역에는 [${categoryEmojis[minCategoryKey]} ${categoryNames[minCategoryKey]}] 명소가 다른 테마에 비해 가장 적은 단 ${counts[minCategoryKey]}개밖에 분포되어 있지 않다는 수치를 눈금 한 칸의 정밀함으로 확인했습니다.\n\n지리적으로 모든 구역의 균형 잡힌 상생 발전과 다양성을 지키는 것은 장소의 가치를 높이는 핵심 비결입니다. 따라서 저희는 상대적으로 숫자가 적은 테마를 돕고 보충하기 위해, 우리 구역의 숨겨진 유산인 [${minSpotsList}] 등 숨은 장소들을 발굴해 특별 가이드북을 만들거나 새로운 문화 행사를 유치하여 부족한 곳을 채워 넣어야 한다는 지리학적 분배 전략 결론을 얻었습니다!\n\n이상으로 단순 흥미를 넘어 전체적인 어울림을 설계한 모둠 대표 보고를 마칩니다. 감사합니다!`;

  const handleCopy = () => {
    const textToCopy = activeTab === 'max' ? maxSpeech : minSpeech;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="presentation-assistant-section">
      {/* 스테이지 간판 */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 select-none font-black pointer-events-none">
          📢
        </div>
        <div className="relative space-y-2 max-w-2xl">
          <span className="bg-white/20 text-white border border-white/20 text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            🎤 3단계: 우리 모둠이 토의하는 의사결정 스테이지
          </span>
          <h3 className="text-xl md:text-2xl font-black leading-tight">
            부산 {{all: '각 구역', north: '북부 구역🌲', west: '서부 구역🌅', south: '남부 구역⚓', haeundae: '해운대 구역🏖️', dongnae: '동래 구역♨️', gijang_suyeong: '기장/수영 구역🌉'}[selectedRegion]} 여행 홍보대사 발표 안내
          </h3>
          <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed">
            막대그래프에서 완성해 내신 놀랍고 과학적인 통계 분석을 바탕으로, 어디에 집중할지 합리적인 결정을 내리는 법을 알아봅시다. 
            <strong> 실제 발표지와 스케치북에는 우리 모둠이 내린 결정과 대본을 참고</strong>하여 멋지게 꾸며 발표해 주세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 왼쪽: 교과 융합 슬라이드/발표 보드 구성법 (5칸) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6.5 shadow-xs border border-slate-100 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <BookOpen className="w-5.5 h-5.5 text-indigo-600" />
            <h4 className="font-extrabold text-slate-850 text-sm md:text-lg">📝 칠판/스케치북 발표 보드 꾸미는 법</h4>
          </div>

          <div className="space-y-4.5">
            <div className="flex gap-4 items-start bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-6.5 h-6.5 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 mt-0.5">1</span>
              <div>
                <h5 className="text-xs sm:text-sm md:text-base font-black text-slate-850">탐사 지역 및 수집 통계표 작성</h5>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed mt-1.5 font-bold">
                  1단계에서 직접 지도를 탐색하고 세어본 부산 구역별 5대 테마 분류표를 발표 보드 왼쪽에 직접 적습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-6.5 h-6.5 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 mt-0.5">2</span>
              <div>
                <h5 className="text-xs sm:text-sm md:text-base font-black text-slate-850">직접 고른 눈금 크기로 그래프 그리기</h5>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed mt-1.5 font-bold">
                  2단계에서 스마트 빌더로 배운 가장 적당한 눈금 한 칸의 크기(1, 2, 5 단위)를 이용해 막대그래프를 그립니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-50 p-4.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-6.5 h-6.5 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 mt-0.5">3</span>
              <div>
                <h5 className="text-xs sm:text-sm md:text-base font-black text-slate-850">합리적 판단과 선택의 결론 도출</h5>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed mt-1.5 font-bold">
                  가장 많은 곳을 자랑스럽게 홍보할지, 혹은 가장 적은 곳을 도와줘서 골고루 채울지 의사결정의 이점과 특징을 정리합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 꼬마 도향 안내판 */}
          <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
            <h5 className="text-xs sm:text-sm md:text-base font-black text-emerald-800 flex items-center gap-1.5 select-none">
              🎓 지리학자 초등 사회 한마디!
            </h5>
            <p className="text-xs sm:text-sm md:text-base text-emerald-950 font-bold leading-relaxed">
              부산의 명소 분포를 막대그래프로 나타내면 무엇이 가장 많은지, 무엇이 가장 적은지 단번에 눈에 띄게 됩니다. 
              가장 많은 부분과 가장 적은 부분을 활용해 소중한 부산이 골고루 상생 발전하는 법을 모둠 친구들과 직접 의논해 보세요!
            </p>
          </div>
        </div>

        {/* 오른쪽: 우리 모둠 전용 Dynamic 발표 예시 대본 (7칸) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-1.5 animate-pulse">
                  <span>💡</span>
                  <span>[실시간 분류표 연동] 우리 구역 맞춤형 발표 대본 예시</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  1단계에서 직접 채운 수량이 연동되어 아주 구체적인 발표 예시글이 완성됩니다.
                </p>
              </div>

              {/* 클립보드 복사 & 인쇄 버튼 */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                  title="스피치 복사하기"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '복사 성공!' : '스피치 복사'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                  title="발표 가이드 인쇄"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄하기</span>
                </button>
              </div>
            </div>

            {/* 전략 탭 전환기 */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-150">
              <button
                onClick={() => setActiveTab('max')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'max'
                    ? 'bg-white border-slate-200 text-indigo-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>📈</span>
                <span className="flex flex-col items-start leading-none text-left">
                  <span className="text-xs md:text-sm">가장 많은 곳 홍보 전략</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-extrabold mt-1">가장 많은 테마를 자랑해요</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('min')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeTab === 'min'
                    ? 'bg-white border-slate-200 text-purple-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🌱</span>
                <span className="flex flex-col items-start leading-none text-left">
                  <span className="text-xs md:text-sm">가장 적은 곳 발전 전략</span>
                  <span className="text-[10px] md:text-xs text-slate-400 font-extrabold mt-1">개수가 적은 테마를 보완해요</span>
                </span>
              </button>
            </div>

            {/* 실시간 대본 거울 말풍선 */}
            <div className="bg-slate-50/50 p-5 rounded-3xl border border-dashed border-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 select-none text-rose-500/10 text-7xl">
                {activeTab === 'max' ? '📣' : '🏡'}
              </div>
              <p className="text-xs font-black text-indigo-650 tracking-wider uppercase mb-2 block select-none">
                {activeTab === 'max' ? '🌟 [알록달록 발표대본 1] 우리 구역의 넘치는 매력 소개' : '🤝 [알록달록 발표대본 2] 골고루 살아나는 나눔 전략'}
              </p>
              
              <div className="text-xs md:text-sm font-semibold text-slate-750 leading-relaxed max-h-[350px] overflow-y-auto font-mono whitespace-pre-wrap pr-1">
                {activeTab === 'max' ? maxSpeech : minSpeech}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-3.5 mt-2 gap-2 text-xs font-medium text-slate-400">
            <span>© made by 초등 사회·수학 교재 융합실</span>
            <span className="font-bold text-slate-500 text-xs md:text-sm flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-amber-500" />
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
