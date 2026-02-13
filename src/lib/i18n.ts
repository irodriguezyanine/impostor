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
  appTagline: string;
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
  passToNextPlayer: string;
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
  finishAndReveal: string;
  backToHome: string;
  impostorsWere: string;
  theSecretWordWas: string;

  // Categories (for display) - añade más keys al agregar categorías
  categories: Record<string, string>;

  // How to Play
  howToPlayTitle: string;
  howToPlayContent: string;
  close: string;
};


export const TRANSLATIONS: Record<Locale, Translations> = {
  es: {
    appTitle: "Impostor Chile",
    appTagline: "Pasa y juega · Descubre al impostor",
    startGame: "COMENZAR PARTIDA",
    loading: "Cargando...",
    players: "Jugadores",
    addPlayer: "Añadir jugador",
    removePlayer: "Eliminar",
    playerPlaceholder: "Nombre del jugador",
    impostorCount: "Número de impostores",
    impostorCountDescription: "Debe haber al menos 2 jugadores más que impostores",
    categorySelection: "Selecciona una o más categorías",
    passTo: "Pásale el teléfono a",
    revealRole: "VER MI ROL",
    passToNextPlayer: "Pasar al siguiente jugador",
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
    finishAndReveal: "Finalizar partida, revelar palabra e impostor",
    backToHome: "VOLVER AL INICIO",
    impostorsWere: "Los impostores eran:",
    theSecretWordWas: "La palabra secreta era:",
    categories: {
      "futbolistas-internacionales": "Futbolistas Internacionales (Masculino)",
      "futbolistas-chilenos": "Futbolistas Chilenos",
      "champions-league": "Champions League",
      reggaeton: "Reggaeton y Urbano Latino",
      lugares: "Lugares",
      comidas: "Comidas",
      objetos: "Objetos",
      autos: "Autos",
      animales: "Animales",
      tenis: "Tenis",
      "real-madrid": "Real Madrid",
      barcelona: "Barcelona",
      "manchester-united": "Manchester United",
      "river-plate": "River Plate",
      "boca-juniors": "Boca Juniors",
      "universidad-catolica": "Universidad Católica (De siempre)",
      "alamicos-rfc": "Alamicos R.F.C",
      "famosos-chilenos": "Famosos Chilenos (Personajes de TV, Historia y Farándula)",
    },
    howToPlayTitle: "¿Cómo jugar?",
    howToPlayContent:
      "Impostor es un juego de fiesta donde hay que descubrir quién está mintiendo. Acá te explicamos paso a paso:\n\n" +
      "**1. Preparación** — Agrega los nombres de los jugadores (mínimo 3). Elige una o más categorías de palabras (futbolistas, autos, animales, etc.). Define cuántos impostores habrá en la partida (1, 2 o 3).\n\n" +
      "**2. Inicio** — Al comenzar la partida, cada jugador recibe un rol secreto. La mayoría son \"civiles\" y conocen la palabra secreta. Uno o más son \"impostores\" y no tienen idea de cuál es la palabra.\n\n" +
      "**3. Durante el juego** — Se pasa el teléfono de jugador en jugador. Cada uno ve su rol en privado y luego oculta la pantalla. Entre todos conversan, hacen preguntas o dan pistas sobre la palabra sin decirla directamente.\n\n" +
      "**4. Objetivo** — Los civiles intentan descubrir quién es el impostor. El impostor intenta hacerse pasar por uno más sin que lo pillen.\n\n" +
      "**5. Final** — Cuando terminen de discutir, revelan la palabra secreta y quiénes eran los impostores. ¡A reírse con los que cayeron!",
    close: "Cerrar",
  },
  en: {
    appTitle: "Impostor Chile",
    appTagline: "Pass and play · Find the impostor",
    startGame: "START GAME",
    loading: "Loading...",
    players: "Players",
    addPlayer: "Add player",
    removePlayer: "Remove",
    playerPlaceholder: "Player name",
    impostorCount: "Impostor count",
    impostorCountDescription: "Must be at least 2 more players than impostors",
    categorySelection: "Select one or more categories",
    passTo: "Pass the phone to",
    revealRole: "REVEAL MY ROLE",
    passToNextPlayer: "Pass to next player",
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
    finishAndReveal: "Finish game, reveal word and impostor",
    backToHome: "BACK TO HOME",
    impostorsWere: "The impostors were:",
    theSecretWordWas: "The secret word was:",
    categories: {
      "futbolistas-internacionales": "International Footballers (Male)",
      "futbolistas-chilenos": "Chilean Footballers",
      "champions-league": "Champions League",
      reggaeton: "Reggaeton & Urban Latin",
      lugares: "Places",
      comidas: "Foods",
      objetos: "Objects",
      autos: "Cars",
      animales: "Animals",
      tenis: "Tennis",
      "real-madrid": "Real Madrid",
      barcelona: "Barcelona",
      "manchester-united": "Manchester United",
      "river-plate": "River Plate",
      "boca-juniors": "Boca Juniors",
      "universidad-catolica": "Universidad Católica (All-time)",
      "alamicos-rfc": "Alamicos R.F.C",
      "famosos-chilenos": "Famous Chileans (TV, History & Celebrities)",
    },
    howToPlayTitle: "How to play?",
    howToPlayContent:
      "Impostor is a party game where you must discover who is lying. Here's how it works:\n\n" +
      "**1. Setup** — Add player names (minimum 3). Choose one or more word categories. Set how many impostors there will be (1, 2, or 3).\n\n" +
      "**2. Start** — When the game begins, each player gets a secret role. Most are \"civilians\" and know the secret word. One or more are \"impostors\" and have no idea what the word is.\n\n" +
      "**3. During the game** — Pass the phone from player to player. Each one sees their role privately and then hides the screen. Everyone discusses, asks questions, or gives hints about the word without saying it directly.\n\n" +
      "**4. Goal** — Civilians try to discover who the impostor is. The impostor tries to blend in without getting caught.\n\n" +
      "**5. End** — When you finish discussing, reveal the secret word and who the impostors were. Have fun!",
    close: "Close",
  },
  pt: {
    appTitle: "Impostor Chile",
    appTagline: "Passe e jogue · Descubra o impostor",
    startGame: "INICIAR PARTIDA",
    loading: "Carregando...",
    players: "Jogadores",
    addPlayer: "Adicionar jogador",
    removePlayer: "Remover",
    playerPlaceholder: "Nome do jogador",
    impostorCount: "Número de impostores",
    impostorCountDescription: "Deve haver pelo menos 2 jogadores a mais que impostores",
    categorySelection: "Selecione uma ou mais categorias",
    passTo: "Passe o telefone para",
    revealRole: "REVELAR MEU PAPEL",
    passToNextPlayer: "Passar para o próximo jogador",
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
    finishAndReveal: "Finalizar partida, revelar palavra e impostor",
    backToHome: "VOLTAR AO INÍCIO",
    impostorsWere: "Os impostores eram:",
    theSecretWordWas: "A palavra secreta era:",
    categories: {
      "futbolistas-internacionales": "Futebolistas Internacionais (Masculino)",
      "futbolistas-chilenos": "Futebolistas Chilenos",
      "champions-league": "Champions League",
      reggaeton: "Reggaeton e Urbano Latino",
      lugares: "Lugares",
      comidas: "Comidas",
      objetos: "Objetos",
      autos: "Carros",
      animales: "Animais",
      tenis: "Tênis",
      "real-madrid": "Real Madrid",
      barcelona: "Barcelona",
      "manchester-united": "Manchester United",
      "river-plate": "River Plate",
      "boca-juniors": "Boca Juniors",
      "universidad-catolica": "Universidad Católica (De sempre)",
      "alamicos-rfc": "Alamicos R.F.C",
      "famosos-chilenos": "Famosos Chilenos (Personagens de TV, História e Celebridades)",
    },
    howToPlayTitle: "Como jogar?",
    howToPlayContent:
      "Impostor é um jogo de festa onde você precisa descobrir quem está mentindo. Aqui está como funciona:\n\n" +
      "**1. Preparação** — Adicione os nomes dos jogadores (mínimo 3). Escolha uma ou mais categorias de palavras. Defina quantos impostores haverá (1, 2 ou 3).\n\n" +
      "**2. Início** — Quando a partida começar, cada jogador recebe um papel secreto. A maioria são \"civis\" e conhecem a palavra secreta. Um ou mais são \"impostores\" e não têm ideia qual é a palavra.\n\n" +
      "**3. Durante o jogo** — Passe o telefone de jogador em jogador. Cada um vê seu papel em privado e depois esconde a tela. Entre todos conversam, fazem perguntas ou dão pistas sobre a palavra sem dizê-la diretamente.\n\n" +
      "**4. Objetivo** — Os civis tentam descobrir quem é o impostor. O impostor tenta se passar por um deles sem ser pego.\n\n" +
      "**5. Final** — Quando terminarem de discutir, revelem a palavra secreta e quem eram os impostores. Divirtam-se!",
    close: "Fechar",
  },
  it: {
    appTitle: "Impostor Chile",
    appTagline: "Passa e gioca · Scopri l'impostore",
    startGame: "INIZIA PARTITA",
    loading: "Caricamento...",
    players: "Giocatori",
    addPlayer: "Aggiungi giocatore",
    removePlayer: "Rimuovi",
    playerPlaceholder: "Nome del giocatore",
    impostorCount: "Numero di impostori",
    impostorCountDescription: "Devono esserci almeno 2 giocatori in più degli impostori",
    categorySelection: "Seleziona una o più categorie",
    passTo: "Passa il telefono a",
    revealRole: "RIVELA IL MIO RUOLO",
    passToNextPlayer: "Passa al prossimo giocatore",
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
    finishAndReveal: "Termina partita, rivela parola e impostore",
    backToHome: "TORNA ALL'INIZIO",
    impostorsWere: "Gli impostori erano:",
    theSecretWordWas: "La parola segreta era:",
    categories: {
      "futbolistas-internacionales": "Calciatori Internazionali (Maschile)",
      "futbolistas-chilenos": "Calciatori Cileni",
      "champions-league": "Champions League",
      reggaeton: "Reggaeton e Urbano Latino",
      lugares: "Luoghi",
      comidas: "Cibi",
      objetos: "Oggetti",
      autos: "Auto",
      animales: "Animali",
      tenis: "Tennis",
      "real-madrid": "Real Madrid",
      barcelona: "Barcelona",
      "manchester-united": "Manchester United",
      "river-plate": "River Plate",
      "boca-juniors": "Boca Juniors",
      "universidad-catolica": "Universidad Católica (Di sempre)",
      "alamicos-rfc": "Alamicos R.F.C",
      "famosos-chilenos": "Famosi Cileni (TV, Storia e Celebrità)",
    },
    howToPlayTitle: "Come si gioca?",
    howToPlayContent:
      "Impostor è un gioco di società dove devi scoprire chi sta mentendo. Ecco come funziona:\n\n" +
      "**1. Preparazione** — Aggiungi i nomi dei giocatori (minimo 3). Scegli una o più categorie di parole. Imposta quanti impostori ci saranno (1, 2 o 3).\n\n" +
      "**2. Inizio** — All'inizio della partita, ogni giocatore riceve un ruolo segreto. La maggior parte sono \"civili\" e conoscono la parola segreta. Uno o più sono \"impostori\" e non hanno idea di quale sia la parola.\n\n" +
      "**3. Durante il gioco** — Passa il telefono da giocatore a giocatore. Ognuno vede il proprio ruolo in privato e poi nasconde lo schermo. Insieme discutono, fanno domande o danno indizi sulla parola senza dirla direttamente.\n\n" +
      "**4. Obiettivo** — I civili cercano di scoprire chi è l'impostore. L'impostore cerca di passare inosservato senza essere scoperto.\n\n" +
      "**5. Fine** — Quando avete finito di discutere, rivelate la parola segreta e chi erano gli impostori. Buon divertimento!",
    close: "Chiudi",
  },
  fr: {
    appTitle: "Impostor Chile",
    appTagline: "Passe et joue · Trouve l'imposteur",
    startGame: "COMMENCER LA PARTIE",
    loading: "Chargement...",
    players: "Joueurs",
    addPlayer: "Ajouter un joueur",
    removePlayer: "Supprimer",
    playerPlaceholder: "Nom du joueur",
    impostorCount: "Nombre d'imposteurs",
    impostorCountDescription: "Il doit y avoir au moins 2 joueurs de plus que d'imposteurs",
    categorySelection: "Sélectionnez une ou plusieurs catégories",
    passTo: "Passe le téléphone à",
    revealRole: "RÉVÉLER MON RÔLE",
    passToNextPlayer: "Passer au joueur suivant",
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
    finishAndReveal: "Terminer la partie, révéler le mot et l'imposteur",
    backToHome: "RETOUR À L'ACCUEIL",
    impostorsWere: "Les imposteurs étaient :",
    theSecretWordWas: "Le mot secret était :",
    categories: {
      "futbolistas-internacionales": "Footballeurs Internationaux (Masculin)",
      "futbolistas-chilenos": "Footballeurs Chiliens",
      "champions-league": "Champions League",
      reggaeton: "Reggaeton et Urbain Latino",
      lugares: "Lieux",
      comidas: "Aliments",
      objetos: "Objets",
      autos: "Voitures",
      animales: "Animaux",
      tenis: "Tennis",
      "real-madrid": "Real Madrid",
      barcelona: "Barcelona",
      "manchester-united": "Manchester United",
      "river-plate": "River Plate",
      "boca-juniors": "Boca Juniors",
      "universidad-catolica": "Universidad Católica (De toujours)",
      "alamicos-rfc": "Alamicos R.F.C",
      "famosos-chilenos": "Célébrités Chiliennes (TV, Histoire et People)",
    },
    howToPlayTitle: "Comment jouer ?",
    howToPlayContent:
      "Impostor est un jeu de société où il faut découvrir qui ment. Voici comment ça marche :\n\n" +
      "**1. Préparation** — Ajoutez les noms des joueurs (minimum 3). Choisissez une ou plusieurs catégories de mots. Définissez combien d'imposteurs il y aura (1, 2 ou 3).\n\n" +
      "**2. Début** — Au début de la partie, chaque joueur reçoit un rôle secret. La plupart sont des \"civils\" et connaissent le mot secret. Un ou plusieurs sont des \"imposteurs\" et n'ont aucune idée de quel mot il s'agit.\n\n" +
      "**3. Pendant le jeu** — Passez le téléphone de joueur en joueur. Chacun voit son rôle en privé puis cache l'écran. Tous ensemble discutent, posent des questions ou donnent des indices sur le mot sans le dire directement.\n\n" +
      "**4. Objectif** — Les civils tentent de découvrir qui est l'imposteur. L'imposteur essaie de se fondre parmi les autres sans se faire prendre.\n\n" +
      "**5. Fin** — Quand vous avez fini de discuter, révélez le mot secret et qui étaient les imposteurs. Amusez-vous bien !",
    close: "Fermer",
  },
};
