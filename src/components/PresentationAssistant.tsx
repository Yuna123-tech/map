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

  // 1. 최댓값 카테고리 판정
  const keys = Object.keys(counts) as CategoryKey[];
  const maxCategoryKey = keys.reduce((a, b) => 
    (counts[a] || 0) >= (counts[b] || 0) ? a : b
  , 'food');

  // 2. 최솟값 카테고리 판정
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

  // 최댓값 자랑하기 대본 (풍부성 추천 모델)
  const maxSpeech = `안녕하세요 여러분! 저희는 [우리 모둠]입니다.\n\n저희 모둠이 부산 ${currentRegion.name} 구역을 친구들에게 추천하고 홍보하는 멋진 추천 코스 제목은 《${maxSpotsList.split(',')[0] || '부산'}와 함께하는 가이드 투어》 입니다.\n\n저희가 이 계획을 짜게 된 수학적이고 지리적인 이유는, 직접 막대그래프로 나타내고 분석한 분포 순위의 비밀을 발견했기 때문입니다. 우리 구역은 [${categoryEmojis[maxCategoryKey]} ${categoryNames[maxCategoryKey]}] 명소가 총 ${counts[maxCategoryKey]}개로 모든 테마 중에서 가장 가득하고 풍부했습니다!\n\n이런 명확한 통계자료를 보았을 때, 우리 구역의 수려한 대표 장점은 바로 이 카테고리라고 생각됩니다. 따라서 이곳을 오시는 국내외 어린이 친구들에게 [${maxSpotsList}]과(와) 같은 대표적인 명소들을 우선적으로 추천하고 대대적으로 홍보하여 우리 구역의 첫걸음을 장식하는 것이 최고의 가이드 결정이라는 풍부성 전략 결론을 도출하였습니다.\n\n이상으로 저희 모둠의 데이터 기반 발표를 마치겠습니다. 여러분 감사합니다!`;

  // 최솟값 채우기 대본 (부족 지역 보완 모델)
  const minSpeech = `안녕하세요 여러분! 저희는 [우리 모둠]입니다.\n\n저희가 부산 ${currentRegion.name} 구역의 분포를 치밀하게 막대그래프로 완성해서 눈금을 대조했더니, 아주 고귀한 발견을 할 수 있었습니다. 바로 우리 구역에는 [${categoryEmojis[minCategoryKey]} ${categoryNames[minCategoryKey]}] 명소가 다른 테마에 비해 극히 적은 단 ${counts[minCategoryKey]}개밖에 분포되어 있지 않다는 수치를 눈금 한 칸의 정밀함으로 수치화했습니다.\n\n지리적으로 모든 구역의 균형 잡힌 상생 경제 발전과 다양성을 지키는 것은 장소 가치를 가꾸는 핵심 비결입니다. 따라서 저희는 상대적으로 희소한 테마를 돕고 보강하기 위해, 우리 구역의 숨겨진 유산인 [${minSpotsList}] 등 숨은 장소들을 발굴해 특별 가이드북을 만들거나 새로운 문화 행사를 유치하여 부족한 명소를 채워 넣어야 한다는 지리학적 지속가능 분배 전략 결론을 얻었습니다!\n\n이상으로 단순 흥미를 넘어 통계 균형학적인 가치를 설계한 모둠 대표 보고를 마칩니다. 감사합니다!`;

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
          <span className="bg-white/20 text-white border border-white/20 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            🎤 3단계: 우리 모둠이 되새기는 의사결정 스테이지
          </span>
          <h3 className="text-lg md:text-xl font-black leading-tight">
            부산 {{all: '각 구역', north: '북부 구역🌲', west: '서부 구역🌅', south: '남부 구역⚓', haeundae: '해운대 구역🏖️', dongnae: '동래 구역♨️', gijang_suyeong: '기장/수영 구역🌉'}[selectedRegion]} 여행 홍보대사 발표 보드 안내
          </h3>
          <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
            막대그래프에서 완성해 내신 놀랍고 과학적인 통계 분석을 바탕으로 가설과 타당성을 연계해 보세요. 
            <strong> 실제 발표지와 스케치북에는 본 보드의 안내와 맞춤형 동적 예시 대본을 참고</strong>하여 멋지게 꾸며 발표할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 왼쪽: 교과 융합 슬라이드/발표 보드 구성법 (5칸) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h4 className="font-extrabold text-slate-800 text-xs">📝 칠판/스케치북 발표 보드 채우는 순서</h4>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3 items-start bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">1</span>
              <div>
                <h5 className="text-[11px] font-black text-slate-800">탐사 지역 및 수집 통계표 작성</h5>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5 font-semibold">
                  1단계에서 직접 눈으로 세고 입력한 부산 구역별 5대 테마 분류표를 발표 보드 맨 왼쪽에 가지런히 적거나 붙입니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">2</span>
              <div>
                <h5 className="text-[11px] font-black text-slate-800">눈금 설계 그래프 그리기</h5>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5 font-semibold">
                  2단계에서 스마트 빌더로 배운 최적의 눈금(1, 2, 5 단위)을 축척 눈금선을 그어 5개 막대기둥 분포 그래프를 완성합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">3</span>
              <div>
                <h5 className="text-[11px] font-black text-slate-800">수학적 타당성 바탕의 지리지지 결론 도출</h5>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5 font-semibold">
                  가장 많은 명소를 자랑(홍보)할지, 혹은 고른 성장을 도모하고자 부족한 명소를 찾아서 신설/보완할지 의논하여 의사결정을 마무리합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 꼬마 도향 안내판 */}
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
            <h5 className="text-[10.5px] font-black text-emerald-800 flex items-center gap-1 select-none">
              🎓 지리학자 초등 사회 한마디!
            </h5>
            <p className="text-[10px] text-emerald-950 font-semibold leading-relaxed">
              부산의 명소 분포(공간적 규칙성)를 막대그래프로 그리면 여러 종류 장소의 크기를 비교하기 매우 쉬워집니다. 
              최댓값과 최솟값을 활용해 소중한 부산이 골고루 발전하는 법을 생각하는 모둠 토의 시간을 가져 보세요!
            </p>
          </div>
        </div>

        {/* 오른쪽: 우리 모둠 전용 Dynamic 발표 예시 대본 (7칸) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                  <span>💡</span>
                  <span>[실시간 최적 연동] 우리 구역 맞춤형 발표 대본 예시</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  입력한 막대 통계 수량이 실시간으로 반영되어 완벽히 구체적인 모델 스피치가 생성됩니다.
                </p>
              </div>

              {/* 클립보드 복사 & 인쇄 버튼 */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                  title="스피치 복사하기"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사성공!' : '스피치 복사'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                  title="발표 가이드 인쇄"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기</span>
                </button>
              </div>
            </div>

            {/* 전략 탭 전환기 */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-150">
              <button
                onClick={() => setActiveTab('max')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'max'
                    ? 'bg-white border-slate-200 text-indigo-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>📈</span>
                <span className="flex flex-col items-start leading-none">
                  <span className="text-[10.5px]">풍부함 홍보 발표</span>
                  <span className="text-[7.5px] text-slate-400 font-extrabold mt-0.5">가장 많은 테마를 자랑해요</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('min')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'min'
                    ? 'bg-white border-slate-200 text-purple-950 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🌱</span>
                <span className="flex flex-col items-start leading-none">
                  <span className="text-[10.5px]">부족 구역 채우기 발표</span>
                  <span className="text-[7.5px] text-slate-400 font-extrabold mt-0.5">개수가 적은 곳을 도와요</span>
                </span>
              </button>
            </div>

            {/* 실시간 대본 거울 말풍선 */}
            <div className="bg-slate-50/50 p-4.5 rounded-3xl border border-dashed border-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 select-none text-rose-500/10 text-6xl">
                {activeTab === 'max' ? '📣' : '🏡'}
              </div>
              <p className="text-[9px] font-black text-indigo-650 tracking-wider uppercase mb-2 block select-none">
                {activeTab === 'max' ? '🌟 [모델대본 1] 우리 지역 넘치는 활력 소개' : '🤝 [모델대본 2] 장소 균형과 나눔의 보충전술'}
              </p>
              
              <div className="text-[11.5px] font-semibold text-slate-750 leading-relaxed max-h-[300px] overflow-y-auto font-mono whitespace-pre-wrap pr-1">
                {activeTab === 'max' ? maxSpeech : minSpeech}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-2 text-[10px] font-medium text-slate-400">
            <span>© made by 초등 사회·수학 교재 융합실</span>
            <span className="font-bold text-slate-500 text-[10.5px] flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>우수 가이딩 어린이 관광 홍보대사 선정위원회 🏅</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🔬 [사회과 융합 탐구] 우리 자율 모둠의 '합리적 의사결정' 토의판 */}
      <div className="bg-slate-50/70 border border-indigo-150 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <div>
            <h4 className="text-sm font-black text-slate-800">
              [사회학습 미션] 우리 모둠의 합리적 의사결정 (Rational Decision-Making) 토의지
            </h4>
            <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
              지도를 세고 막대그래프로 나타낸 통계 분석만으로 끝내지 마세요! 우리 모둠이 토의를 거쳐 내린 가장 현명하고 멋진 '합리적 공공 정책 선택'은 무엇인가요?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. 최댓값에 대한 합리적 선택 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs space-y-4">
            <div className="space-y-1">
              <span className="bg-indigo-50 text-indigo-750 text-[10px] font-black px-2.5 py-1 rounded-lg">
                📈 최댓값 집중 토의: {categoryEmojis[maxCategoryKey]} {categoryNames[maxCategoryKey]} ({counts[maxCategoryKey]}곳)
              </span>
              <h5 className="text-[11.5px] font-black text-slate-800 pt-1">
                구역에서 가장 수가 많은 장소를 어떻게 가꾸는 것이 합리적일까요?
              </h5>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMaxStrategy('promote')}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex gap-3 cursor-pointer ${
                  maxStrategy === 'promote'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-lg mt-0.5">📢</span>
                <div>
                  <h6 className="text-[11.5px] font-black">【방안 A: 특화 홍보 전략】 대대적 홍보로 부산 대표 구역 만들기!</h6>
                  <p className="text-[10px] mt-0.5 font-semibold leading-relaxed text-slate-500">
                    이미 인프라와 장소가 풍부하게 갖춰져 있으므로, 강점을 최대한 부각하는 멋진 마케팅 가이드를 만들어 외국의 친구들과 소셜 미디어에 널리 소문내서 지역 경제와 브랜드를 키웁니다!
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMaxStrategy('control')}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex gap-3 cursor-pointer ${
                  maxStrategy === 'control'
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-lg mt-0.5">🌿</span>
                <div>
                  <h6 className="text-[11.5px] font-black">【방안 B: 지속가능 조율 전략】 오염과 혼잡을 줄이도록 관리하기!</h6>
                  <p className="text-[10px] mt-0.5 font-semibold leading-relaxed text-slate-500">
                    장소가 지나치게 많으면 교통 혼잡, 폐기물 오염, 혹은 주변 주민들이 소음 피해를 볼 수 있습니다. 질서와 위생 캠페인을 열어 성장의 브레이크 역할을 하는 쾌적한 안심존을 구축합니다.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. 최솟값에 대한 합리적 선택 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs space-y-4">
            <div className="space-y-1">
              <span className="bg-purple-50 text-purple-750 text-[10px] font-black px-2.5 py-1 rounded-lg">
                🌱 최솟값 집중 토의: {categoryEmojis[minCategoryKey]} {categoryNames[minCategoryKey]} ({counts[minCategoryKey]}곳)
              </span>
              <h5 className="text-[11.5px] font-black text-slate-800 pt-1">
                구역에서 가장 수가 작은 부족한 장소를 어떻게 다루면 합리적일까요?
              </h5>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMinStrategy('develop')}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex gap-3 cursor-pointer ${
                  minStrategy === 'develop'
                    ? 'border-purple-600 bg-purple-50/40 text-purple-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-lg mt-0.5">🏗️</span>
                <div>
                  <h6 className="text-[11.5px] font-black">【방안 A: 균형 발전 전략】 시설물을 새로 짓고 골고루 채워주기!</h6>
                  <p className="text-[10px] mt-0.5 font-semibold leading-relaxed text-slate-500">
                    그 구역에 사는 아이들과 시민들이 불편함이나 문화 소외를 겪지 않게 하기 위해, 복지 및 대중교통 거점을 유치하거나 새로운 체험 놀이터를 가속해서 설치해 모둠 간의 격차를 해소해 줍니다.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMinStrategy('preserve')}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex gap-3 cursor-pointer ${
                  minStrategy === 'preserve'
                    ? 'border-purple-600 bg-purple-50/40 text-purple-950 shadow-3xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-650'
                }`}
              >
                <span className="text-lg mt-0.5">🦊</span>
                <div>
                  <h6 className="text-[11.5px] font-black">【방안 B: 기회비용 보존 전략】 억지로 개발하지 말고 본연으로 보존하기!</h6>
                  <p className="text-[10px] mt-0.5 font-semibold leading-relaxed text-slate-500">
                    모든 구역에 굳이 같은 명소가 빽빽이 있을 필요는 없습니다. 숲이나 생태 보호구역은 있는 그대로 내버려 두고, 부족한 필요는 이웃한 옆 구역에서 해결하여 기회비용과 숲생태 자원을 영리하게 아낍니다.
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
              className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200 rounded-2xl p-5 space-y-3.5 text-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h5 className="text-xs font-black text-indigo-950">
                  🎉 우리 모둠의 최종 합리적 공공의사결정 보고서가 성사되었습니다!
                </h5>
              </div>

              <div className="space-y-2.5 text-xs">
                <p className="text-[11px] font-semibold leading-relaxed">
                  우리 모둠은 부산 <strong>{currentRegion.name}</strong> 구역의 명소 지도 수명 통계를 적극 조사하여 막대그래프로 세 축을 분석한 결과, 
                  과반 테마인 <strong className="text-indigo-700">[{categoryNames[maxCategoryKey]}]</strong>({counts[maxCategoryKey]}곳)에 대해 다수결 토의 결과로{' '}
                  <span className="underline decoration-indigo-500 underline-offset-4 font-black">
                    {maxStrategy === 'promote' ? '‘홍보 마케팅 특화 전략’' : '‘지속가능 가꾸기 조율 전략’'}
                  </span>
                  을 선택하였고, 희소 테마인 <strong className="text-purple-700">[{categoryNames[minCategoryKey]}]</strong>({counts[minCategoryKey]}곳)에 대해서는{' '}
                  <span className="underline decoration-purple-500 underline-offset-4 font-black">
                    {minStrategy === 'develop' ? '‘문화 혜택 인프라 증설 균형 발전 전략’' : '‘자연 가치 및 기회비용 지혜 보존 전략’'}
                  </span>
                  을 과감히 채택하였습니다.
                </p>

                <p className="text-[11.5px] font-black text-slate-750 leading-normal flex items-center gap-1.5 bg-white py-2 px-3.5 rounded-lg border border-indigo-100 shadow-3xs">
                  <span>📢</span> <span className="text-indigo-950 font-black">"우리 모둠은 수렴된 통계 데이터의 연계와 대립되는 대책 간의 이익·기회비용을 균형 있게 헤아린 ‘합리적 탐색 대제 의사결정’을 스케치북 발표에 멋지게 담아낼 것을 다짐합니다!"</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
