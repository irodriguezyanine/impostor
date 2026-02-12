/**
 * Sistema de internacionalización para Imposter Clone
 * Idiomas: Español (principal), Inglés, Portugués, Italiano, Francés
 */

export type Locale = "es" | "en" | "pt" | "it" | "fr";

export const LOCALES: Locale[] = ["es", "en", "pt", "it", "fr"];

export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  it: "Italiano",
  fr: "Français",
};

export type Translations = {
  // General
  appTitle: string;
  startGame: string;
  loading: string;

  // Player Management
  players: string;
  addPlayer: string;
  removePlayer: string;
  playerPlaceholder: string;

  // Game Settings
  impostorCount: string;
  impostorCountDescription: string;
  categorySelection: string;

  // Game Flow - Pass and Play
  passTo: string;
  revealRole: string;
  hideReady: string;

  // Roles
  civilian: string;
  civilianReveal: string;
  secretWord: string;
  impostor: string;
  impostorReveal: string;
  impostorDescription: string;

  // Gameplay
  firstPlayer: string;
  gameInProgress: string;
  finishGame: string;

  // Categories (for display) - añade más keys al agregar categorías
  categories: Record<string, string>;
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  es: {
    appTitle: "Imposter Clone",
    startGame: "COMENZAR PARTIDA",
    loading: "Cargando...",
    players: "Jugadores",
    addPlayer: "Añadir jugador",
    removePlayer: "Eliminar",
    playerPlaceholder: "Nombre del jugador",
    impostorCount: "Número de impostores",
    impostorCountDescription: "Debe haber al menos 2 jugadores más que impostores",
    categorySelection: "Selecciona una categoría",
    passTo: "Pásale el teléfono a",
    revealRole: "VER MI ROL",
    hideReady: "OCULTAR / LISTO",
    civilian: "CIVIL",
    civilianReveal: "Tú eres CIVIL. La palabra secreta es:",
    secretWord: "Palabra secreta",
    impostor: "IMPOSTOR",
    impostorReveal: "Tú eres el IMPOSTOR.",
    impostorDescription: "Engaña a los demás.",
    firstPlayer: "Jugador que empieza",
    gameInProgress: "Partida en curso",
    finishGame: "FINALIZAR PARTIDA",
    categories: {
      lugares: "Lugares",
      comidas: "Comidas",
      objetos: "Objetos",
    },
  },
  en: {
    appTitle: "Imposter Clone",
    startGame: "START GAME",
    loading: "Loading...",
    players: "Players",
    addPlayer: "Add player",
    removePlayer: "Remove",
    playerPlaceholder: "Player name",
    impostorCount: "Impostor count",
    impostorCountDescription: "Must be at least 2 more players than impostors",
    categorySelection: "Select a category",
    passTo: "Pass the phone to",
    revealRole: "REVEAL MY ROLE",
    hideReady: "HIDE / READY",
    civilian: "CIVILIAN",
    civilianReveal: "You are a CIVILIAN. The secret word is:",
    secretWord: "Secret word",
    impostor: "IMPOSTOR",
    impostorReveal: "You are the IMPOSTOR.",
    impostorDescription: "Deceive the others.",
    firstPlayer: "First player",
    gameInProgress: "Game in progress",
    finishGame: "FINISH GAME",
    categories: {
      lugares: "Places",
      comidas: "Foods",
      objetos: "Objects",
    },
  },
  pt: {
    appTitle: "Imposter Clone",
    startGame: "INICIAR PARTIDA",
    loading: "Carregando...",
    players: "Jogadores",
    addPlayer: "Adicionar jogador",
    removePlayer: "Remover",
    playerPlaceholder: "Nome do jogador",
    impostorCount: "Número de impostores",
    impostorCountDescription: "Deve haver pelo menos 2 jogadores a mais que impostores",
    categorySelection: "Selecione uma categoria",
    passTo: "Passe o telefone para",
    revealRole: "REVELAR MEU PAPEL",
    hideReady: "OCULTAR / PRONTO",
    civilian: "CIVIL",
    civilianReveal: "Você é CIVIL. A palavra secreta é:",
    secretWord: "Palavra secreta",
    impostor: "IMPOSTOR",
    impostorReveal: "Você é o IMPOSTOR.",
    impostorDescription: "Engane os outros.",
    firstPlayer: "Primeiro jogador",
    gameInProgress: "Partida em andamento",
    finishGame: "FINALIZAR PARTIDA",
    categories: {
      lugares: "Lugares",
      comidas: "Comidas",
      objetos: "Objetos",
    },
  },
  it: {
    appTitle: "Imposter Clone",
    startGame: "INIZIA PARTITA",
    loading: "Caricamento...",
    players: "Giocatori",
    addPlayer: "Aggiungi giocatore",
    removePlayer: "Rimuovi",
    playerPlaceholder: "Nome del giocatore",
    impostorCount: "Numero di impostori",
    impostorCountDescription: "Devono esserci almeno 2 giocatori in più degli impostori",
    categorySelection: "Seleziona una categoria",
    passTo: "Passa il telefono a",
    revealRole: "RIVELA IL MIO RUOLO",
    hideReady: "NASCONDI / PRONTO",
    civilian: "CIVILE",
    civilianReveal: "Sei un CIVILE. La parola segreta è:",
    secretWord: "Parola segreta",
    impostor: "IMPOSTORE",
    impostorReveal: "Sei l'IMPOSTORE.",
    impostorDescription: "Inganna gli altri.",
    firstPlayer: "Primo giocatore",
    gameInProgress: "Partita in corso",
    finishGame: "TERMINA PARTITA",
    categories: {
      lugares: "Luoghi",
      comidas: "Cibi",
      objetos: "Oggetti",
    },
  },
  fr: {
    appTitle: "Imposter Clone",
    startGame: "COMMENCER LA PARTIE",
    loading: "Chargement...",
    players: "Joueurs",
    addPlayer: "Ajouter un joueur",
    removePlayer: "Supprimer",
    playerPlaceholder: "Nom du joueur",
    impostorCount: "Nombre d'imposteurs",
    impostorCountDescription: "Il doit y avoir au moins 2 joueurs de plus que d'imposteurs",
    categorySelection: "Sélectionnez une catégorie",
    passTo: "Passe le téléphone à",
    revealRole: "RÉVÉLER MON RÔLE",
    hideReady: "CACHER / PRÊT",
    civilian: "CIVIL",
    civilianReveal: "Tu es CIVIL. Le mot secret est :",
    secretWord: "Mot secret",
    impostor: "IMPOSTEUR",
    impostorReveal: "Tu es l'IMPOSTEUR.",
    impostorDescription: "Trompe les autres.",
    firstPlayer: "Premier joueur",
    gameInProgress: "Partie en cours",
    finishGame: "TERMINER LA PARTIE",
    categories: {
      lugares: "Lieux",
      comidas: "Aliments",
      objetos: "Objets",
    },
  },
};
