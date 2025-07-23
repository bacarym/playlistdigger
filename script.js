// Clé API YouTube (à garder sécurisée côté serveur dans une vraie app)
const API_KEY = 'AIzaSyBmUM8idf3U-J-4GHeL5rCRPNsV56qshFg';
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Clé API Discogs
const DISCOGS_TOKEN = 'XvbJrfbtCsGlSRipdODoCZEpmDHwoxBLVbYhrprE';
const DISCOGS_API_URL = 'https://api.discogs.com';

// État de l'application
let player;
let currentPlaylist = [];
let currentTrackIndex = -1;
let progressInterval;
let isPlaying = false;
let userPlaylists = [];
let trackToSave = null;
let searchHistory = [];
let currentPage = 'home';
let discogsSearchHistory = [];
let currentTracklistTracks = [];
let isPlayingFromTracklist = false;

// Éléments du DOM
const form = document.getElementById('playlistForm');
const channelUrlInput = document.getElementById('channelUrl');
const videoCountSelect = document.getElementById('videoCount');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const playlistContainer = document.getElementById('playlistContainer');
const channelNameH1 = document.getElementById('channelName');
const channelThumbnailImg = document.getElementById('channelThumbnail');
const videoCountInfoSpan = document.getElementById('videoCountInfo');
const playlistDiv = document.getElementById('playlist');
const openYouTubeBtn = document.getElementById('openYouTubeBtn');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const userPlaylistsDiv = document.getElementById('user-playlists');
const saveToPlaylistModal = document.getElementById('saveToPlaylistModal');
const modalCloseBtn = document.querySelector('.modal-close-btn');
const modalPlaylistList = document.getElementById('modal-playlist-list');
const newPlaylistNameInput = document.getElementById('newPlaylistName');
const confirmNewPlaylistBtn = document.getElementById('confirmNewPlaylistBtn');

// Éléments de l'historique
const searchHistoryDiv = document.getElementById('searchHistory');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Éléments Discogs
const discogsSearchForm = document.getElementById('discogsSearchForm');
const discogsSearchQuery = document.getElementById('discogsSearchQuery');
const discogsSearchBtn = document.getElementById('discogsSearchBtn');
const discogsSearchText = document.getElementById('discogsSearchText');
const discogsSearchLoading = document.getElementById('discogsSearchLoading');
const discogsError = document.getElementById('discogsError');
const discogsTracksList = document.getElementById('discogsTracksList');
const discogsResultsPage = document.getElementById('discogs-results-page');
const discogsResultsPageTitle = document.getElementById('discogsResultsPageTitle');
const discogsResultsPageCount = document.getElementById('discogsResultsPageCount');
const discogsBackBtn = document.getElementById('discogs-back-btn');
const discogsHistoryList = document.getElementById('discogsHistoryList');
const clearDiscogsHistoryBtn = document.getElementById('clearDiscogsHistoryBtn');

// Éléments tracklist Discogs
const discogsTracklistPage = document.getElementById('discogs-tracklist-page');
const discogsTracklistBackBtn = document.getElementById('discogs-tracklist-back-btn');
const tracklistAlbumArt = document.getElementById('tracklistAlbumArt');
const tracklistTitle = document.getElementById('tracklistTitle');
const tracklistArtist = document.getElementById('tracklistArtist');
const tracklistYear = document.getElementById('tracklistYear');
const tracklistFormat = document.getElementById('tracklistFormat');
const tracklistLabel = document.getElementById('tracklistLabel');
const tracklistLoadingContainer = document.getElementById('tracklistLoadingContainer');
const loadingProgressText = document.getElementById('loadingProgressText');
const tracklistTracks = document.getElementById('tracklistTracks');

// Éléments du lecteur
const playerBar = document.querySelector('.player-bar');
const playPauseBtn = document.getElementById('playPauseBtn');
const playerThumbnail = document.getElementById('player-thumbnail');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const currentTimeSpan = document.getElementById('currentTime');
const totalDurationSpan = document.getElementById('totalDuration');
const progressBar = document.getElementById('progressBar');
const progressBarWrapper = document.querySelector('.progress-bar-wrapper');


// --- Initialisation du lecteur YouTube ---
function onYouTubeIframeAPIReady() {
    const currentOrigin = window.location.origin;
    console.log("✅ API YouTube chargée ! Initialisation du lecteur depuis :", currentOrigin);

    try {
        player = new YT.Player('youtube-player-container', {
            height: '1',
            width: '1',
            playerVars: {
                'playsinline': 1,
                'origin': currentOrigin,
                'enablejsapi': 1,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        console.log("✅ Player YouTube créé avec succès");
    } catch (error) {
        console.error("❌ Erreur lors de la création du player:", error);
    }
}

function onPlayerError(event) {
    console.error("❌ Erreur du player YouTube:", event.data);
}

function onPlayerReady(event) {
    console.log("✅ Lecteur YouTube prêt et opérationnel !");
    console.log("✅ Player state:", player.getPlayerState());
    console.log("✅ Player methods available:", {
        loadVideoById: typeof player.loadVideoById,
        playVideo: typeof player.playVideo,
        pauseVideo: typeof player.pauseVideo,
        getPlayerState: typeof player.getPlayerState
    });
}

// Vérifier si le player est prêt
function isPlayerReady() {
    const ready = player && 
           player.loadVideoById && 
           player.getPlayerState && 
           typeof player.getPlayerState === 'function';
           
    if (!ready) {
        console.log("🔍 Diagnostic player:", {
            playerExists: !!player,
            loadVideoById: !!(player && player.loadVideoById),
            getPlayerState: !!(player && player.getPlayerState),
            getPlayerStateType: player && typeof player.getPlayerState,
            YTAvailable: typeof YT !== 'undefined',
            YTPlayerAvailable: typeof YT !== 'undefined' && !!YT.Player
        });
    }
    
    return ready;
}

// Attendre que le player soit prêt
function waitForPlayer(callback, maxAttempts = 10) {
    let attempts = 0;
    
    const checkPlayer = () => {
        attempts++;
        if (isPlayerReady()) {
            console.log('Player prêt après', attempts, 'tentatives');
            callback();
        } else if (attempts < maxAttempts) {
            console.log('Player pas encore prêt, tentative', attempts);
            setTimeout(checkPlayer, 500);
        } else {
            console.error('Player non disponible après', maxAttempts, 'tentatives');
        }
    };
    
    checkPlayer();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayPauseButton();
        startProgressTracking();
        
        // Gérer différemment selon la source de lecture
        if (isPlayingFromTracklist && currentTracklistTracks[currentTrackIndex]) {
            const currentTrack = currentTracklistTracks[currentTrackIndex];
            console.log('Lecture depuis tracklist:', currentTrack.title);
            // Pas besoin d'updateNowPlayingUI car les infos sont déjà dans le player
        } else if (currentPlaylist[currentTrackIndex]) {
            updateNowPlayingUI(currentPlaylist[currentTrackIndex]);
            highlightCurrentTrack();
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        updatePlayPauseButton();
        clearInterval(progressInterval);
    } else if (event.data === YT.PlayerState.ENDED) {
        playNextTrack();
    }
}

// --- Fonctions de l'API YouTube ---
async function fetchChannelId(handle) {
    let url = `${API_BASE_URL}/channels?key=${API_KEY}&part=id`;
    if (handle.startsWith('@')) {
        url += `&forHandle=${handle.substring(1)}`;
    } else {
         url += `&forUsername=${handle}`;
    }
    
    // Fallback à la recherche si non trouvé
    const searchUrl = `${API_BASE_URL}/search?q=${encodeURIComponent(handle)}&type=channel&key=${API_KEY}&part=snippet&maxResults=1`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.items && data.items.length > 0) return data.items[0].id;

        response = await fetch(searchUrl);
        data = await response.json();
        if (data.items && data.items.length > 0) return data.items[0].snippet.channelId;
        
        return null;
    } catch (error) {
        console.error("Erreur de fetchChannelId:", error);
        return null;
    }
}

function extractChannelHandle(url) {
    const patterns = [
        /youtube\.com\/(?:c\/|channel\/|user\/)?([^/]+)/,
        /youtube\.com\/@([^/]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1].startsWith('@') ? match[1] : `@${match[1]}`;
        }
    }
    return null;
}

async function getChannelInfo(channelId) {
    const url = `${API_BASE_URL}/channels?id=${channelId}&key=${API_KEY}&part=snippet,contentDetails,statistics`;
    const response = await fetch(url);
    return await response.json();
}

async function getPlaylistItems(playlistId, maxResults) {
    let items = [];
    let nextPageToken = '';
    while (items.length < maxResults) {
        const url = `${API_BASE_URL}/playlistItems?playlistId=${playlistId}&key=${API_KEY}&part=snippet&maxResults=50&pageToken=${nextPageToken}`;
        const response = await fetch(url);
        const data = await response.json();
        items = items.concat(data.items.filter(item => item.snippet.title !== "Private video" && item.snippet.title !== "Deleted video"));
        nextPageToken = data.nextPageToken;
        if (!nextPageToken) break;
    }
    return items.slice(0, maxResults);
}

async function getVideoStats(videoIds) {
    const url = `${API_BASE_URL}/videos?id=${videoIds.join(',')}&key=${API_KEY}&part=statistics`;
    const response = await fetch(url);
    return await response.json();
}

// --- Logique principale ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const url = channelUrlInput.value;
        const handle = extractChannelHandle(url);
        if (!handle) throw new Error("URL de chaîne invalide.");
        
        const channelId = await fetchChannelId(handle.replace('@', ''));
        if (!channelId) throw new Error("Chaîne introuvable.");

        const channelData = await getChannelInfo(channelId);
        const channelInfo = channelData.items[0];

        updatePlaylistHeader(channelInfo);

        const uploadsPlaylistId = channelInfo.contentDetails.relatedPlaylists.uploads;
        const videoCount = parseInt(videoCountSelect.value);
        const videos = await getPlaylistItems(uploadsPlaylistId, videoCount);
        
        // Ajouter à l'historique
        addToSearchHistory(channelInfo, videos.length);
        
        const videoIds = videos.map(v => v.snippet.resourceId.videoId);
        const statsData = await getVideoStats(videoIds);
        
        currentPlaylist = videos.map(video => {
            const stats = statsData.items.find(s => s.id === video.snippet.resourceId.videoId);
            return {
                id: video.snippet.resourceId.videoId,
                title: video.snippet.title,
                artist: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.default.url,
                plays: stats?.statistics.viewCount || 0,
                likes: stats?.statistics.likeCount || 0,
            };
        });

        currentPlaylist.sort((a, b) => b.likes - a.likes);
        
        renderPlaylist();
        playlistContainer.classList.remove('hidden');

    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
});

// --- Rendu et UI ---

function renderPlaylist() {
    playlistDiv.innerHTML = '';
    currentPlaylist.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'video-item';
        trackElement.dataset.index = index;
        trackElement.innerHTML = `
            <div class="track-number">
                <span class="track-index">${index + 1}</span>
                <i class="fas fa-play play-icon-hover"></i>
            </div>
            <div class="track-title">
                <div class="video-info">
                    <img src="${track.thumbnail}" alt="${track.title}">
                    <div>
                        <div class="video-title">${track.title}</div>
                        <div class="video-artist">${track.artist}</div>
                    </div>
                </div>
            </div>
            <div class="track-plays">${formatNumber(track.plays)}</div>
            <div class="track-likes">${formatNumber(track.likes)}</div>
            <div class="track-actions">
                <button class="like-btn"><i class="far fa-heart"></i></button>
            </div>
        `;
        trackElement.querySelector('.like-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openSaveToPlaylistModal(track);
        });
        trackElement.addEventListener('click', () => playTrack(index));
        playlistDiv.appendChild(trackElement);
    });
}

function updatePlaylistHeader(channelInfo) {
    channelNameH1.textContent = channelInfo.snippet.title;
    channelThumbnailImg.src = channelInfo.snippet.thumbnails.high.url;
    // La ligne suivante est retirée pour ne plus mettre le fond
    // document.documentElement.style.setProperty('--channel-art', `url(${channelInfo.snippet.thumbnails.high.url})`);
    videoCountInfoSpan.textContent = `${formatNumber(channelInfo.statistics.videoCount)} vidéos`;
    
    openYouTubeBtn.onclick = () => {
        window.open(`https://www.youtube.com/channel/${channelInfo.id}`, '_blank');
    };
}

function highlightCurrentTrack() {
    document.querySelectorAll('.video-item').forEach(item => {
        const trackIndexEl = item.querySelector('.track-index');
        const playIconEl = item.querySelector('.play-icon-hover');

        item.classList.remove('playing');
        if (trackIndexEl) trackIndexEl.style.display = 'inline';
        if (playIconEl) playIconEl.style.display = 'none';

        if (parseInt(item.dataset.index) === currentTrackIndex) {
            item.classList.add('playing');
        }
    });
}

function updateNowPlayingUI(track) {
    if (!track) return;
    playerThumbnail.src = track.thumbnail;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    totalDurationSpan.textContent = formatTime(player.getDuration());
}

// --- Contrôles du lecteur ---

function playTrack(index) {
    currentTrackIndex = index;
    const track = currentPlaylist[index];
    player.loadVideoById(track.id);
    playerBar.classList.add('active'); // Peut-être pour montrer la barre
}

function playNextTrack() {
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    playTrack(nextIndex);
}

function playPreviousTrack() {
    const prevIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrack(prevIndex);
}

function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseButton() {
    const icon = playPauseBtn.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function startProgressTracking() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            progressBar.style.width = `${progress}%`;
            currentTimeSpan.textContent = formatTime(currentTime);
            totalDurationSpan.textContent = formatTime(duration);
        }
    }, 1000);
}

// --- Gestion des Playlists Utilisateur ---

function loadPlaylistsFromStorage() {
    try {
        const storedPlaylists = localStorage.getItem('userPlaylists');
        console.log("CHARGEMENT : Données brutes depuis localStorage:", storedPlaylists);
        console.log("CHARGEMENT : Type des données:", typeof storedPlaylists);
        
        if (storedPlaylists && storedPlaylists !== 'null') {
            userPlaylists = JSON.parse(storedPlaylists);
            console.log("CHARGEMENT : Playlists chargées dans l'application:", userPlaylists);
            console.log("CHARGEMENT : Nombre de playlists chargées:", userPlaylists.length);
            
            // Vérifier la structure des données
            if (Array.isArray(userPlaylists)) {
                console.log("CHARGEMENT : Structure des données correcte (Array)");
            } else {
                console.error("CHARGEMENT : Structure des données incorrecte - pas un Array");
                userPlaylists = [];
            }
        } else {
            console.log("CHARGEMENT : Aucune playlist trouvée dans localStorage.");
            userPlaylists = [];
        }
    } catch (error) {
        console.error("CHARGEMENT : Erreur lors du chargement:", error);
        userPlaylists = [];
    }
}

function savePlaylistsToStorage() {
    try {
        const dataToSave = JSON.stringify(userPlaylists);
        localStorage.setItem('userPlaylists', dataToSave);
        console.log("SAUVEGARDE : Playlists sauvegardées dans localStorage:", dataToSave);
        
        // Vérifier immédiatement que la sauvegarde a fonctionné
        const verification = localStorage.getItem('userPlaylists');
        if (verification === dataToSave) {
            console.log("SAUVEGARDE : Vérification réussie - données bien sauvegardées");
        } else {
            console.error("SAUVEGARDE : Échec de la vérification - les données ne correspondent pas");
        }
    } catch (error) {
        console.error("SAUVEGARDE : Erreur lors de la sauvegarde:", error);
    }
}

function renderUserPlaylists() {
    userPlaylistsDiv.innerHTML = '';
    if (userPlaylists.length === 0) {
        userPlaylistsDiv.innerHTML = '<p style="padding: 0 8px; color: var(--text-color-light);">Créez votre première playlist !</p>';
        return;
    }
    userPlaylists.forEach(playlist => {
        const playlistEl = document.createElement('div');
        playlistEl.className = 'playlist-item';
        playlistEl.innerHTML = `
            <img src="${playlist.tracks[0]?.thumbnail || 'https://via.placeholder.com/48'}" alt="${playlist.name}">
            <div class="playlist-info">
                <div class="name">${playlist.name}</div>
                <div class="count">${playlist.tracks.length} morceau(x)</div>
            </div>
        `;
        playlistEl.addEventListener('click', () => displayUserPlaylist(playlist));
        userPlaylistsDiv.appendChild(playlistEl);
    });
}

function createNewPlaylist(name) {
    if (!name || userPlaylists.find(p => p.name === name)) {
        showError("Nom de playlist invalide ou déjà utilisé.");
        return null;
    }
    const newPlaylist = {
        id: `playlist_${Date.now()}`,
        name: name,
        tracks: []
    };
    userPlaylists.unshift(newPlaylist);
    savePlaylistsToStorage();
    renderUserPlaylists();
    return newPlaylist;
}

function addTrackToPlaylist(track, playlist) {
    if (playlist.tracks.find(t => t.id === track.id)) {
        showError("Ce morceau est déjà dans la playlist.");
        return;
    }
    playlist.tracks.push(track);
    savePlaylistsToStorage();
    renderUserPlaylists(); // Mettre à jour le nombre de morceaux
    showError(`${track.title} a été ajouté à ${playlist.name}`, 'success');
}

function displayUserPlaylist(playlist) {
    currentPlaylist = playlist.tracks;
    renderPlaylist();
    
    channelNameH1.textContent = playlist.name;
    channelThumbnailImg.src = playlist.tracks[0]?.thumbnail || 'https://via.placeholder.com/150';
    videoCountInfoSpan.textContent = `${playlist.tracks.length} morceaux`;
    openYouTubeBtn.classList.add('hidden');
    playlistContainer.classList.remove('hidden');
}


// --- Modale de Sauvegarde ---
function openSaveToPlaylistModal(track) {
    trackToSave = track;
    modalPlaylistList.innerHTML = '';
    userPlaylists.forEach(playlist => {
        const li = document.createElement('li');
        li.textContent = playlist.name;
        li.addEventListener('click', () => {
            addTrackToPlaylist(trackToSave, playlist);
            closeSaveToPlaylistModal();
        });
        modalPlaylistList.appendChild(li);
    });
    saveToPlaylistModal.classList.remove('hidden');
}

function closeSaveToPlaylistModal() {
    saveToPlaylistModal.classList.add('hidden');
    newPlaylistNameInput.value = '';
    trackToSave = null;
}

modalCloseBtn.addEventListener('click', closeSaveToPlaylistModal);
saveToPlaylistModal.addEventListener('click', (e) => {
    if (e.target === saveToPlaylistModal) {
        closeSaveToPlaylistModal();
    }
});

confirmNewPlaylistBtn.addEventListener('click', () => {
    const newName = newPlaylistNameInput.value.trim();
    if (newName && trackToSave) {
        const newPlaylist = createNewPlaylist(newName);
        if (newPlaylist) {
            addTrackToPlaylist(trackToSave, newPlaylist);
            closeSaveToPlaylistModal();
        }
    }
});

createPlaylistBtn.addEventListener('click', () => {
    const playlistName = prompt("Entrez le nom de la nouvelle playlist :");
    if (playlistName) {
        createNewPlaylist(playlistName.trim());
    }
});

// Event listeners pour les boutons du lecteur
playPauseBtn.addEventListener('click', togglePlayPause);
document.querySelector('.player-btn:has(.fa-step-forward)').addEventListener('click', playNextTrack);
document.querySelector('.player-btn:has(.fa-step-backward)').addEventListener('click', playPreviousTrack);
progressBarWrapper.addEventListener('click', (e) => {
    const rect = progressBarWrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const progress = (clickX / width);
    const newTime = player.getDuration() * progress;
    player.seekTo(newTime, true);
});

// Event listeners pour l'historique
clearHistoryBtn.addEventListener('click', clearSearchHistory);

// --- Utilitaires ---
function setLoading(isLoading) {
    if (isLoading) {
        btnText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        generateBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

function showError(message, type = 'error') {
    errorDiv.textContent = message;
    errorDiv.className = `error-message ${type}`;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

// --- Gestion de l'historique des recherches ---

function loadSearchHistory() {
    try {
        const storedHistory = localStorage.getItem('searchHistory');
        console.log("HISTORIQUE : Données brutes depuis localStorage:", storedHistory);
        
        if (storedHistory && storedHistory !== 'null') {
            searchHistory = JSON.parse(storedHistory);
            console.log("HISTORIQUE : Historique chargé:", searchHistory.length);
            
            if (Array.isArray(searchHistory)) {
                console.log("HISTORIQUE : Structure des données correcte (Array)");
            } else {
                console.error("HISTORIQUE : Structure des données incorrecte - pas un Array");
                searchHistory = [];
            }
        } else {
            console.log("HISTORIQUE : Aucun historique trouvé dans localStorage.");
            searchHistory = [];
        }
    } catch (error) {
        console.error("HISTORIQUE : Erreur lors du chargement:", error);
        searchHistory = [];
    }
}

function saveSearchHistory() {
    try {
        const dataToSave = JSON.stringify(searchHistory);
        localStorage.setItem('searchHistory', dataToSave);
        console.log("HISTORIQUE : Historique sauvegardé dans localStorage:", dataToSave);
    } catch (error) {
        console.error("HISTORIQUE : Erreur lors de la sauvegarde:", error);
    }
}

function addToSearchHistory(channelInfo, videoCount) {
    const historyItem = {
        id: channelInfo.id,
        title: channelInfo.snippet.title,
        thumbnail: channelInfo.snippet.thumbnails.default.url,
        videoCount: videoCount,
        subscriberCount: channelInfo.statistics.subscriberCount,
        date: new Date().toISOString(),
        url: channelUrlInput.value
    };
    
    // Supprimer l'entrée existante si elle existe
    searchHistory = searchHistory.filter(item => item.id !== channelInfo.id);
    
    // Ajouter au début de la liste
    searchHistory.unshift(historyItem);
    
    // Limiter à 25 entrées maximum
    if (searchHistory.length > 25) {
        searchHistory = searchHistory.slice(0, 25);
    }
    
    saveSearchHistory();
    renderSearchHistory();
    
    console.log("HISTORIQUE : Ajouté:", historyItem.title);
}

function renderSearchHistory() {
    if (searchHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <p>Aucune recherche récente</p>
                <p>Recherchez une chaîne pour voir l'historique ici</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = searchHistory.map(item => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        return `
            <div class="history-item" data-channel-id="${item.id}" data-url="${item.url}">
                <div class="history-item-info">
                    <img src="${item.thumbnail}" alt="${item.title}" class="history-item-thumbnail">
                    <div class="history-item-details">
                        <div class="history-item-title">${item.title}</div>
                        <div class="history-item-meta">${formatNumber(item.videoCount)} vidéos • ${formatNumber(item.subscriberCount)} abonnés</div>
                    </div>
                </div>
                <div class="history-item-date">${formattedDate}</div>
            </div>
        `;
    }).join('');
    
    // Ajouter les événements click
    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            channelUrlInput.value = url;
            
            // Déclencher la recherche
            form.dispatchEvent(new Event('submit'));
        });
    });
}

function clearSearchHistory() {
    searchHistory = [];
    saveSearchHistory();
    renderSearchHistory();
    console.log("HISTORIQUE : Historique effacé");
}



// --- Initialisation de l'application ---
function initializeApp() {
    console.log("INIT : Initialisation de l'application");
    
    // Vérifier si localStorage est disponible
    if (typeof(Storage) !== "undefined") {
        console.log("INIT : localStorage est disponible");
        
        // Tester l'écriture/lecture localStorage
        try {
            localStorage.setItem('test', 'testValue');
            const testRead = localStorage.getItem('test');
            console.log("INIT : Test localStorage - Écrit/Lu:", testRead);
            localStorage.removeItem('test');
        } catch (e) {
            console.error("INIT : Erreur lors du test localStorage:", e);
        }
        
        // Charger les playlists et l'historique
        loadPlaylistsFromStorage();
        renderUserPlaylists();
        loadSearchHistory();
        renderSearchHistory();
        loadDiscogsHistory();
        renderDiscogsHistory();
        
        console.log("INIT : Playlists chargées:", userPlaylists.length);
        console.log("INIT : Historique YouTube chargé:", searchHistory.length);
        console.log("INIT : Historique Discogs chargé:", discogsSearchHistory.length);
    } else {
        console.error("INIT : localStorage n'est pas disponible");
    }
    
    // Vérifier si l'API YouTube est chargée
    initializeYouTubePlayer();
}

// Initialiser le player YouTube
function initializeYouTubePlayer() {
    console.log("🎵 Vérification de l'API YouTube...");
    
    if (typeof YT !== 'undefined' && YT.Player) {
        console.log("✅ API YouTube déjà disponible");
        if (!player) {
            onYouTubeIframeAPIReady();
        }
    } else {
        console.log("⏳ API YouTube pas encore chargée, tentative d'initialisation...");
        
        // Attendre que l'API se charge
        let attempts = 0;
        const checkYTAPI = () => {
            attempts++;
            if (typeof YT !== 'undefined' && YT.Player) {
                console.log("✅ API YouTube chargée après", attempts, "tentatives");
                if (!player) {
                    onYouTubeIframeAPIReady();
                }
            } else if (attempts < 20) {
                console.log("⏳ Tentative", attempts, "- API YouTube pas encore prête");
                setTimeout(checkYTAPI, 500);
            } else {
                console.error("❌ API YouTube non disponible après 20 tentatives");
                // Essayer de recharger le script
                console.log("🔄 Tentative de rechargement du script YouTube...");
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.onload = () => console.log("📜 Script YouTube rechargé");
                script.onerror = () => console.error("❌ Erreur lors du rechargement du script YouTube");
                document.head.appendChild(script);
            }
        };
        
        checkYTAPI();
    }
}

// --- Fonctionnalités Discogs ---
async function searchDiscogsTrack(query) {
    const searchUrl = `${DISCOGS_API_URL}/database/search`;
    const params = new URLSearchParams({
        q: query,
        type: 'release',
        token: DISCOGS_TOKEN,
        per_page: 50
    });

    try {
        const response = await fetch(`${searchUrl}?${params}`, {
            headers: {
                'User-Agent': 'MelodyMix/1.0 +http://localhost:8000'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur Discogs: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la recherche Discogs:', error);
        throw error;
    }
}

function displayDiscogsResults(data, query) {
    const tracks = data.results || [];
    
    // Mise à jour du titre et du nombre de résultats
    discogsResultsPageTitle.textContent = `Résultats pour "${query}"`;
    discogsResultsPageCount.textContent = `${tracks.length} résultat${tracks.length > 1 ? 's' : ''}`;
    
    // Vider la liste précédente
    discogsTracksList.innerHTML = '';
    
    if (tracks.length === 0) {
        discogsTracksList.innerHTML = `
            <div class="no-results">
                <p>Aucun résultat trouvé pour "${query}"</p>
            </div>
        `;
    } else {
        // Afficher chaque track
        tracks.forEach((track, index) => {
            const trackElement = createDiscogsTrackElement(track, index + 1);
            discogsTracksList.appendChild(trackElement);
        });
    }
    
    // Naviguer vers la page de résultats
    navigateToDiscogsResults();
}

function createDiscogsTrackElement(track, index) {
    const div = document.createElement('div');
    div.className = 'track-item';
    
    const title = track.title || 'Titre inconnu';
    const artist = track.title ? track.title.split(' - ')[0] : 'Artiste inconnu';
    const album = track.title ? track.title.split(' - ').slice(1).join(' - ') : '';
    const year = track.year || '';
    
    div.innerHTML = `
        <div class="track-info">
            <div class="track-title">${title}</div>
            <div class="track-artist">${artist}</div>
            <div class="track-preview">
                <button class="preview-btn" data-release-id="${track.id}" title="Écouter un aperçu de la première track">
                    <i class="fas fa-play"></i>
                    Preview
                </button>
            </div>
        </div>
        <div class="track-year">${year}</div>
    `;
    
    // Event listener pour le clic général sur l'élément (aller à la tracklist)
    div.addEventListener('click', (e) => {
        // Ne pas déclencher si on clique sur le bouton preview
        if (!e.target.closest('.preview-btn')) {
            console.log('Track Discogs sélectionné:', track);
            if (track.id) {
                handleDiscogsReleaseClick(track.id);
            }
        }
    });
    
    // Event listener spécifique pour le bouton preview
    const previewBtn = div.querySelector('.preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur Preview pour:', track.title);
            handlePreviewClick(track.id, artist);
        });
    }
    
    return div;
}

function showDiscogsError(message) {
    discogsError.textContent = message;
    discogsError.classList.remove('hidden');
    
    setTimeout(() => {
        discogsError.classList.add('hidden');
    }, 5000);
}

// Récupération des détails d'une release Discogs
async function getDiscogsReleaseDetails(releaseId) {
    const releaseUrl = `${DISCOGS_API_URL}/releases/${releaseId}`;
    
    try {
        const response = await fetch(releaseUrl, {
            headers: {
                'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
                'User-Agent': 'MelodyMix/1.0 +http://localhost:8000'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur Discogs: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération de la release:', error);
        throw error;
    }
}

// Recherche YouTube pour une track spécifique
async function searchYouTubeForTrack(trackTitle, artistName) {
    const query = `${artistName} ${trackTitle}`;
    const searchUrl = `${API_BASE_URL}/search`;
    const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: API_KEY
    });

    try {
        const response = await fetch(`${searchUrl}?${params}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            // Récupérer les stats de la vidéo (vues et likes)
            const statsResponse = await fetch(`${API_BASE_URL}/videos?part=statistics&id=${video.id.videoId}&key=${API_KEY}`);
            const statsData = await statsResponse.json();
            
            const stats = statsData.items[0]?.statistics || {};
            
            return {
                id: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.medium.url,
                channelTitle: video.snippet.channelTitle,
                viewCount: stats.viewCount || '0',
                likeCount: stats.likeCount || '0'
            };
        }
        return null;
    } catch (error) {
        console.error('Erreur recherche YouTube:', error);
        return null;
    }
}

// Traitement d'une release complète
async function processDiscogsRelease(releaseData) {
    const tracks = releaseData.tracklist || [];
    const processedTracks = [];
    
    // Afficher le chargement
    tracklistLoadingContainer.classList.remove('hidden');
    loadingProgressText.textContent = `0/${tracks.length}`;
    
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        loadingProgressText.textContent = `${i + 1}/${tracks.length}`;
        
        // Rechercher cette track sur YouTube
        const youtubeData = await searchYouTubeForTrack(
            track.title, 
            releaseData.artists?.[0]?.name || 'Unknown Artist'
        );
        
        processedTracks.push({
            position: track.position || (i + 1),
            title: track.title,
            duration: track.duration || '',
            youtubeData: youtubeData,
            originalTrack: track
        });
        
        // Petite pause pour éviter les rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Cacher le chargement
    tracklistLoadingContainer.classList.add('hidden');
    
    return processedTracks;
}

// Afficher la tracklist
function displayTracklist(releaseData, processedTracks) {
    // Sauvegarder les tracks pour la lecture
    currentTracklistTracks = processedTracks;
    
    // Mettre à jour les informations de l'album
    tracklistTitle.textContent = releaseData.title || 'Titre inconnu';
    tracklistArtist.textContent = releaseData.artists?.[0]?.name || 'Artiste inconnu';
    tracklistYear.textContent = releaseData.year ? `${releaseData.year}` : '';
    tracklistFormat.textContent = releaseData.formats?.map(f => f.name).join(', ') || '';
    tracklistLabel.textContent = releaseData.labels?.[0]?.name || '';
    
    // Image de l'album
    if (releaseData.images && releaseData.images.length > 0) {
        tracklistAlbumArt.src = releaseData.images[0].uri;
    }
    
    // Vider la liste précédente
    tracklistTracks.innerHTML = '';
    
    // Afficher chaque track
    processedTracks.forEach((track, index) => {
        const trackElement = createTracklistElement(track, index, releaseData.artists?.[0]?.name || 'Artiste inconnu');
        tracklistTracks.appendChild(trackElement);
    });
}

// Créer un élément de track pour la tracklist
function createTracklistElement(track, index, artistName) {
    const div = document.createElement('div');
    div.className = 'table-row';
    
    const hasYouTube = track.youtubeData !== null;
    const playButton = hasYouTube ? 
        `<button class="play-btn" data-video-id="${track.youtubeData.id}" data-track-index="${index}" title="Écouter cette track">
            <i class="fas fa-play"></i>
        </button>` : 
        `<span class="no-audio" title="Cette track n'a pas été trouvée sur YouTube"><i class="fas fa-ban"></i></span>`;
    
    const viewCount = hasYouTube ? 
        parseInt(track.youtubeData.viewCount).toLocaleString() : 
        'N/A';
    
    const likeCount = hasYouTube ? 
        parseInt(track.youtubeData.likeCount).toLocaleString() : 
        'N/A';
    
    // Nettoyer et formater la durée
    const duration = track.duration || '';
    const cleanDuration = duration.toString().replace(/[^\d:]/g, '');
    
    div.innerHTML = `
        <div class="track-number">${track.position}</div>
        <div class="track-title">
            <div class="track-info">
                <div class="track-name">${track.title}</div>
                ${hasYouTube ? `<div class="track-source">Trouvé sur YouTube</div>` : `<div class="track-source no-source">Non trouvé sur YouTube</div>`}
            </div>
        </div>
        <div class="track-duration">${cleanDuration}</div>
        <div class="track-likes">${likeCount}</div>
        <div class="track-plays">${viewCount}</div>
        <div class="track-actions">
            ${playButton}
            <button class="save-track-btn" data-track='${JSON.stringify({
                id: hasYouTube ? track.youtubeData.id : null,
                title: track.title,
                artist: artistName,
                thumbnail: hasYouTube ? track.youtubeData.thumbnail : 'https://via.placeholder.com/120'
            }).replace(/"/g, '&quot;')}' title="Ajouter à une playlist">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    // Event listeners pour les boutons
    if (hasYouTube) {
        const playBtn = div.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic sur bouton play, track:', track.title);
                playTrackFromTracklist(track, index, artistName);
            });
        } else {
            console.error('Bouton play non trouvé dans le DOM');
        }
    }
    
    const saveBtn = div.querySelector('.save-track-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur bouton save, track:', track.title);
            const trackData = JSON.parse(e.target.closest('.save-track-btn').dataset.track);
            if (trackData.id) {
                trackToSave = trackData;
                showSaveToPlaylistModal();
            }
        });
    } else {
        console.error('Bouton save non trouvé dans le DOM');
    }
    
    return div;
}

// Jouer une track depuis la tracklist
function playTrackFromTracklist(track, index, artistName) {
    if (!track.youtubeData) {
        console.log('Aucune donnée YouTube pour cette track');
        return;
    }
    
    console.log('Lecture de la track:', track.title, 'ID YouTube:', track.youtubeData.id);
    
    // Mettre à jour les informations du lecteur
    playerThumbnail.src = track.youtubeData.thumbnail;
    playerTitle.textContent = track.title;
    playerArtist.textContent = artistName || tracklistArtist.textContent;
    
    // Marquer qu'on joue depuis la tracklist
    isPlayingFromTracklist = true;
    currentTrackIndex = index;
    
    // Vérifier si le player existe, sinon l'initialiser
    if (!player) {
        console.log("🔄 Player non initialisé, tentative d'initialisation...");
        initializeYouTubePlayer();
    }
    
    // Attendre que le player soit prêt et lancer la vidéo
    waitForPlayer(() => {
        try {
            console.log('🎵 Chargement de la vidéo YouTube:', track.youtubeData.id);
            player.loadVideoById(track.youtubeData.id);
            
            // Vérifier après un délai si la lecture a commencé
            setTimeout(() => {
                try {
                    const state = player.getPlayerState();
                    console.log('🎵 Player state après chargement:', state);
                    
                    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                        console.log('✅ Lecture démarrée avec succès');
                    } else {
                        console.log('🔄 Tentative de forcer la lecture...');
                        player.playVideo();
                        
                        // Vérifier encore après
                        setTimeout(() => {
                            const newState = player.getPlayerState();
                            console.log('🎵 Player state après playVideo():', newState);
                        }, 1000);
                    }
                } catch (stateError) {
                    console.error('❌ Erreur lors de la vérification du state:', stateError);
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la vidéo:', error);
        }
    }, 15); // Augmenter le nombre de tentatives
}

// Navigation Discogs
function navigateToDiscogsResults() {
    // Masquer la page de recherche et afficher la page de résultats
    document.getElementById('discogs-page').classList.remove('active');
    discogsResultsPage.classList.add('active');
}

function navigateBackToDiscogsSearch() {
    // Masquer la page de résultats et afficher la page de recherche
    discogsResultsPage.classList.remove('active');
    document.getElementById('discogs-page').classList.add('active');
    
    // Rafraîchir l'historique
    renderDiscogsHistory();
}

function navigateToDiscogsTracklist() {
    // Masquer la page de résultats et afficher la page tracklist
    discogsResultsPage.classList.remove('active');
    discogsTracklistPage.classList.add('active');
}

function navigateBackToDiscogsResults() {
    // Masquer la page tracklist et afficher la page de résultats
    discogsTracklistPage.classList.remove('active');
    discogsResultsPage.classList.add('active');
}

// Fonction pour le preview (première track uniquement)
async function handlePreviewClick(releaseId, artistName) {
    if (!releaseId) {
        console.error('Pas d\'ID de release pour le preview');
        return;
    }
    
    try {
        console.log('🎵 Preview demandé pour release ID:', releaseId);
        
        // Récupérer les détails de la release
        const releaseData = await getDiscogsReleaseDetails(releaseId);
        
        if (!releaseData.tracklist || releaseData.tracklist.length === 0) {
            console.log('❌ Aucune tracklist trouvée pour cette release');
            return;
        }
        
        // Prendre seulement la première track
        const firstTrack = releaseData.tracklist[0];
        const trackArtist = releaseData.artists?.[0]?.name || artistName || 'Unknown Artist';
        
        console.log('🎵 Recherche de la première track:', firstTrack.title, 'par', trackArtist);
        
        // Chercher la première track sur YouTube
        const youtubeData = await searchYouTubeForTrack(firstTrack.title, trackArtist);
        
        if (!youtubeData) {
            console.log('❌ Première track non trouvée sur YouTube');
            return;
        }
        
        console.log('✅ Track trouvée sur YouTube:', youtubeData.title);
        
        // Mettre à jour les informations du lecteur
        playerThumbnail.src = youtubeData.thumbnail;
        playerTitle.textContent = firstTrack.title;
        playerArtist.textContent = trackArtist;
        
        // Marquer qu'on joue un preview (pas depuis une tracklist complète)
        isPlayingFromTracklist = false;
        currentTrackIndex = 0;
        
        // Lancer la lecture
        if (!player) {
            console.log("🔄 Player non initialisé, tentative d'initialisation...");
            initializeYouTubePlayer();
        }
        
        waitForPlayer(() => {
            try {
                console.log('🎵 Lecture du preview - ID YouTube:', youtubeData.id);
                player.loadVideoById(youtubeData.id);
                
                setTimeout(() => {
                    try {
                        const state = player.getPlayerState();
                        console.log('🎵 État du preview après chargement:', state);
                        
                        if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                            console.log('✅ Preview lancé avec succès');
                        } else {
                            console.log('🔄 Tentative de forcer la lecture du preview...');
                            player.playVideo();
                        }
                    } catch (stateError) {
                        console.error('❌ Erreur lors de la vérification du state du preview:', stateError);
                    }
                }, 1500);
                
            } catch (error) {
                console.error('❌ Erreur lors du chargement du preview:', error);
            }
        }, 15);
        
    } catch (error) {
        console.error('❌ Erreur lors du preview:', error);
    }
}

// Fonction principale pour traiter une release Discogs
async function handleDiscogsReleaseClick(releaseId) {
    try {
        // Naviguer vers la page tracklist
        navigateToDiscogsTracklist();
        
        // Récupérer les détails de la release
        const releaseData = await getDiscogsReleaseDetails(releaseId);
        
        // Traiter toutes les tracks
        const processedTracks = await processDiscogsRelease(releaseData);
        
        // Afficher la tracklist
        displayTracklist(releaseData, processedTracks);
        
    } catch (error) {
        console.error('Erreur lors du traitement de la release:', error);
        // Retourner à la page de résultats en cas d'erreur
        navigateBackToDiscogsResults();
        showDiscogsError('Erreur lors du chargement de la tracklist.');
    }
}

// Gestion de l'historique Discogs
function addToDiscogsHistory(query) {
    // Éviter les doublons
    const existingIndex = discogsSearchHistory.findIndex(item => item.query === query);
    if (existingIndex !== -1) {
        discogsSearchHistory.splice(existingIndex, 1);
    }
    
    // Ajouter au début de la liste
    discogsSearchHistory.unshift({
        query: query,
        timestamp: new Date().toLocaleString('fr-FR')
    });
    
    // Limiter à 25 éléments
    if (discogsSearchHistory.length > 25) {
        discogsSearchHistory = discogsSearchHistory.slice(0, 25);
    }
    
    // Sauvegarder dans localStorage
    saveDiscogsHistory();
}

function saveDiscogsHistory() {
    try {
        localStorage.setItem('discogsSearchHistory', JSON.stringify(discogsSearchHistory));
        console.log('Historique Discogs sauvegardé:', discogsSearchHistory.length, 'éléments');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'historique Discogs:', error);
    }
}

function loadDiscogsHistory() {
    try {
        const saved = localStorage.getItem('discogsSearchHistory');
        if (saved) {
            discogsSearchHistory = JSON.parse(saved);
            console.log('Historique Discogs chargé:', discogsSearchHistory.length, 'éléments');
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique Discogs:', error);
        discogsSearchHistory = [];
    }
}

function renderDiscogsHistory() {
    if (!discogsHistoryList) return;
    
    discogsHistoryList.innerHTML = '';
    
    if (discogsSearchHistory.length === 0) {
        discogsHistoryList.innerHTML = `
            <div class="history-empty">
                <p>Aucune recherche récente</p>
            </div>
        `;
        return;
    }
    
    discogsSearchHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-query">
                <span class="query-text">${item.query}</span>
                <span class="query-date">${item.timestamp}</span>
            </div>
        `;
        
        // Clic pour relancer la recherche
        historyItem.addEventListener('click', () => {
            discogsSearchQuery.value = item.query;
            discogsSearchForm.dispatchEvent(new Event('submit'));
        });
        
        discogsHistoryList.appendChild(historyItem);
    });
}

function clearDiscogsHistory() {
    discogsSearchHistory = [];
    saveDiscogsHistory();
    renderDiscogsHistory();
}

// Gestion du formulaire de recherche Discogs
function handleDiscogsSearch(event) {
    event.preventDefault();
    
    const query = discogsSearchQuery.value.trim();
    if (!query) return;
    
    // Animation de chargement
    discogsSearchText.classList.add('hidden');
    discogsSearchLoading.classList.remove('hidden');
    discogsSearchBtn.disabled = true;
    discogsError.classList.add('hidden');
    
    // Faire la recherche
    searchDiscogsTrack(query)
        .then(data => {
            // Ajouter à l'historique
            addToDiscogsHistory(query);
            displayDiscogsResults(data, query);
        })
        .catch(error => {
            showDiscogsError('Erreur lors de la recherche Discogs. Veuillez réessayer.');
            console.error('Erreur Discogs:', error);
        })
        .finally(() => {
            // Arrêter l'animation de chargement
            discogsSearchText.classList.remove('hidden');
            discogsSearchLoading.classList.add('hidden');
            discogsSearchBtn.disabled = false;
        });
}

// Gestion de la navigation sidebar
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const pages = document.querySelectorAll('.page-content');

    // S'assurer que seule la page d'accueil est visible au démarrage
    pages.forEach(page => page.classList.remove('active'));
    const homePage = document.getElementById('home-page');
    if (homePage) {
        homePage.classList.add('active');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            
            // Mettre à jour les éléments de navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mettre à jour les pages
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Mettre à jour l'état actuel
            currentPage = pageId;
            
            console.log(`Page active : ${pageId}`);
        });
    });
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeNavigation();
    
    // Event listeners pour Discogs
    if (discogsSearchForm) {
        discogsSearchForm.addEventListener('submit', handleDiscogsSearch);
    }
    
    if (discogsBackBtn) {
        discogsBackBtn.addEventListener('click', navigateBackToDiscogsSearch);
    }
    
    if (clearDiscogsHistoryBtn) {
        clearDiscogsHistoryBtn.addEventListener('click', clearDiscogsHistory);
    }
    
    if (discogsTracklistBackBtn) {
        discogsTracklistBackBtn.addEventListener('click', navigateBackToDiscogsResults);
    }
});

// Backup : initialiser si la page est déjà chargée
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        initializeNavigation();
        if (discogsSearchForm) {
            discogsSearchForm.addEventListener('submit', handleDiscogsSearch);
        }
        if (discogsBackBtn) {
            discogsBackBtn.addEventListener('click', navigateBackToDiscogsSearch);
        }
        if (clearDiscogsHistoryBtn) {
            clearDiscogsHistoryBtn.addEventListener('click', clearDiscogsHistory);
        }
        if (discogsTracklistBackBtn) {
            discogsTracklistBackBtn.addEventListener('click', navigateBackToDiscogsResults);
        }
    });
} else {
    initializeApp();
    initializeNavigation();
    if (discogsSearchForm) {
        discogsSearchForm.addEventListener('submit', handleDiscogsSearch);
    }
    if (discogsBackBtn) {
        discogsBackBtn.addEventListener('click', navigateBackToDiscogsSearch);
    }
    if (clearDiscogsHistoryBtn) {
        clearDiscogsHistoryBtn.addEventListener('click', clearDiscogsHistory);
    }
    if (discogsTracklistBackBtn) {
        discogsTracklistBackBtn.addEventListener('click', navigateBackToDiscogsResults);
    }
}