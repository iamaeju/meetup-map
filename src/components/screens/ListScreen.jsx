import { CATEGORIES, PROVINCES, REGION_MAP } from '../../data/meetups';
import MeetupCard from '../MeetupCard';

const CAPACITY_OPTIONS = [
  { id: 'all', label: '인원 무관' },
  { id: 'small', label: '소규모 (~6명)' },
  { id: 'medium', label: '중규모 (7~12명)' },
  { id: 'large', label: '대규모 (13명~)' },
];

export function matchesCapacity(meetup, capacityFilter) {
  if (capacityFilter === 'small') return meetup.capacity <= 6;
  if (capacityFilter === 'medium') return meetup.capacity >= 7 && meetup.capacity <= 12;
  if (capacityFilter === 'large') return meetup.capacity >= 13;
  return true;
}

export default function ListScreen({
  meetups,
  category,
  onCategoryChange,
  province,
  onProvinceChange,
  district,
  onDistrictChange,
  keyword,
  onKeywordChange,
  capacityFilter,
  onCapacityChange,
  selectedId,
  onSelect,
}) {
  const districts = province === '전체' ? [] : REGION_MAP[province] || [];

  return (
    <div className="screen list-screen">
      <div className="screen-header">
        <h1>모임 찾기</h1>
      </div>

      <div className="filter-bar">
        <input
          className="keyword-input"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="🔍 키워드로 검색 (모임 이름, 호스트...)"
        />
        <div className="filter-row">
          <select
            className="filter-select"
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p === '전체' ? '지역 전체' : p}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={districts.length === 0}
          >
            <option value="전체">{districts.length === 0 ? '구/동 전체' : `${province} 전체`}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <select
            className="filter-select"
            value={capacityFilter}
            onChange={(e) => onCapacityChange(e.target.value)}
          >
            {CAPACITY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="category-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip-filter ${category === c.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="list-screen-body">
        <p className="list-count">{meetups.length}개의 모임</p>
        <div className="meetup-list">
          {meetups.map((m) => (
            <MeetupCard key={m.id} meetup={m} active={m.id === selectedId} onClick={() => onSelect(m.id)} />
          ))}
          {meetups.length === 0 && <p className="muted">조건에 맞는 모임이 없어요. 필터를 바꿔보세요.</p>}
        </div>
      </div>
    </div>
  );
}
