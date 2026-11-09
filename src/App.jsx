import { useEffect, useMemo, useState } from 'react';
import { buildChatThreads } from './data/meetups';
import { matchesCapacity } from './components/screens/ListScreen';
import { useKakaoLoader } from './hooks/useKakaoLoader';
import { watchSession, logOut, socialLoginKakao, toggleFollow, updateUser } from './lib/auth';
import { consumeKakaoRedirect } from './lib/kakaoAuth';
import { isFirebaseConfigured } from './lib/firebase';
import {
  subscribeToMeetups,
  createMeetup,
  joinMeetup,
  leaveMeetup,
  joinWaitlist,
  leaveWaitlist,
} from './lib/meetupsStore';
import AuthScreen from './components/AuthScreen';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/screens/HomeScreen';
import ListScreen from './components/screens/ListScreen';
import FeedScreen from './components/screens/FeedScreen';
import ChatScreen from './components/screens/ChatScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import MeetupDetail from './components/MeetupDetail';
import MeetupChatRoom from './components/MeetupChatRoom';
import CreateMeetupModal from './components/CreateMeetupModal';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading, null = logged out
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      return;
    }
    let unsub = () => {};
    consumeKakaoRedirect()
      .then((profile) => {
        if (profile) {
          return socialLoginKakao(profile).then(setCurrentUser);
        }
        unsub = watchSession(setCurrentUser);
      })
      .catch((err) => {
        setAuthError(err.message || '카카오 로그인에 실패했어요.');
        unsub = watchSession(setCurrentUser);
      });
    return () => unsub();
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="app">
        <div className="app-frame">
          <FirebaseSetupNotice />
        </div>
      </div>
    );
  }

  if (currentUser === undefined) return null;
  if (!currentUser) {
    return (
      <div className="app">
        <div className="app-frame">
          <AuthScreen onAuthed={setCurrentUser} externalError={authError} />
        </div>
      </div>
    );
  }

  return <AuthedApp currentUser={currentUser} onUserChange={setCurrentUser} />;
}

function AuthedApp({ currentUser, onUserChange }) {
  const CURRENT_USER = currentUser.name;

  const kakaoStatus = useKakaoLoader();
  const [meetups, setMeetups] = useState([]);
  const [tab, setTab] = useState('home');

  const [category, setCategory] = useState('all');
  const [province, setProvince] = useState('전체');
  const [district, setDistrict] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('all');

  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [dmTarget, setDmTarget] = useState(null);
  const [openMeetupChatId, setOpenMeetupChatId] = useState(null);

  useEffect(() => subscribeToMeetups(setMeetups), []);

  const withStatus = (list) =>
    list.map((m) => ({ ...m, status: m.participants.length >= m.capacity ? 'full' : 'open' }));

  const allMeetups = useMemo(() => withStatus(meetups), [meetups]);

  const filteredForList = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allMeetups.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (province !== '전체' && m.city !== province) return false;
      if (district !== '전체' && m.region !== district) return false;
      if (!matchesCapacity(m, capacityFilter)) return false;
      if (kw && !(m.title.toLowerCase().includes(kw) || m.hostName.toLowerCase().includes(kw))) return false;
      return true;
    });
  }, [allMeetups, category, province, district, capacityFilter, keyword]);

  const selected = allMeetups.find((m) => m.id === selectedId) || null;
  const chatThreads = useMemo(() => buildChatThreads(allMeetups, CURRENT_USER), [allMeetups, CURRENT_USER]);

  const handleJoin = (id) => {
    const m = allMeetups.find((x) => x.id === id);
    if (!m || m.participants.includes(CURRENT_USER) || m.participants.length >= m.capacity) return;
    joinMeetup(id, CURRENT_USER);
  };

  const handleLeave = (id) => leaveMeetup(id, CURRENT_USER);

  const handleWaitlist = (id) => {
    const m = allMeetups.find((x) => x.id === id);
    if (!m || m.waitlist.includes(CURRENT_USER)) return;
    joinWaitlist(id, CURRENT_USER);
  };

  const handleLeaveWaitlist = (id) => leaveWaitlist(id, CURRENT_USER);

  const handlePick = (loc) => setPickedLocation(loc);

  const openCreateModal = () => setShowCreate(true);
  const handleStartPickLocation = () => {
    setPickMode(true);
    setTab('home');
  };

  const handleConfirmPick = () => setPickMode(false);

  const handleProvinceChange = (value) => {
    setProvince(value);
    setDistrict('전체');
  };

  const openMeetup = (id) => setSelectedId(id);

  const handleCreateSubmit = async (data) => {
    const ref = await createMeetup(data);
    setShowCreate(false);
    setPickMode(false);
    setPickedLocation(null);
    setTab('home');
    setSelectedId(ref.id);
  };

  const closeCreateModal = () => {
    setShowCreate(false);
    setPickMode(false);
  };

  const handleProfileImageChange = async (dataUrl) => {
    const updated = await updateUser(currentUser.id, (u) => ({ ...u, avatar: dataUrl }));
    onUserChange(updated);
  };

  const handlePatchUser = async (patch) => {
    const updated = await updateUser(currentUser.id, (u) => ({ ...u, ...patch }));
    onUserChange(updated);
  };

  const handleToggleFollow = async (targetName) => {
    if (targetName === CURRENT_USER) return;
    const updated = await toggleFollow(currentUser.id, targetName);
    onUserChange(updated);
  };

  const handleStartDM = (targetName) => {
    if (targetName === CURRENT_USER) return;
    setDmTarget(targetName);
    setTab('chat');
    setSelectedId(null);
  };

  const handleLogout = () => {
    logOut();
  };

  const handleOpenMeetupChat = (id) => {
    setSelectedId(null);
    setOpenMeetupChatId(id);
  };

  const openMeetupChat = allMeetups.find((m) => m.id === openMeetupChatId) || null;

  return (
    <div className="app">
      <div className="app-frame">
        <div className="app-screens">
          {tab === 'home' && (
            <HomeScreen
              kakaoStatus={kakaoStatus}
              meetups={allMeetups}
              selectedId={selectedId}
              onSelect={openMeetup}
              pickMode={pickMode}
              pickedLocation={pickedLocation}
              onPick={handlePick}
              onOpenCreate={openCreateModal}
              onConfirmPick={handleConfirmPick}
            />
          )}

          {tab === 'list' && (
            <ListScreen
              meetups={filteredForList}
              category={category}
              onCategoryChange={setCategory}
              province={province}
              onProvinceChange={handleProvinceChange}
              district={district}
              onDistrictChange={setDistrict}
              keyword={keyword}
              onKeywordChange={setKeyword}
              capacityFilter={capacityFilter}
              onCapacityChange={setCapacityFilter}
              selectedId={selectedId}
              onSelect={openMeetup}
            />
          )}

          {tab === 'feed' && (
            <FeedScreen
              meetups={allMeetups}
              onOpenMeetup={openMeetup}
              currentUser={CURRENT_USER}
              following={currentUser.following}
              onToggleFollow={handleToggleFollow}
              onStartDM={handleStartDM}
            />
          )}

          {tab === 'chat' && (
            <ChatScreen
              threads={chatThreads}
              onOpenMeetup={handleOpenMeetupChat}
              currentUser={CURRENT_USER}
              dmTarget={dmTarget}
              onConsumeDmTarget={() => setDmTarget(null)}
            />
          )}

          {tab === 'profile' && (
            <ProfileScreen
              meetups={allMeetups}
              onOpenMeetup={openMeetup}
              currentUser={currentUser}
              profileImage={currentUser.avatar}
              onProfileImageChange={handleProfileImageChange}
              onPatchUser={handlePatchUser}
              onLogout={handleLogout}
            />
          )}
        </div>

        {!pickMode && (
          <BottomNav
            active={tab}
            onChange={setTab}
            badges={{ chat: chatThreads.length }}
            profileImage={currentUser.avatar}
          />
        )}

        {selected && (
          <div className="sheet-overlay" onClick={() => setSelectedId(null)}>
            <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
              <MeetupDetail
                meetup={selected}
                currentUser={CURRENT_USER}
                following={currentUser.following}
                onToggleFollow={handleToggleFollow}
                onStartDM={handleStartDM}
                onOpenChat={handleOpenMeetupChat}
                onClose={() => setSelectedId(null)}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onWaitlist={handleWaitlist}
                onLeaveWaitlist={handleLeaveWaitlist}
              />
            </div>
          </div>
        )}

        {openMeetupChat && (
          <div className="chat-room-overlay">
            <MeetupChatRoom
              meetup={openMeetupChat}
              currentUser={CURRENT_USER}
              onClose={() => setOpenMeetupChatId(null)}
            />
          </div>
        )}

        {showCreate && (
          <div style={{ display: pickMode ? 'none' : 'block' }}>
            <CreateMeetupModal
              pickedLocation={pickedLocation}
              onPickLocation={handleStartPickLocation}
              onClose={closeCreateModal}
              onSubmit={handleCreateSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
