const STORAGE_KEY = "rt_revision_progress_v1";
const THEME_KEY = "rt_revision_theme_v1";

const mustKnow = [
  {
    title: "Toujours savoir où exécuter",
    text: "PC Linux, Windows Server, routeur Cisco, switch Cisco ou PC-routeur Linux : une bonne réponse commence par la bonne machine.",
    items: ["Linux : ip, ping, dhclient, systemctl", "Cisco : show, vlan, interface, ACL", "Windows : ipconfig, netsh, DHCP"]
  },
  {
    title: "Toujours tester par couches",
    text: "Adresse, masque, passerelle, VLAN, trunk, route, ACL, service. Ne saute pas directement à iptables ou DHCP.",
    items: ["ping passerelle", "show vlan brief", "show ip interface brief", "Wireshark"]
  },
  {
    title: "Toujours expliquer le pourquoi",
    text: "Le prof peut demander pourquoi une commande existe. Prépare une phrase simple pour NDP, NAT, trunk, helper-address ou SYN-ACK.",
    items: ["NDP remplace ARP en IPv6", "DHCP broadcast ne traverse pas un routeur", "MASQUERADE traduit l'adresse source"]
  },
  {
    title: "Toujours observer le résultat",
    text: "Une commande n'est pas magique : tu dois dire ce que tu attends et ce que tu fais si le résultat n'est pas bon.",
    items: ["table de routage cohérente", "bail DHCP obtenu", "port ouvert = SYN-ACK", "ACL placée dans le bon sens"]
  }
];

const tpData = [
  {
    id: "tp1",
    number: "TP1",
    short: "IPv6",
    title: "TP1 — IPv6",
    accent: "#67e8f9",
    objectives: [
      "Comprendre les types d'adresses IPv6 et leur portée.",
      "Configurer IPv6 sous Linux, Windows et Cisco.",
      "Tester la connectivité avec ping6, routes IPv6 et voisins NDP.",
      "Mettre en place un routage statique IPv6 entre deux binômes.",
      "Identifier les messages NDP dans Wireshark avec le filtre icmpv6."
    ],
    keyIdeas: ["IPv6 128 bits", "link-local fe80::/64", "ULA fd00::/8", "Global Unicast", "NDP remplace ARP", "Router Advertisement", "routage statique IPv6"],
    summary: "IPv6 utilise des adresses sur 128 bits, écrites en hexadécimal. Chaque interface possède normalement une adresse link-local fe80::/64 pour parler sur le lien local, et peut aussi avoir une adresse ULA ou Global Unicast pour communiquer plus loin. En IPv6, ARP disparaît : NDP s'appuie sur ICMPv6 pour découvrir les voisins, les routeurs et les changements de chemin.",
    topology: {
      description: "Deux postes Linux ou Windows sont reliés à un routeur Cisco. Chaque binôme possède un préfixe ULA, puis les routeurs échangent des routes statiques IPv6 pour joindre le préfixe de l'autre binôme.",
      nodes: [
        { label: "PC A", detail: "fd00:1::10/64<br>fe80::/64" },
        { label: "R1 Cisco", detail: "fd00:1::254/64<br>fc00:67::254/64" },
        { label: "R2 binôme", detail: "fc00:68::254/64" },
        { label: "PC B", detail: "fd00:2::10/64" }
      ]
    },
    course: [
      {
        title: "IPv4 vs IPv6",
        body: "IPv4 utilise 32 bits et dépend beaucoup du NAT. IPv6 utilise 128 bits, ce qui donne un espace d'adressage immense. Les adresses sont écrites en blocs hexadécimaux séparés par des deux-points, par exemple fd00:67::10/64.",
        bullets: ["IPv4 : 192.168.1.10/24", "IPv6 : fd00:67::10/64", ":: compresse une suite de zéros une seule fois", "/64 est le préfixe classique d'un réseau LAN IPv6"]
      },
      {
        title: "Adresses link-local fe80::/64",
        body: "Une adresse link-local ne sert que sur le lien local. Elle est indispensable pour NDP et pour joindre un voisin directement connecté, mais elle ne permet pas de communiquer entre deux réseaux routés.",
        bullets: ["Préfixe : fe80::/64", "Non routable entre réseaux", "Il faut préciser l'interface avec une zone comme %eth0 ou %enp2s0", "Exemple : ping6 fe80::1%enp2s0"]
      },
      {
        title: "ULA et Global Unicast",
        body: "Les ULA sont des adresses privées IPv6, souvent en fd00::/8 dans les TP. Les Global Unicast sont routables sur Internet, généralement dans 2000::/3.",
        bullets: ["ULA : fc00::/7, souvent fd00::/8", "Global Unicast : portée globale", "Une machine peut avoir plusieurs IPv6 sur la même interface"]
      },
      {
        title: "NDP et ICMPv6",
        body: "NDP remplace ARP et ajoute des fonctions de découverte de routeur. Il utilise ICMPv6, donc bloquer ICMPv6 casse souvent IPv6.",
        bullets: ["Neighbor Solicitation : demande qui possède cette IPv6", "Neighbor Advertisement : réponse avec l'adresse MAC", "Router Solicitation : un hôte cherche un routeur", "Router Advertisement : un routeur annonce préfixe et passerelle", "Redirect : indique un meilleur prochain saut"]
      },
      {
        title: "Routage statique IPv6",
        body: "Pour joindre un réseau IPv6 distant, le routeur doit connaître le préfixe de destination et le next-hop. Sans route, le ping sort rarement du réseau local.",
        bullets: ["Activer ipv6 unicast-routing sur Cisco", "Configurer les interfaces en /64", "Ajouter une route vers le préfixe distant", "Vérifier avec show ipv6 route"]
      }
    ],
    commands: [
      {
        title: "Afficher les IPv6 sous Linux",
        cmd: "ip -6 a",
        machine: "PC Linux",
        when: "Après configuration ou avant un diagnostic.",
        expected: "Voir fe80::/64 et éventuellement fd00::/64 sur la bonne interface.",
        fix: "Si rien n'apparaît, vérifier l'interface, la syntaxe de l'adresse et l'état UP.",
        explain: ["ip interroge la configuration réseau", "-6 limite l'affichage à IPv6", "a signifie address"]
      },
      {
        title: "Ajouter une adresse IPv6 Linux",
        cmd: "sudo ip -6 a a fd00:67::10/64 dev enp2s0",
        machine: "PC Linux",
        when: "Pendant la configuration de l'adresse ULA du poste.",
        expected: "La commande ne renvoie rien, puis ip -6 a affiche fd00:67::10/64.",
        fix: "Remplacer enp2s0 par la vraie interface visible avec ip -br a.",
        explain: ["a a est l'abréviation de address add", "fd00:67::10/64 est l'adresse et le préfixe", "dev enp2s0 indique l'interface"]
      },
      {
        title: "Tester une link-local",
        cmd: "ping6 fe80::1%enp2s0",
        machine: "PC Linux",
        when: "Pour tester un voisin directement connecté avec son adresse fe80::.",
        expected: "Des réponses ICMPv6 echo reply.",
        fix: "Ajouter %interface, vérifier que les deux machines sont sur le même lien et regarder NDP dans Wireshark.",
        explain: ["fe80:: n'est pas unique globalement", "%enp2s0 précise la carte réseau", "ping6 envoie des Echo Request ICMPv6"]
      },
      {
        title: "Ajouter une route IPv6 Linux",
        cmd: "sudo ip -6 r a fd00:2::/64 via fd00:67::254",
        machine: "PC Linux",
        when: "Quand le poste doit joindre un autre réseau IPv6 via le routeur.",
        expected: "ip -6 route affiche le préfixe distant via la passerelle.",
        fix: "Vérifier que la passerelle est joignable et que le préfixe distant est correct.",
        explain: ["r a signifie route add", "fd00:2::/64 est le réseau destination", "via indique le prochain saut"]
      },
      {
        title: "Configurer IPv6 sur Cisco",
        cmd: `enable
configure terminal
ipv6 unicast-routing
interface g0/0
ipv6 address fc00:67::254/64
no shutdown`,
        machine: "Routeur Cisco",
        when: "Au début de la configuration du routeur IPv6.",
        expected: "show ipv6 interface brief affiche g0/0 up/up avec l'adresse configurée.",
        fix: "Vérifier no shutdown, le câble et le bon nom d'interface.",
        explain: ["ipv6 unicast-routing active le routage IPv6", "ipv6 address pose l'adresse sur l'interface", "no shutdown active l'interface"]
      },
      {
        title: "Voir les voisins NDP Cisco",
        cmd: "show ipv6 neighbors",
        machine: "Routeur Cisco",
        when: "Après des pings ou pour vérifier la découverte des voisins.",
        expected: "Adresse IPv6, adresse MAC et interface des voisins connus.",
        fix: "Si la table est vide, générer du trafic avec ping et vérifier ICMPv6.",
        explain: ["show interroge l'état Cisco", "ipv6 neighbors affiche le cache NDP", "équivalent conceptuel de la table ARP en IPv4"]
      }
    ],
    steps: [
      "Identifier les interfaces et choisir le préfixe IPv6 du binôme.",
      "Configurer l'adresse IPv6 sur chaque PC avec un /64.",
      "Configurer les interfaces du routeur Cisco et activer ipv6 unicast-routing.",
      "Tester le ping local vers la passerelle, puis vers l'autre PC du même réseau.",
      "Ajouter les routes statiques IPv6 sur les routeurs entre binômes.",
      "Vérifier show ipv6 route, show ipv6 neighbors et ip -6 route.",
      "Capturer avec Wireshark et filtrer icmpv6 pour observer NDP et ping."
    ],
    observe: [
      "Dans Wireshark, le filtre icmpv6 montre les Neighbor Solicitation et Neighbor Advertisement.",
      "Un ping vers fe80:: sans %interface échoue ou reste ambigu sous Linux.",
      "show ipv6 route doit contenir les routes connected, local et static.",
      "show running-config permet de vérifier que l'adresse et ipv6 unicast-routing sont bien sauvegardables."
    ],
    oral: [
      { q: "Pourquoi une adresse link-local IPv6 ne suffit pas entre deux réseaux ?", a: "Parce qu'une adresse fe80:: est limitée au lien local et n'est pas routée par les routeurs." },
      { q: "Pourquoi préciser l'interface avec fe80:: sous Linux ?", a: "Plusieurs interfaces peuvent avoir des adresses fe80::. Le %interface indique sur quel lien envoyer le paquet." },
      { q: "Quel est le rôle de NDP ?", a: "Découvrir les voisins, associer IPv6 et MAC, trouver les routeurs et remplacer ARP en IPv6." }
    ],
    errors: [
      { issue: "Ping fe80:: qui échoue", solution: "Ajouter %interface, par exemple ping6 fe80::1%enp2s0." },
      { issue: "Pas de route vers le réseau distant", solution: "Ajouter une route IPv6 statique sur le routeur et vérifier show ipv6 route." },
      { issue: "Adresse ULA mal préfixée", solution: "Utiliser un /64 cohérent sur toutes les machines du même LAN." },
      { issue: "NDP invisible", solution: "Générer un ping, filtrer icmpv6 et vérifier que ICMPv6 n'est pas filtré." }
    ],
    quiz: [
      { q: "Quel protocole remplace ARP en IPv6 ?", choices: ["NDP", "DHCP", "FTP", "PAT"], answer: 0, why: "NDP utilise ICMPv6 pour découvrir les voisins et leurs adresses MAC." },
      { q: "Que signifie fe80::/64 ?", choices: ["Adresse globale Internet", "Adresse link-local", "Adresse multicast DNS", "Adresse IPv4 privée"], answer: 1, why: "fe80::/64 est la portée link-local, limitée au lien." },
      { q: "Quel filtre Wireshark permet d'observer NDP ?", choices: ["arp", "tcp.port == 21", "icmpv6", "dns"], answer: 2, why: "NDP est transporté par ICMPv6." },
      { q: "Quelle commande Cisco affiche les voisins IPv6 ?", choices: ["show ip arp", "show ipv6 neighbors", "show vlan brief", "show interfaces trunk"], answer: 1, why: "show ipv6 neighbors affiche le cache NDP." }
    ],
    flashcards: [
      { front: "Recto : À quoi sert Router Advertisement ?", back: "Verso : Un routeur annonce sa présence et parfois un préfixe IPv6 aux hôtes." },
      { front: "Recto : Portée d'une ULA fd00::/8 ?", back: "Verso : Portée privée, utilisable dans une organisation ou un TP, non globale Internet." },
      { front: "Recto : Commande Linux pour voir les routes IPv6 ?", back: "Verso : ip -6 route." }
    ],
    exercises: [
      "Configurer fd00:67::10/64 sur un PC Linux et tester la passerelle fd00:67::254.",
      "Expliquer à l'oral les cinq messages NDP sans regarder la fiche.",
      "Dans Wireshark, capturer un ping6 et retrouver Neighbor Solicitation puis Echo Request."
    ],
    memo: [
      "IPv6 = 128 bits, notation hexadécimale.",
      "fe80:: = lien local, besoin de %interface.",
      "NDP remplace ARP et utilise ICMPv6.",
      "Cisco : ipv6 unicast-routing, show ipv6 route, show ipv6 neighbors."
    ],
    exam: [
      {
        title: "IPv6 : le ping vers fe80:: échoue",
        situation: "Tu dois pinger l'adresse fe80::a00:27ff:fe12:3456 depuis un PC Linux, mais ping6 répond que l'adresse est ambiguë ou non joignable.",
        correction: "Utiliser ping6 fe80::a00:27ff:fe12:3456%enp2s0. Vérifier le nom de l'interface avec ip -br a, puis regarder les Neighbor Solicitation avec le filtre icmpv6."
      }
    ]
  },
  {
    id: "tp2",
    number: "TP2",
    short: "TCP/UDP Scapy",
    title: "TP2 — TCP, UDP et Scapy",
    accent: "#60a5fa",
    objectives: [
      "Comprendre le three-way handshake TCP.",
      "Identifier ports, numéros de séquence, acquittements et drapeaux.",
      "Installer et tester un serveur FTP avec vsftpd et FileZilla.",
      "Créer des paquets TCP SYN avec Scapy.",
      "Écrire un scanner de ports simple et interpréter SYN-ACK, RST ou absence de réponse."
    ],
    keyIdeas: ["SYN", "SYN-ACK", "ACK", "RST", "FIN", "port ouvert", "port fermé", "FTP en clair", "Scapy sr1"],
    summary: "Ce TP relie la théorie TCP à l'observation pratique. Tu vois le handshake SYN, SYN-ACK, ACK dans Wireshark, puis tu utilises Scapy pour fabriquer un SYN vers un port. La réponse indique l'état probable du port : SYN-ACK ouvert, RST fermé, aucune réponse filtré ou bloqué.",
    topology: {
      description: "Un PC client utilise FileZilla ou ftp pour joindre un serveur Linux vsftpd. Un poste d'analyse capture les échanges et Scapy génère des paquets TCP ciblés vers les ports 21 et 80.",
      nodes: [
        { label: "Client FTP", detail: "FileZilla / ftp" },
        { label: "Réseau LAN", detail: "capture Wireshark" },
        { label: "Serveur Linux", detail: "vsftpd :21<br>apache2 :80" },
        { label: "Scapy", detail: "SYN custom" }
      ]
    },
    course: [
      {
        title: "TCP fiable et orienté connexion",
        body: "TCP établit une connexion avant d'échanger les données. Il utilise des numéros de séquence et d'acquittement pour suivre les octets transmis.",
        bullets: ["SYN ouvre une connexion", "ACK acquitte ce qui est reçu", "FIN ferme proprement", "RST coupe ou refuse"]
      },
      {
        title: "Three-way handshake",
        body: "Le client envoie SYN, le serveur répond SYN-ACK, le client termine avec ACK. Après ces trois étapes, la connexion est établie.",
        bullets: ["SYN : je veux ouvrir", "SYN-ACK : j'accepte et j'ouvre aussi", "ACK : reçu, on peut parler"]
      },
      {
        title: "FTP et sécurité",
        body: "FTP classique n'est pas chiffré. Les commandes USER et PASS peuvent être visibles dans Wireshark, ce qui montre pourquoi FTP est dangereux sur un réseau non fiable.",
        bullets: ["Port 21 : contrôle FTP", "USER transmet le login", "PASS transmet le mot de passe", "Préférer SFTP/FTPS en vrai contexte"]
      },
      {
        title: "Scapy et interprétation",
        body: "Scapy permet de construire un paquet IP/TCP et d'attendre une réponse. Pour un SYN scan pédagogique : SYN-ACK signifie ouvert, RST signifie fermé, silence signifie filtré ou bloqué.",
        bullets: ["IP(dst=...) choisit la destination", "TCP(dport=..., flags=\"S\") crée le SYN", "sr1() envoie et attend une réponse", "flags 0x12 = SYN-ACK", "flags 0x14 = RST-ACK"]
      },
      {
        title: "SYN Flood et SYN cookies",
        body: "Dans le cadre défensif du TP, un SYN Flood consiste à envoyer beaucoup de SYN pour saturer les connexions semi-ouvertes. Les SYN cookies permettent au serveur de ne pas réserver trop d'état avant la fin du handshake.",
        bullets: ["À expliquer, pas à utiliser contre une machine réelle", "Objectif pédagogique : comprendre la protection", "SYN cookies limitent l'impact des SYN non finalisés"]
      }
    ],
    commands: [
      {
        title: "Installer les outils FTP",
        cmd: "sudo apt update\nsudo apt install vsftpd ftp -y",
        machine: "Serveur Linux et/ou client Linux",
        when: "Avant les tests FTP.",
        expected: "Installation terminée sans erreur et service vsftpd disponible.",
        fix: "Vérifier la connexion réseau et relancer apt update si les dépôts échouent.",
        explain: ["apt update met à jour la liste des paquets", "vsftpd installe le serveur FTP", "ftp installe un client CLI"]
      },
      {
        title: "Créer un utilisateur FTP",
        cmd: "sudo adduser etudiant",
        machine: "Serveur Linux FTP",
        when: "Pour disposer d'un compte de connexion FTP.",
        expected: "Un utilisateur local est créé avec un mot de passe.",
        fix: "Vérifier les droits sudo et ne pas oublier le mot de passe choisi.",
        explain: ["adduser crée un utilisateur", "vsftpd peut authentifier les utilisateurs locaux", "le mot de passe sera visible en FTP classique dans Wireshark"]
      },
      {
        title: "Contrôler vsftpd",
        cmd: "sudo systemctl status vsftpd\nsudo systemctl restart vsftpd",
        machine: "Serveur Linux FTP",
        when: "Si FileZilla ou ftp ne se connecte pas.",
        expected: "Le service doit être active/running.",
        fix: "Lire les erreurs, corriger la configuration ou redémarrer le service.",
        explain: ["systemctl status affiche l'état", "restart recharge le service", "vsftpd écoute sur le port 21"]
      },
      {
        title: "Connexion FTP en ligne de commande",
        cmd: "ftp 192.168.1.20",
        machine: "Client Linux",
        when: "Pour tester rapidement le serveur FTP.",
        expected: "Le serveur demande USER puis PASS.",
        fix: "Si timeout : ping serveur, vérifier service, pare-feu et port 21.",
        explain: ["ftp lance le client", "192.168.1.20 est le serveur", "les commandes USER, PASS et QUIT apparaissent en clair"]
      },
      {
        title: "Paquet SYN Scapy vers FTP",
        cmd: `from scapy.all import IP, TCP, sr1

pkt = IP(dst="192.168.1.20") / TCP(dport=21, flags="S")
rep = sr1(pkt, timeout=2)
print(rep.summary() if rep else "pas de réponse")`,
        machine: "PC Linux avec Scapy",
        when: "Pour tester le port 21 sans établir une session FTP complète.",
        expected: "SYN-ACK si le port 21 est ouvert, RST si fermé.",
        fix: "Lancer avec sudo, vérifier l'IP cible et que vsftpd écoute.",
        explain: ["IP(dst=...) définit la cible", "TCP(dport=21, flags=\"S\") crée un SYN", "sr1 envoie et attend un seul paquet de réponse", "timeout évite d'attendre indéfiniment"]
      },
      {
        title: "Scanner de ports simple",
        cmd: `from scapy.all import IP, TCP, sr1

target = "192.168.1.20"
for port in [21, 22, 80, 443]:
    pkt = IP(dst=target) / TCP(dport=port, flags="S")
    rep = sr1(pkt, timeout=1, verbose=0)
    if rep and rep.haslayer(TCP) and rep[TCP].flags == 0x12:
        print(f"{port} ouvert")
    elif rep and rep.haslayer(TCP) and rep[TCP].flags == 0x14:
        print(f"{port} fermé")
    else:
        print(f"{port} filtré ou sans réponse")`,
        machine: "PC Linux avec Scapy",
        when: "Pour automatiser l'interprétation SYN-ACK/RST.",
        expected: "Une ligne par port avec ouvert, fermé ou filtré.",
        fix: "Utiliser sudo, réduire la plage de ports et capturer dans Wireshark pour valider.",
        explain: ["haslayer(TCP) vérifie que la réponse contient TCP", "0x12 correspond à SYN+ACK", "0x14 correspond à RST+ACK", "verbose=0 limite le bruit"]
      }
    ],
    steps: [
      "Installer vsftpd, ftp et FileZilla selon les machines disponibles.",
      "Créer un utilisateur Linux et vérifier que le service vsftpd est démarré.",
      "Se connecter depuis le client avec ftp ou FileZilla.",
      "Capturer dans Wireshark et retrouver SYN, SYN-ACK, ACK.",
      "Repérer USER, PASS et QUIT dans le flux FTP.",
      "Créer un SYN Scapy vers le port 21 puis vers le port 80.",
      "Écrire un scanner simple et comparer les réponses dans Wireshark."
    ],
    observe: [
      "Dans Wireshark, tcp.flags.syn == 1 permet de repérer les SYN.",
      "Le port source client est souvent aléatoire, le port destination est 21 pour FTP ou 80 pour HTTP.",
      "FTP affiche USER et PASS en clair dans la capture.",
      "Un port fermé répond typiquement par RST/RST-ACK."
    ],
    oral: [
      { q: "Quelle est la différence entre SYN, SYN-ACK et ACK ?", a: "SYN demande l'ouverture, SYN-ACK accepte et acquitte, ACK confirme l'établissement." },
      { q: "Comment savoir si un port est ouvert avec Scapy ?", a: "On envoie un SYN : si la réponse TCP a les flags SYN-ACK, le port est ouvert." },
      { q: "Pourquoi FTP n'est pas sécurisé ?", a: "Parce que les identifiants et commandes passent en clair sans chiffrement." }
    ],
    errors: [
      { issue: "Scapy ne reçoit rien", solution: "Exécuter avec sudo, vérifier l'adresse cible, le pare-feu et le timeout." },
      { issue: "FileZilla refuse la connexion", solution: "Vérifier vsftpd active/running, le compte utilisateur et le port 21." },
      { issue: "Mauvaise interprétation des flags", solution: "SYN-ACK = 0x12 ouvert, RST-ACK = 0x14 fermé, silence = filtré ou bloqué." },
      { issue: "Aucune capture FTP lisible", solution: "Désactiver le chiffrement FileZilla si le TP demande FTP simple et filtrer tcp.port == 21." }
    ],
    quiz: [
      { q: "Quel est l'ordre du three-way handshake ?", choices: ["ACK, SYN, SYN-ACK", "SYN, SYN-ACK, ACK", "SYN, FIN, ACK", "RST, SYN, ACK"], answer: 1, why: "TCP ouvre une connexion avec SYN puis SYN-ACK puis ACK." },
      { q: "Que signifie une réponse RST à un SYN ?", choices: ["Port ouvert", "Port fermé", "Mot de passe correct", "Route IPv6"], answer: 1, why: "RST indique généralement que le port refuse la connexion." },
      { q: "Quelle commande FTP transporte le login ?", choices: ["USER", "PASS", "QUIT", "SYN"], answer: 0, why: "USER envoie l'identifiant, PASS envoie le mot de passe." },
      { q: "Dans Scapy, sr1() sert à quoi ?", choices: ["Installer Scapy", "Envoyer et attendre une réponse", "Redémarrer FTP", "Créer un utilisateur"], answer: 1, why: "sr1 envoie un paquet et renvoie la première réponse." }
    ],
    flashcards: [
      { front: "Recto : flags 0x12 ?", back: "Verso : SYN + ACK, donc port probablement ouvert." },
      { front: "Recto : Pourquoi le port source change ?", back: "Verso : Le client choisit souvent un port éphémère pour différencier les connexions." },
      { front: "Recto : FTP sécurisé ou non ?", back: "Verso : FTP simple n'est pas sécurisé car il n'est pas chiffré." }
    ],
    exercises: [
      "Capturer une connexion FTP et retrouver le mot de passe dans le flux.",
      "Modifier le scanner Scapy pour tester les ports 20 à 25.",
      "Expliquer à l'oral la différence entre port fermé et port filtré."
    ],
    memo: [
      "TCP : SYN, SYN-ACK, ACK.",
      "SYN-ACK = ouvert ; RST = fermé ; silence = filtré/bloqué.",
      "FTP expose USER et PASS en clair.",
      "Scapy : IP()/TCP()/sr1()/haslayer(TCP)."
    ],
    exam: [
      {
        title: "Scapy : identifier un port ouvert",
        situation: "Le prof te donne 192.168.1.20 et demande si le port 21 est ouvert, sans utiliser FileZilla.",
        correction: "Créer IP(dst=\"192.168.1.20\")/TCP(dport=21, flags=\"S\"), envoyer avec sr1(timeout=2), puis interpréter rep[TCP].flags : 0x12 ouvert, 0x14 fermé, rien filtré."
      }
    ]
  },
  {
    id: "tp3",
    number: "TP3",
    short: "Routage NAT iptables",
    title: "TP3 — Routage et NAT sous Linux avec iptables",
    accent: "#34d399",
    objectives: [
      "Transformer un PC Linux en routeur.",
      "Activer l'IP forwarding.",
      "Comprendre NAT, PAT, table filter et table nat.",
      "Configurer MASQUERADE et les règles FORWARD.",
      "Rediriger des ports vers Apache2 et vsftpd.",
      "Observer la traduction d'adresse avec Wireshark."
    ],
    keyIdeas: ["PC-routeur", "ip_forward", "NAT", "PAT", "iptables filter", "iptables nat", "FORWARD", "POSTROUTING MASQUERADE", "port forwarding"],
    summary: "Ce TP montre qu'un Linux peut router entre deux interfaces. Pour que les paquets traversent la machine, il faut activer ip_forward, autoriser le trafic dans FORWARD et ajouter du NAT avec MASQUERADE sur l'interface WAN. Les redirections de ports permettent ensuite d'exposer un serveur interne depuis l'extérieur.",
    topology: {
      description: "Un client LAN sort vers un réseau extérieur via un PC-routeur Linux. Le PC-routeur possède une interface LAN et une interface WAN. Des serveurs Apache2/FTP peuvent être placés côté LAN et publiés par redirection de ports.",
      nodes: [
        { label: "Client LAN", detail: "192.168.10.10/24<br>GW .254" },
        { label: "PC-routeur", detail: "LAN .254<br>WAN 10.0.0.2" },
        { label: "Réseau extérieur", detail: "10.0.0.0/24" },
        { label: "Serveur Web/FTP", detail: "Apache2 + vsftpd" }
      ]
    },
    course: [
      {
        title: "Routage sous Linux",
        body: "Par défaut, un PC Linux traite ses propres paquets mais ne transfère pas ceux des autres machines. Le noyau doit être autorisé à router avec net.ipv4.ip_forward=1.",
        bullets: ["0 = forwarding désactivé", "1 = forwarding activé", "La passerelle du client doit pointer vers le PC-routeur"]
      },
      {
        title: "NAT vs PAT",
        body: "Le NAT traduit une adresse IP. Le PAT traduit aussi les ports pour permettre à plusieurs machines privées de partager une même adresse publique ou WAN.",
        bullets: ["NAT : traduction d'adresse", "PAT : traduction adresse + port", "MASQUERADE est pratique quand l'adresse WAN peut changer"]
      },
      {
        title: "iptables : tables et chaînes",
        body: "iptables organise les règles par tables. La table filter sert à autoriser ou bloquer. La table nat sert aux traductions, notamment PREROUTING et POSTROUTING.",
        bullets: ["INPUT : trafic vers le routeur lui-même", "OUTPUT : trafic émis par le routeur", "FORWARD : trafic qui traverse", "PREROUTING : avant décision de routage", "POSTROUTING : juste avant sortie"]
      },
      {
        title: "MASQUERADE",
        body: "MASQUERADE remplace l'adresse source privée du client par l'adresse de l'interface WAN du routeur. Les réponses reviennent au routeur, qui dé-traduit vers le client.",
        bullets: ["Règle dans table nat", "Chaîne POSTROUTING", "Interface -o = interface WAN", "À observer avec Wireshark côté LAN et WAN"]
      },
      {
        title: "Redirection de ports",
        body: "Pour rendre un serveur interne accessible depuis l'extérieur, on utilise DNAT en PREROUTING et on autorise le flux FORWARD vers le serveur.",
        bullets: ["Exemple : port 80 extérieur vers 192.168.10.20:80", "Service interne doit être démarré", "La passerelle du serveur doit être le PC-routeur"]
      }
    ],
    commands: [
      {
        title: "Activer l'IP forwarding",
        cmd: "sudo sysctl -w net.ipv4.ip_forward=1",
        machine: "PC-routeur Linux",
        when: "Avant de tester le routage entre LAN et WAN.",
        expected: "La sortie affiche net.ipv4.ip_forward = 1.",
        fix: "Si ça revient à 0 après redémarrage, rendre le réglage permanent dans /etc/sysctl.conf.",
        explain: ["sysctl modifie un paramètre noyau", "net.ipv4.ip_forward autorise le transfert IPv4", "-w écrit la valeur immédiatement"]
      },
      {
        title: "Voir les règles filter",
        cmd: "sudo iptables -L -n -v",
        machine: "PC-routeur Linux",
        when: "Pour diagnostiquer INPUT, OUTPUT et FORWARD.",
        expected: "Les chaînes et compteurs de paquets apparaissent.",
        fix: "Si FORWARD bloque, ajouter les règles d'autorisation nécessaires.",
        explain: ["-L liste les règles", "-n évite les résolutions DNS", "-v affiche les compteurs"]
      },
      {
        title: "Voir les règles NAT",
        cmd: "sudo iptables -t nat -L -n -v",
        machine: "PC-routeur Linux",
        when: "Pour vérifier MASQUERADE ou une redirection de port.",
        expected: "POSTROUTING contient MASQUERADE sur l'interface WAN.",
        fix: "Si la règle est absente ou mauvaise, corriger -o interfaceWAN.",
        explain: ["-t nat choisit la table nat", "POSTROUTING contient le SNAT/MASQUERADE", "PREROUTING contient souvent les DNAT"]
      },
      {
        title: "Autoriser le trafic LAN vers WAN",
        cmd: "sudo iptables -A FORWARD -i enp1s0 -o enp2s0 -j ACCEPT",
        machine: "PC-routeur Linux",
        when: "Après activation du forwarding.",
        expected: "Les paquets du LAN vers WAN sont autorisés.",
        fix: "Vérifier que enp1s0 est bien LAN et enp2s0 bien WAN.",
        explain: ["-A FORWARD ajoute une règle traversante", "-i est l'interface d'entrée", "-o est l'interface de sortie", "-j ACCEPT autorise"]
      },
      {
        title: "Autoriser les retours établis",
        cmd: "sudo iptables -A FORWARD -i enp2s0 -o enp1s0 -m state --state RELATED,ESTABLISHED -j ACCEPT",
        machine: "PC-routeur Linux",
        when: "Pour laisser revenir les réponses sans ouvrir tout le WAN.",
        expected: "Les réponses aux connexions LAN sortantes passent.",
        fix: "Si les retours bloquent, vérifier le module state et l'ordre des règles.",
        explain: ["RELATED,ESTABLISHED correspond aux flux déjà connus", "WAN vers LAN est limité aux réponses", "évite une ouverture trop large"]
      },
      {
        title: "NAT avec MASQUERADE",
        cmd: "sudo iptables -t nat -A POSTROUTING -o enp2s0 -j MASQUERADE",
        machine: "PC-routeur Linux",
        when: "Pour permettre aux clients privés de sortir via l'interface WAN.",
        expected: "Côté WAN, les paquets sortent avec l'adresse du routeur.",
        fix: "Si Internet ou le réseau extérieur ne répond pas, vérifier l'interface -o et la passerelle du client.",
        explain: ["table nat pour traduire", "POSTROUTING juste avant la sortie", "-o enp2s0 doit être le WAN", "MASQUERADE remplace la source"]
      },
      {
        title: "Installer services Web et FTP",
        cmd: "sudo apt install apache2 vsftpd -y\nsudo systemctl restart apache2\nsudo systemctl restart vsftpd",
        machine: "Serveur Linux interne",
        when: "Avant une redirection de ports vers les services internes.",
        expected: "apache2 et vsftpd actifs.",
        fix: "Utiliser systemctl status apache2/vsftpd et vérifier les ports 80/21.",
        explain: ["apache2 fournit HTTP", "vsftpd fournit FTP", "restart relance les services"]
      }
    ],
    steps: [
      "Attribuer une IP LAN et une IP WAN au PC-routeur.",
      "Mettre la passerelle du client LAN vers l'IP LAN du PC-routeur.",
      "Activer ip_forward sur le PC-routeur.",
      "Ajouter les règles FORWARD LAN vers WAN et retours établis.",
      "Ajouter MASQUERADE en POSTROUTING sur l'interface WAN.",
      "Tester ping vers la passerelle, puis vers le réseau extérieur.",
      "Installer Apache2/vsftpd et ajouter les redirections de ports si demandé.",
      "Comparer les captures Wireshark côté LAN et côté WAN."
    ],
    observe: [
      "Côté LAN, la source reste 192.168.10.10 ; côté WAN, elle devient l'adresse du PC-routeur.",
      "Les compteurs iptables augmentent avec -L -n -v.",
      "Un trafic traversant passe par FORWARD, pas INPUT.",
      "Une redirection de port doit être visible en PREROUTING de la table nat."
    ],
    oral: [
      { q: "À quoi sert ip_forward ?", a: "À autoriser le noyau Linux à transférer les paquets entre interfaces." },
      { q: "Quelle est la différence entre NAT et PAT ?", a: "NAT traduit l'adresse IP ; PAT traduit aussi les ports pour partager une adresse." },
      { q: "Pourquoi utiliser MASQUERADE ?", a: "Pour traduire automatiquement la source avec l'adresse de l'interface de sortie, pratique côté WAN." }
    ],
    errors: [
      { issue: "IP forwarding non activé", solution: "Vérifier sysctl net.ipv4.ip_forward et remettre à 1." },
      { issue: "Mauvaise interface MASQUERADE", solution: "L'interface -o doit être le WAN, pas le LAN." },
      { issue: "Mauvaise passerelle client", solution: "Le client doit avoir comme gateway l'IP LAN du PC-routeur." },
      { issue: "Service non démarré", solution: "systemctl status apache2/vsftpd puis restart si nécessaire." },
      { issue: "Règle FORWARD absente", solution: "Autoriser le sens LAN->WAN et les retours RELATED,ESTABLISHED." }
    ],
    quiz: [
      { q: "Quelle chaîne iptables gère le trafic qui traverse le routeur ?", choices: ["INPUT", "OUTPUT", "FORWARD", "LOCAL"], answer: 2, why: "FORWARD concerne les paquets routés entre interfaces." },
      { q: "Où place-t-on MASQUERADE ?", choices: ["filter INPUT", "nat POSTROUTING", "nat OUTPUT", "filter OUTPUT"], answer: 1, why: "MASQUERADE modifie la source juste avant la sortie." },
      { q: "Que fait ip_forward=1 ?", choices: ["Active FTP", "Active le routage IPv4 Linux", "Crée un VLAN", "Lance DHCP"], answer: 1, why: "Le noyau accepte de transférer les paquets." },
      { q: "Une règle PREROUTING DNAT sert surtout à...", choices: ["Changer la destination avant routage", "Changer le mot de passe FTP", "Afficher les VLAN", "Créer une IPv6"], answer: 0, why: "DNAT en PREROUTING redirige vers une destination interne." }
    ],
    flashcards: [
      { front: "Recto : Trafic vers le routeur lui-même ?", back: "Verso : Chaîne INPUT." },
      { front: "Recto : Trafic qui traverse le routeur ?", back: "Verso : Chaîne FORWARD." },
      { front: "Recto : MASQUERADE dans quelle table ?", back: "Verso : Table nat, chaîne POSTROUTING." }
    ],
    exercises: [
      "Écrire les trois commandes minimales : ip_forward, FORWARD LAN->WAN, MASQUERADE.",
      "Dessiner les adresses vues côté LAN et côté WAN après NAT.",
      "Trouver l'erreur si le client ping la gateway mais pas le réseau extérieur."
    ],
    memo: [
      "PC-routeur = deux interfaces + ip_forward=1.",
      "FORWARD pour le trafic traversant.",
      "MASQUERADE en nat/POSTROUTING sur WAN.",
      "Wireshark prouve la traduction d'adresse."
    ],
    exam: [
      {
        title: "NAT : les clients ne sortent pas",
        situation: "Le client LAN ping le PC-routeur, mais pas le serveur extérieur. Le prof te demande de dépanner vite.",
        correction: "Vérifier ip route côté client, sysctl net.ipv4.ip_forward, iptables -L -n -v pour FORWARD, iptables -t nat -L -n -v pour MASQUERADE. Corriger la règle avec -o interfaceWAN."
      }
    ]
  },
  {
    id: "tp4",
    number: "TP4",
    short: "Cisco VLAN ACL DMZ",
    title: "TP4 — Cisco, VLAN, DMZ et ACL",
    accent: "#a78bfa",
    objectives: [
      "Créer une topologie d'entreprise sous Packet Tracer.",
      "Découper en VLAN Admin et Personnel.",
      "Configurer les ports access, le trunk 802.1Q et le routage inter-VLAN.",
      "Activer SSH sur le switch et limiter l'accès au PC Admin.",
      "Mettre en place une DMZ avec serveurs Web, DHCP et FTP.",
      "Écrire des ACL cohérentes et tester ping, HTTP, HTTPS et SSH."
    ],
    keyIdeas: ["VLAN 10 ADMIN", "VLAN 20 PERSONNEL", "trunk 802.1Q", "router-on-a-stick", "SSH Cisco", "ACL standard", "ACL étendue", "DMZ", "ip helper-address"],
    summary: "Ce TP assemble plusieurs briques Cisco : segmentation VLAN, trunk 802.1Q, sous-interfaces routeur, SSH sécurisé par ACL, DMZ et règles de filtrage. La difficulté principale est de placer les ACL au bon endroit et de tester chaque flux séparément.",
    topology: {
      description: "Un switch porte les VLAN 10 ADMIN et 20 PERSONNEL. Le port vers le routeur est en trunk. Le routeur fait l'inter-VLAN avec g0/0.10 et g0/0.20, puis relie une DMZ et un réseau extérieur.",
      nodes: [
        { label: "VLAN 10", detail: "ADMIN<br>10.0.10.0/24" },
        { label: "Switch", detail: "access + trunk" },
        { label: "Routeur", detail: "g0/0.10<br>g0/0.20" },
        { label: "DMZ", detail: "Web DHCP FTP" },
        { label: "Extérieur", detail: "DNS Web PC" }
      ]
    },
    course: [
      {
        title: "VLAN et segmentation",
        body: "Un VLAN sépare logiquement un switch en plusieurs réseaux. Deux machines dans deux VLAN différents ne communiquent pas directement sans routage inter-VLAN.",
        bullets: ["VLAN 10 ADMIN : 10.0.10.0/24", "VLAN 20 PERSONNEL : 10.0.20.0/24", "Un port access appartient à un seul VLAN"]
      },
      {
        title: "Trunk 802.1Q",
        body: "Un trunk transporte plusieurs VLAN sur un même lien. L'encapsulation dot1Q ajoute une étiquette VLAN dans la trame Ethernet.",
        bullets: ["switchport mode trunk côté switch", "encapsulation dot1Q 10 côté routeur", "show interfaces trunk vérifie le lien"]
      },
      {
        title: "Router-on-a-stick",
        body: "Le routeur utilise des sous-interfaces, une par VLAN. Chaque sous-interface reçoit l'encapsulation dot1Q et l'adresse passerelle du VLAN.",
        bullets: ["g0/0.10 = passerelle 10.0.10.1", "g0/0.20 = passerelle 10.0.20.1", "Les PC utilisent la passerelle de leur VLAN"]
      },
      {
        title: "SSH sur switch Cisco",
        body: "Pour administrer le switch à distance, on configure hostname, domain-name, utilisateur local, clé RSA et lignes vty en transport input ssh.",
        bullets: ["login local utilise la base d'utilisateurs locale", "crypto key generate rsa crée les clés", "access-class limite qui peut entrer en SSH"]
      },
      {
        title: "ACL standard et étendue",
        body: "Une ACL standard filtre surtout sur la source : on la place près de la destination. Une ACL étendue filtre source, destination et protocole : on la place près de la source pour bloquer tôt.",
        bullets: ["standard : access-list 1 permit host 10.0.10.10", "étendue : access-list 100 permit tcp source dest eq 443", "ip access-group applique sur une interface", "access-class applique sur les lignes vty"]
      }
    ],
    commands: [
      {
        title: "Créer VLAN Admin et Personnel",
        cmd: `enable
configure terminal
vlan 10
name ADMIN
vlan 20
name PERSONNEL`,
        machine: "Switch Cisco",
        when: "Au début de la segmentation.",
        expected: "show vlan brief affiche VLAN 10 ADMIN et VLAN 20 PERSONNEL.",
        fix: "Vérifier que tu es en configuration globale et que le VLAN n'est pas supprimé.",
        explain: ["vlan 10 crée ou sélectionne le VLAN", "name donne un nom lisible", "les VLAN existent avant l'affectation des ports"]
      },
      {
        title: "Affecter un port access",
        cmd: `interface fa0/1
switchport mode access
switchport access vlan 10`,
        machine: "Switch Cisco",
        when: "Pour brancher le PC Admin dans le VLAN 10.",
        expected: "show vlan brief place fa0/1 dans VLAN 10.",
        fix: "Vérifier le numéro de port et que le câble du PC est sur ce port.",
        explain: ["mode access force un seul VLAN", "access vlan 10 affecte le port", "utile pour les ports utilisateurs"]
      },
      {
        title: "Configurer le trunk",
        cmd: `interface fa0/24
switchport mode trunk`,
        machine: "Switch Cisco",
        when: "Sur le lien switch-routeur.",
        expected: "show interfaces trunk affiche fa0/24 trunking.",
        fix: "Vérifier le port, l'état up/up et l'encapsulation côté routeur.",
        explain: ["trunk transporte plusieurs VLAN", "802.1Q marque les trames", "indispensable pour router plusieurs VLAN avec un seul lien"]
      },
      {
        title: "Sous-interfaces routeur",
        cmd: `interface g0/0.10
encapsulation dot1Q 10
ip address 10.0.10.1 255.255.255.0
interface g0/0.20
encapsulation dot1Q 20
ip address 10.0.20.1 255.255.255.0`,
        machine: "Routeur Cisco",
        when: "Pour créer les passerelles des VLAN.",
        expected: "show ip interface brief affiche les sous-interfaces up/up.",
        fix: "Activer l'interface physique avec no shutdown et vérifier le trunk.",
        explain: ["g0/0.10 est une sous-interface logique", "dot1Q 10 associe VLAN 10", "ip address pose la passerelle"]
      },
      {
        title: "SSH sur switch",
        cmd: `hostname SW1
ip domain-name entreprise.local
username root privilege 15 secret root
crypto key generate rsa
line vty 0 4
login local
transport input ssh`,
        machine: "Switch Cisco",
        when: "Après avoir configuré une IP d'administration sur le switch.",
        expected: "Un PC autorisé peut se connecter en SSH au switch.",
        fix: "Vérifier l'interface VLAN, la passerelle du switch, la clé RSA et les lignes vty.",
        explain: ["hostname et domain-name sont requis pour générer les clés", "username crée un compte local", "transport input ssh bloque telnet"]
      },
      {
        title: "ACL SSH PC Admin uniquement",
        cmd: `access-list 1 permit host 10.0.10.10
line vty 0 4
access-class 1 in`,
        machine: "Switch Cisco",
        when: "Pour limiter l'administration SSH au PC Admin.",
        expected: "Le PC Admin accède en SSH, les autres sont refusés.",
        fix: "Vérifier l'IP source du PC Admin et ne pas appliquer l'ACL sur la mauvaise ligne.",
        explain: ["ACL 1 autorise seulement l'hôte Admin", "access-class filtre les connexions VTY", "in signifie à l'entrée des lignes VTY"]
      },
      {
        title: "ACL Personnel vers DMZ",
        cmd: `access-list 100 permit ip 10.0.20.0 0.0.0.255 10.0.30.0 0.0.0.255
interface g0/0.20
ip access-group 100 in`,
        machine: "Routeur Cisco",
        when: "Pour autoriser le VLAN Personnel vers la DMZ.",
        expected: "Les flux du personnel vers la DMZ passent si une règle permit existe.",
        fix: "Ajouter des permit nécessaires avant un deny implicite et vérifier le sens in/out.",
        explain: ["ACL étendue 100 filtre source et destination", "wildcard 0.0.0.255 correspond à /24", "ip access-group applique l'ACL sur l'interface"]
      }
    ],
    steps: [
      "Créer le plan d'adressage : VLAN 10, VLAN 20, DMZ, extérieur.",
      "Créer les VLAN sur le switch et affecter les ports utilisateurs.",
      "Configurer le port trunk vers le routeur.",
      "Créer les sous-interfaces routeur avec encapsulation dot1Q.",
      "Mettre les passerelles sur les PC et tester ping intra/inter-VLAN.",
      "Configurer l'IP d'administration du switch, SSH et l'utilisateur local.",
      "Limiter SSH au PC Admin avec access-class.",
      "Ajouter la DMZ et les services Web, DHCP, FTP.",
      "Écrire les ACL flux par flux puis tester ping, HTTP, HTTPS, SSH."
    ],
    observe: [
      "show vlan brief confirme les ports access.",
      "show interfaces trunk confirme que le VLAN 10 et 20 passent sur le trunk.",
      "show ip interface brief confirme les sous-interfaces et passerelles.",
      "Packet Tracer permet de tester HTTP/HTTPS/SSH depuis les bons hôtes.",
      "Une ACL a un deny implicite à la fin : tout ce qui n'est pas permis est bloqué."
    ],
    oral: [
      { q: "Pourquoi utiliser un trunk ?", a: "Pour transporter plusieurs VLAN sur un seul lien entre switch et routeur ou entre switches." },
      { q: "À quoi sert encapsulation dot1Q ?", a: "À associer une sous-interface routeur à un VLAN grâce au marquage 802.1Q." },
      { q: "Différence ACL standard et étendue ?", a: "Standard filtre surtout la source ; étendue filtre source, destination, protocole et ports." }
    ],
    errors: [
      { issue: "Ping inter-VLAN impossible", solution: "Vérifier passerelle PC, trunk, sous-interface dot1Q et no shutdown de l'interface physique." },
      { issue: "SSH inaccessible", solution: "Vérifier interface VLAN du switch, default-gateway, clés RSA, login local et ACL access-class." },
      { issue: "ACL bloque trop", solution: "Relire ordre des règles, deny implicite et sens in/out." },
      { issue: "VLAN du port incorrect", solution: "show vlan brief puis corriger switchport access vlan." },
      { issue: "DMZ accessible depuis le mauvais réseau", solution: "Revoir ACL étendue près de la source et tester protocole par protocole." }
    ],
    quiz: [
      { q: "Quel protocole marque les VLAN sur un trunk ?", choices: ["802.1Q", "NDP", "FTP", "DHCP"], answer: 0, why: "802.1Q ajoute un tag VLAN dans la trame." },
      { q: "Quelle commande associe g0/0.10 au VLAN 10 ?", choices: ["switchport access vlan 10", "encapsulation dot1Q 10", "access-class 10 in", "ip helper-address 10"], answer: 1, why: "Sur le routeur, encapsulation dot1Q 10 associe la sous-interface au VLAN 10." },
      { q: "Où place-t-on plutôt une ACL étendue ?", choices: ["Près de la source", "Toujours sur le switch", "Près de la destination seulement", "Jamais en entrée"], answer: 0, why: "Elle est précise, donc on bloque le trafic indésirable le plus tôt possible." },
      { q: "Quelle commande vérifie les VLAN et les ports ?", choices: ["show vlan brief", "show ipv6 neighbors", "ipconfig", "iptables -L"], answer: 0, why: "show vlan brief liste les VLAN et les ports affectés." }
    ],
    flashcards: [
      { front: "Recto : Port access ?", back: "Verso : Port utilisateur dans un seul VLAN." },
      { front: "Recto : Trunk ?", back: "Verso : Lien qui transporte plusieurs VLAN avec 802.1Q." },
      { front: "Recto : deny implicite ?", back: "Verso : Une ACL bloque tout ce qui n'est pas explicitement permis." }
    ],
    exercises: [
      "Configurer VLAN 10 et 20 puis vérifier show vlan brief.",
      "Écrire les sous-interfaces g0/0.10 et g0/0.20 de mémoire.",
      "Créer une ACL qui autorise seulement 10.0.10.10 en SSH vers le switch."
    ],
    memo: [
      "VLAN 10 ADMIN = 10.0.10.0/24 ; VLAN 20 PERSONNEL = 10.0.20.0/24.",
      "Trunk switch-routeur + sous-interfaces routeur = inter-VLAN.",
      "SSH Cisco : hostname, domain-name, username, RSA, vty, login local.",
      "ACL standard proche destination, ACL étendue proche source."
    ],
    exam: [
      {
        title: "Cisco : le Personnel ne joint pas la DMZ",
        situation: "Un PC du VLAN 20 ne peut pas accéder au serveur Web DMZ. Le VLAN 10 fonctionne. Tu dois trouver où regarder.",
        correction: "Tester ping passerelle VLAN 20, show vlan brief, show interfaces trunk, show ip interface brief. Ensuite vérifier ACL appliquée sur g0/0.20 in : permit vers DMZ avant le deny implicite, puis tester HTTP/HTTPS selon la règle."
      }
    ]
  },
  {
    id: "tp5",
    number: "TP5",
    short: "DHCP multi-VLAN",
    title: "TP5 — DHCP sur plusieurs réseaux, VLAN 100 et 200",
    accent: "#fbbf24",
    objectives: [
      "Créer VLAN 100 et VLAN 200 sur un switch Cisco.",
      "Configurer un trunk sur le port 24.",
      "Mettre en place le routage inter-VLAN.",
      "Utiliser un serveur DHCP unique pour plusieurs VLAN.",
      "Comprendre pourquoi DHCP ne traverse pas un routeur sans relais.",
      "Configurer ip helper-address vers 192.168.150.50.",
      "Tester avec dhclient côté Linux."
    ],
    keyIdeas: ["VLAN 100", "VLAN 200", "serveur DHCP 192.168.150.50", "broadcast DHCP", "routeur ne relaie pas broadcast", "ip helper-address", "isc-dhcp-server", "dhclient"],
    summary: "Le serveur DHCP est dans le réseau serveur 192.168.150.0/24, mais il doit distribuer des adresses aux VLAN 100 et 200. Comme DHCP commence par un broadcast, le routeur ne le transmet pas directement. La solution est le relais DHCP : ip helper-address 192.168.150.50 sur les sous-interfaces des VLAN clients.",
    topology: {
      description: "Les ports 1 à 10 du switch sont en VLAN 100, les ports 11 à 20 en VLAN 200, le port 24 est en trunk vers le routeur. Le serveur DHCP est en 192.168.150.50 dans le réseau serveur.",
      nodes: [
        { label: "VLAN 100", detail: "192.168.100.0/24<br>ports 1-10" },
        { label: "Switch", detail: "fa0/24 trunk" },
        { label: "Routeur", detail: "g0/0.100<br>g0/0.200" },
        { label: "Serveur DHCP", detail: "192.168.150.50" },
        { label: "VLAN 200", detail: "192.168.200.0/24<br>ports 11-20" }
      ]
    },
    course: [
      {
        title: "Pourquoi DHCP bloque au routeur",
        body: "Un client sans IP envoie un DHCP Discover en broadcast. Un routeur ne transmet pas les broadcasts par défaut, donc le serveur placé dans un autre réseau ne voit pas la demande.",
        bullets: ["DHCP Discover : broadcast", "Le client ne connaît pas encore le serveur", "Le routeur sépare les domaines de broadcast"]
      },
      {
        title: "Relais DHCP avec ip helper-address",
        body: "ip helper-address transforme la demande broadcast reçue sur une interface en unicast vers le serveur DHCP. Le serveur peut répondre avec la bonne étendue selon le réseau d'origine.",
        bullets: ["À placer sur g0/0.100 et g0/0.200", "Adresse cible : 192.168.150.50", "Le serveur doit avoir une route retour vers les VLAN"]
      },
      {
        title: "Étendues DHCP Windows Server",
        body: "Sur Windows Server, il faut une étendue par réseau client : une pour 192.168.100.0/24 et une pour 192.168.200.0/24. Chaque étendue doit fournir passerelle, masque et DNS si nécessaire.",
        bullets: ["VLAN 100 : plage 192.168.100.x", "VLAN 200 : plage 192.168.200.x", "Routeur côté serveur : 192.168.150.1", "Serveur DHCP statique : 192.168.150.50"]
      },
      {
        title: "Variante Linux isc-dhcp-server",
        body: "Avec isc-dhcp-server, les plages se déclarent dans /etc/dhcp/dhcpd.conf. Le service doit écouter sur l'interface serveur et connaître les subnets à distribuer.",
        bullets: ["subnet 192.168.100.0 netmask 255.255.255.0", "range 192.168.100.100 192.168.100.200", "option routers 192.168.100.1", "redémarrer le service"]
      },
      {
        title: "Tests côté client",
        body: "Un client Linux peut libérer puis redemander un bail avec dhclient. Ensuite, ip a, ip route et ping confirment que l'adresse, la passerelle et la connectivité sont correctes.",
        bullets: ["sudo dhclient -r enp2s0", "sudo dhclient enp2s0", "ip a", "ip route", "ping passerelle puis serveur"]
      }
    ],
    commands: [
      {
        title: "Créer VLAN 100 et 200",
        cmd: `vlan 100
name VLAN100
vlan 200
name VLAN200`,
        machine: "Switch Cisco",
        when: "Avant d'affecter les ports clients.",
        expected: "show vlan brief affiche VLAN 100 et VLAN 200.",
        fix: "Vérifier le mode configuration globale.",
        explain: ["vlan crée le VLAN", "name donne un nom", "les ports sont affectés ensuite"]
      },
      {
        title: "Affecter les ports VLAN",
        cmd: `interface range fa0/1-10
switchport mode access
switchport access vlan 100
interface range fa0/11-20
switchport mode access
switchport access vlan 200`,
        machine: "Switch Cisco",
        when: "Pour placer les clients dans le bon VLAN.",
        expected: "show vlan brief montre fa0/1-10 en VLAN 100 et fa0/11-20 en VLAN 200.",
        fix: "Corriger le range de ports si Packet Tracer utilise une autre notation.",
        explain: ["interface range évite de répéter", "mode access = port utilisateur", "access vlan choisit le VLAN"]
      },
      {
        title: "Port 24 en trunk",
        cmd: `interface fa0/24
switchport mode trunk`,
        machine: "Switch Cisco",
        when: "Sur le lien vers le routeur.",
        expected: "show interfaces trunk affiche fa0/24 et les VLAN autorisés.",
        fix: "Vérifier que le câble vers le routeur est bien sur fa0/24.",
        explain: ["trunk transporte VLAN 100 et 200", "802.1Q permet de distinguer les VLAN", "indispensable pour inter-VLAN"]
      },
      {
        title: "Sous-interfaces et relais DHCP",
        cmd: `interface g0/0.100
encapsulation dot1Q 100
ip address 192.168.100.1 255.255.255.0
ip helper-address 192.168.150.50
interface g0/0.200
encapsulation dot1Q 200
ip address 192.168.200.1 255.255.255.0
ip helper-address 192.168.150.50`,
        machine: "Routeur Cisco",
        when: "Pour router les VLAN et relayer DHCP.",
        expected: "Les clients VLAN 100 et 200 reçoivent un bail du serveur 192.168.150.50.",
        fix: "Vérifier no shutdown sur l'interface physique, trunk, route serveur et étendues DHCP.",
        explain: ["dot1Q associe chaque sous-interface à un VLAN", "ip address devient la passerelle", "ip helper-address relaie les broadcasts DHCP"]
      },
      {
        title: "Renouveler DHCP Linux",
        cmd: "sudo dhclient -r enp2s0\nsudo dhclient enp2s0",
        machine: "Client Linux VLAN 100 ou 200",
        when: "Après configuration du serveur DHCP et du relais.",
        expected: "ip a affiche une adresse 192.168.100.x ou 192.168.200.x selon le port.",
        fix: "Vérifier VLAN du port, helper-address, étendue DHCP et connectivité serveur.",
        explain: ["-r libère l'ancien bail", "dhclient demande un nouveau bail", "l'interface doit être la bonne carte"]
      },
      {
        title: "Exemple dhcpd.conf Linux",
        cmd: `subnet 192.168.100.0 netmask 255.255.255.0 {
  range 192.168.100.100 192.168.100.200;
  option routers 192.168.100.1;
}

subnet 192.168.200.0 netmask 255.255.255.0 {
  range 192.168.200.100 192.168.200.200;
  option routers 192.168.200.1;
}`,
        machine: "Serveur DHCP Linux",
        when: "Variante si le serveur DHCP est sous Linux avec isc-dhcp-server.",
        expected: "Le service distribue une plage différente pour chaque VLAN.",
        fix: "Vérifier la syntaxe, l'interface d'écoute et redémarrer isc-dhcp-server.",
        explain: ["subnet définit le réseau", "range définit la plage", "option routers donne la passerelle", "une étendue par VLAN"]
      }
    ],
    steps: [
      "Configurer l'IP statique du serveur DHCP : 192.168.150.50/24, gateway 192.168.150.1.",
      "Créer VLAN 100 et VLAN 200 sur le switch.",
      "Affecter ports 1-10 au VLAN 100 et ports 11-20 au VLAN 200.",
      "Mettre le port 24 en trunk vers le routeur.",
      "Créer g0/0.100 et g0/0.200 avec dot1Q et passerelles.",
      "Ajouter ip helper-address 192.168.150.50 sur chaque sous-interface client.",
      "Créer deux étendues DHCP sur Windows Server ou dans dhcpd.conf.",
      "Renouveler le bail côté client et vérifier ip a, ip route, ping passerelle puis serveur."
    ],
    observe: [
      "Sans ip helper-address, le DHCP Discover ne rejoint pas le serveur distant.",
      "Le client VLAN 100 doit obtenir 192.168.100.x, jamais 192.168.200.x.",
      "La passerelle donnée par DHCP doit être 192.168.100.1 ou 192.168.200.1.",
      "Si le serveur n'a pas de route retour, les offres DHCP ou les pings peuvent échouer."
    ],
    oral: [
      { q: "Pourquoi le DHCP ne traverse pas un routeur ?", a: "Parce que la demande initiale est un broadcast et un routeur ne relaie pas les broadcasts par défaut." },
      { q: "À quoi sert ip helper-address ?", a: "À relayer les requêtes DHCP broadcast vers un serveur DHCP distant en unicast." },
      { q: "Comment tester si un VLAN reçoit bien DHCP ?", a: "Renouveler avec dhclient, vérifier ip a, ip route puis ping la passerelle." }
    ],
    errors: [
      { issue: "Client reste sans IP", solution: "Vérifier VLAN du port, trunk, sous-interface, helper-address et service DHCP." },
      { issue: "Mauvaise plage reçue", solution: "Vérifier le port du client, le VLAN affecté et les étendues du serveur." },
      { issue: "Bail reçu mais ping impossible", solution: "Vérifier passerelle DHCP, routes retour et ACL éventuelles." },
      { issue: "Serveur DHCP en DHCP lui-même", solution: "Le serveur doit être statique : 192.168.150.50/24." }
    ],
    quiz: [
      { q: "Pourquoi faut-il ip helper-address ?", choices: ["Pour chiffrer DHCP", "Pour relayer un broadcast DHCP vers un serveur distant", "Pour créer un VLAN", "Pour activer SSH"], answer: 1, why: "Le routeur ne transmet pas le broadcast DHCP sans relais." },
      { q: "Quelle IP correspond au serveur DHCP du TP5 ?", choices: ["192.168.100.1", "192.168.150.50", "10.0.10.10", "fd00::1"], answer: 1, why: "Le serveur DHCP est placé en 192.168.150.50." },
      { q: "Quels ports sont dans le VLAN 200 ?", choices: ["1 à 10", "11 à 20", "24 uniquement", "Tous les ports"], answer: 1, why: "Le sujet place les ports 11 à 20 dans VLAN 200." },
      { q: "Quelle commande libère un bail DHCP Linux ?", choices: ["sudo dhclient -r enp2s0", "ip helper-address", "show vlan brief", "netsh add route"], answer: 0, why: "-r libère le bail avant une nouvelle demande." }
    ],
    flashcards: [
      { front: "Recto : DHCP Discover = ?", back: "Verso : Broadcast envoyé par un client qui cherche un serveur DHCP." },
      { front: "Recto : Où placer ip helper-address ?", back: "Verso : Sur les interfaces ou sous-interfaces qui reçoivent les broadcasts clients." },
      { front: "Recto : VLAN 100 réseau ?", back: "Verso : 192.168.100.0/24." }
    ],
    exercises: [
      "Écrire les sous-interfaces g0/0.100 et g0/0.200 avec helper-address.",
      "Expliquer à l'oral pourquoi deux étendues DHCP sont nécessaires.",
      "Dépanner un client qui reçoit 192.168.200.x alors qu'il est censé être VLAN 100."
    ],
    memo: [
      "VLAN 100 = 192.168.100.0/24 ; VLAN 200 = 192.168.200.0/24.",
      "Serveur DHCP unique : 192.168.150.50.",
      "DHCP Discover = broadcast, bloqué par routeur.",
      "Solution : ip helper-address sur g0/0.100 et g0/0.200."
    ],
    exam: [
      {
        title: "DHCP : aucun bail dans VLAN 200",
        situation: "Un client branché sur le port 15 ne reçoit pas d'adresse. Le VLAN 100 fonctionne. Le serveur DHCP est 192.168.150.50.",
        correction: "Port 15 doit être VLAN 200 : show vlan brief. Vérifier trunk fa0/24, sous-interface g0/0.200, ip helper-address 192.168.150.50, étendue 192.168.200.0/24 et service DHCP."
      }
    ]
  }
];

const commandCategories = [
  {
    name: "Linux réseau",
    commands: [
      ["ip a", "Afficher toutes les adresses IPv4/IPv6", "PC Linux", "Au début du diagnostic", "Interfaces, adresses et état UP/DOWN", "Si l'interface est DOWN, vérifier câble, VM ou ip link set up."],
      ["ip -br a", "Afficher les interfaces en format court", "PC Linux", "Pour retrouver vite le nom d'interface", "Une ligne par interface", "Utiliser le nom exact dans les commandes suivantes."],
      ["ip route", "Afficher la table de routage IPv4", "PC Linux ou PC-routeur", "Si un ping sort mal", "Default gateway et routes connectées", "Ajouter/corriger la passerelle."],
      ["ip -6 route", "Afficher la table de routage IPv6", "PC Linux", "Pour TP1 IPv6", "Routes connected, default ou static", "Ajouter une route IPv6 si le réseau distant manque."],
      ["ping 192.168.1.1", "Tester une connectivité IPv4", "Toute machine", "Après chaque étape réseau", "Réponses ICMP", "Tester d'abord la passerelle, puis la destination."],
      ["ping6 fd00:67::254", "Tester une connectivité IPv6", "PC Linux", "Après configuration IPv6", "Echo replies ICMPv6", "Vérifier adresse, route et NDP."],
      ["sudo dhclient -r enp2s0", "Libérer un bail DHCP", "Client Linux", "Avant une nouvelle demande DHCP", "Pas de sortie importante", "Vérifier le nom d'interface."],
      ["sudo dhclient enp2s0", "Demander un bail DHCP", "Client Linux", "Après configuration serveur/relais", "Une IP apparaît dans ip a", "Vérifier VLAN, helper-address, service DHCP."],
      ["sudo systemctl status apache2", "Voir l'état d'Apache", "Serveur Linux", "Si HTTP ne répond pas", "active/running", "Relancer ou lire les erreurs."],
      ["sudo systemctl restart vsftpd", "Redémarrer FTP", "Serveur Linux", "Après installation ou modification", "Service relancé", "Vérifier status et port 21."],
      ["sudo apt update", "Mettre à jour les dépôts", "Serveur/PC Linux", "Avant installation", "Liste des paquets mise à jour", "Vérifier passerelle/DNS si erreur réseau."],
      ["sudo apt install apache2 vsftpd -y", "Installer Web et FTP", "Serveur Linux", "TP2/TP3 services", "Paquets installés", "Relancer apt update si besoin."]
    ]
  },
  {
    name: "IPv6",
    commands: [
      ["sudo ip -6 a a fd00:67::10/64 dev enp2s0", "Ajouter une adresse IPv6", "PC Linux", "Configuration TP1", "Adresse visible dans ip -6 a", "Corriger interface ou préfixe."],
      ["sudo ip -6 r a fd00:68::/64 via fd00:67::254", "Ajouter une route IPv6", "PC Linux", "Joindre un réseau distant", "Route visible dans ip -6 route", "Vérifier la passerelle."],
      ["ping6 fe80::1%enp2s0", "Pinger une link-local", "PC Linux", "Tester un voisin local", "Réponse ICMPv6", "Ajouter %interface et filtrer icmpv6."]
    ]
  },
  {
    name: "Windows",
    commands: [
      ["ipconfig", "Afficher la configuration IP", "PC Windows", "Diagnostic rapide", "IPv4, IPv6, passerelle", "Vérifier la carte active."],
      ["ping 10.0.10.1", "Tester une connectivité", "PC Windows", "Après adressage", "Réponses", "Tester passerelle puis cible."],
      ["ncpa.cpl", "Ouvrir les cartes réseau", "PC Windows", "Modifier IP/DNS graphiquement", "Fenêtre Connexions réseau", "Choisir la bonne carte."],
      ["netsh interface ipv6 add address \"Ethernet\" fd00:67::20", "Ajouter une IPv6", "PC Windows", "TP1 côté Windows", "Adresse ajoutée", "Adapter le nom exact de l'interface."],
      ["netsh interface ipv6 add route fd00:68::/64 \"Ethernet\" fd00:67::254", "Ajouter une route IPv6", "PC Windows", "Réseau IPv6 distant", "Route créée", "Vérifier passerelle et interface."]
    ]
  },
  {
    name: "Cisco VLAN",
    commands: [
      ["enable", "Passer en mode privilégié", "Switch/routeur Cisco", "Avant show avancés ou config", "Prompt #", "Entrer le mot de passe si demandé."],
      ["configure terminal", "Passer en configuration globale", "Cisco", "Avant de modifier", "Prompt (config)#", "Être en enable avant."],
      ["vlan 10", "Créer/sélectionner VLAN 10", "Switch Cisco", "TP4 VLAN Admin", "Mode config-vlan", "Vérifier show vlan brief."],
      ["name ADMIN", "Nommer le VLAN", "Switch Cisco", "Après vlan 10", "Nom visible", "Le nom est surtout lisible humainement."],
      ["vlan 20", "Créer/sélectionner VLAN 20", "Switch Cisco", "TP4 VLAN Personnel", "Mode config-vlan", "Même méthode pour VLAN 100/200."],
      ["name PERSONNEL", "Nommer le VLAN 20", "Switch Cisco", "Après vlan 20", "Nom visible", "Vérifier orthographe si besoin."],
      ["interface fa0/1", "Entrer sur un port", "Switch Cisco", "Affecter un PC", "Prompt config-if", "Utiliser le bon port."],
      ["switchport mode access", "Mettre le port en access", "Switch Cisco", "Port utilisateur", "Port non trunk", "Utile pour PC."],
      ["switchport access vlan 10", "Affecter le port au VLAN 10", "Switch Cisco", "PC Admin", "Port listé dans VLAN 10", "Créer le VLAN avant."],
      ["interface fa0/24", "Entrer sur le port trunk", "Switch Cisco", "Lien routeur", "Prompt config-if", "Vérifier câble."],
      ["switchport mode trunk", "Activer trunk", "Switch Cisco", "Transport multi-VLAN", "show interfaces trunk OK", "Vérifier dot1Q côté routeur."],
      ["show vlan brief", "Afficher VLAN/ports", "Switch Cisco", "Diagnostic VLAN", "Ports dans les bons VLAN", "Corriger access vlan."],
      ["show interfaces trunk", "Afficher trunks", "Switch Cisco", "Diagnostic inter-VLAN", "Port trunking", "Corriger port ou état."]
    ]
  },
  {
    name: "Cisco routage inter-VLAN",
    commands: [
      ["interface g0/0.10", "Créer sous-interface VLAN 10", "Routeur Cisco", "Router-on-a-stick", "Prompt subinterface", "Activer l'interface physique."],
      ["encapsulation dot1Q 10", "Associer VLAN 10", "Routeur Cisco", "Sous-interface", "Tag 802.1Q configuré", "Vérifier numéro VLAN."],
      ["ip address 10.0.10.1 255.255.255.0", "Mettre la passerelle VLAN 10", "Routeur Cisco", "Sous-interface VLAN 10", "IP up/up", "Masque et adresse cohérents."],
      ["interface g0/0.20", "Créer sous-interface VLAN 20", "Routeur Cisco", "Router-on-a-stick", "Prompt subinterface", "Vérifier trunk."],
      ["encapsulation dot1Q 20", "Associer VLAN 20", "Routeur Cisco", "Sous-interface", "Tag VLAN 20", "Même VLAN que le switch."],
      ["ip address 10.0.20.1 255.255.255.0", "Mettre la passerelle VLAN 20", "Routeur Cisco", "Sous-interface VLAN 20", "IP configurée", "Passerelle des PC = .1."],
      ["show ip interface brief", "Voir état des interfaces", "Routeur/Switch Cisco", "Diagnostic global", "up/up attendu", "no shutdown et câblage."]
    ]
  },
  {
    name: "Cisco IPv6",
    commands: [
      ["ipv6 unicast-routing", "Activer le routage IPv6", "Routeur Cisco", "Avant routes IPv6", "Routage IPv6 actif", "Sans ça, le routeur ne route pas IPv6."],
      ["interface g0/0", "Entrer sur l'interface", "Routeur Cisco", "Configurer IPv6", "Prompt config-if", "Vérifier nom interface."],
      ["ipv6 address fc00:67::254/64", "Poser une adresse IPv6", "Routeur Cisco", "TP1", "Adresse dans show ipv6 interface brief", "Préfixe /64 cohérent."],
      ["no shutdown", "Activer l'interface", "Cisco", "Après config interface", "Interface up", "Vérifier câble si down/down."],
      ["show ipv6 interface brief", "Résumé IPv6 interfaces", "Routeur Cisco", "Diagnostic TP1", "Adresses et état", "Corriger no shutdown/adresse."],
      ["show ipv6 route", "Table de routage IPv6", "Routeur Cisco", "Routes statiques/connectées", "Préfixes C/L/S", "Ajouter route statique si manque."],
      ["show ipv6 neighbors", "Cache NDP", "Routeur Cisco", "Après ping IPv6", "Voisins IPv6/MAC", "Générer trafic et vérifier ICMPv6."]
    ]
  },
  {
    name: "SSH Cisco",
    commands: [
      ["hostname SW1", "Nommer le switch", "Switch Cisco", "Avant SSH", "Hostname modifié", "Requis avec domain-name pour RSA."],
      ["ip domain-name entreprise.local", "Définir domaine", "Switch Cisco", "Avant clés RSA", "Domaine configuré", "N'importe quel domaine TP cohérent."],
      ["username root privilege 15 secret root", "Créer compte admin", "Switch Cisco", "SSH", "Utilisateur local", "Choisir un secret demandé par le TP."],
      ["crypto key generate rsa", "Générer clés SSH", "Switch Cisco", "Activer SSH", "Clés créées", "Mettre modulus suffisant si demandé."],
      ["line vty 0 4", "Configurer accès distant", "Switch Cisco", "SSH/Telnet", "Prompt line", "Appliquer login local dessous."],
      ["login local", "Utiliser utilisateurs locaux", "Switch Cisco", "Lignes VTY", "SSH demande user/pass local", "Vérifier username."],
      ["transport input ssh", "Autoriser seulement SSH", "Switch Cisco", "Sécurisation", "Telnet refusé", "Vérifier version IOS."]
    ]
  },
  {
    name: "ACL Cisco",
    commands: [
      ["access-list 1 permit host 10.0.10.10", "Autoriser seulement PC Admin", "Switch Cisco", "Limiter SSH", "ACL standard créée", "L'appliquer avec access-class."],
      ["access-class 1 in", "Appliquer ACL aux VTY", "Switch Cisco", "Sous line vty 0 4", "SSH filtré", "Ne pas confondre avec ip access-group."],
      ["access-list 100 permit ip 10.0.20.0 0.0.0.255 10.0.30.0 0.0.0.255", "Autoriser Personnel vers DMZ", "Routeur Cisco", "Filtrage TP4", "Règle permit", "Ajouter autres permit avant deny implicite."],
      ["ip access-group 100 in", "Appliquer ACL sur interface", "Routeur Cisco", "Sur interface source", "Trafic filtré", "Vérifier sens in/out."]
    ],
    note: "Placement : une ACL standard se place près de la destination car elle ne voit surtout que la source. Une ACL étendue se place près de la source car elle est précise : source, destination, protocole et parfois port."
  },
  {
    name: "DHCP relay",
    commands: [
      ["interface g0/0.100", "Sous-interface VLAN 100", "Routeur Cisco", "TP5", "Prompt subinterface", "Créer dot1Q 100 ensuite."],
      ["ip helper-address 192.168.150.50", "Relayer DHCP vers serveur", "Routeur Cisco", "Sur g0/0.100 et g0/0.200", "Discover relayé au serveur", "Vérifier IP serveur et route retour."],
      ["interface g0/0.200", "Sous-interface VLAN 200", "Routeur Cisco", "TP5", "Prompt subinterface", "Créer dot1Q 200 ensuite."],
      ["ip helper-address 192.168.150.50", "Même relais pour VLAN 200", "Routeur Cisco", "Après IP passerelle VLAN 200", "Clients VLAN 200 reçoivent un bail", "Vérifier étendue 192.168.200.0/24."]
    ]
  },
  {
    name: "iptables",
    commands: [
      ["sudo sysctl -w net.ipv4.ip_forward=1", "Activer routage IPv4 Linux", "PC-routeur", "Avant NAT", "Valeur = 1", "Rendre permanent si redémarrage."],
      ["sudo iptables -L -n -v", "Afficher table filter", "PC-routeur", "Diagnostic règles", "Chaînes INPUT/OUTPUT/FORWARD", "Regarder compteurs."],
      ["sudo iptables -t nat -L -n -v", "Afficher table nat", "PC-routeur", "Diagnostic NAT", "PREROUTING/POSTROUTING", "Vérifier MASQUERADE."],
      ["sudo iptables -A FORWARD -i interfaceLAN -o interfaceWAN -j ACCEPT", "Autoriser LAN vers WAN", "PC-routeur", "Après forwarding", "Trafic sortant OK", "Remplacer interfaces."],
      ["sudo iptables -A FORWARD -i interfaceWAN -o interfaceLAN -m state --state RELATED,ESTABLISHED -j ACCEPT", "Autoriser les retours", "PC-routeur", "NAT sortant", "Réponses OK", "Vérifier ordre des règles."],
      ["sudo iptables -t nat -A POSTROUTING -o interfaceWAN -j MASQUERADE", "Traduire source en sortie", "PC-routeur", "NAT/PAT", "Source devient WAN", "L'interface -o doit être WAN."]
    ]
  },
  {
    name: "Services Linux",
    commands: [
      ["sudo apt install apache2 vsftpd -y", "Installer HTTP et FTP", "Serveur Linux", "TP2/TP3", "Services disponibles", "Vérifier apt update."],
      ["sudo systemctl status apache2", "État Apache", "Serveur Web", "HTTP échoue", "active/running", "Restart si besoin."],
      ["sudo systemctl status vsftpd", "État FTP", "Serveur FTP", "FTP échoue", "active/running", "Lire logs si failed."],
      ["sudo systemctl restart apache2", "Relancer Apache", "Serveur Web", "Après modification", "Service relancé", "Contrôler status."],
      ["sudo systemctl restart vsftpd", "Relancer vsftpd", "Serveur FTP", "Après modification", "Service relancé", "Contrôler port 21."]
    ]
  },
  {
    name: "Scapy",
    commands: [
      [`from scapy.all import IP, TCP, sr1
pkt = IP(dst="192.168.1.20") / TCP(dport=21, flags="S")
rep = sr1(pkt, timeout=2)`, "Créer un TCP SYN", "PC Linux avec Scapy", "Tester port 21", "Réponse SYN-ACK/RST/rien", "sudo + IP cible correcte."],
      [`if rep and rep.haslayer(TCP) and rep[TCP].flags == 0x12:
    print("port ouvert")
elif rep and rep.haslayer(TCP) and rep[TCP].flags == 0x14:
    print("port fermé")
else:
    print("filtré ou bloqué")`, "Interpréter la réponse", "PC Linux avec Scapy", "Scanner simple", "État du port", "Capturer dans Wireshark pour confirmer."]
    ],
    note: "IP(dst=...) définit la destination, TCP(dport=..., flags=\"S\") construit un SYN, sr1() envoie et attend une réponse, timeout limite l'attente, haslayer(TCP) vérifie la couche, 0x12 indique SYN-ACK et 0x14 RST-ACK."
  }
];

const oralQuestions = [
  ["Pourquoi une adresse link-local IPv6 ne suffit pas pour communiquer entre deux réseaux ?", "Parce qu'elle est limitée au lien local. Les routeurs ne la propagent pas vers un autre réseau."],
  ["Pourquoi faut-il préciser l'interface avec une adresse fe80:: ?", "Parce que plusieurs interfaces peuvent avoir des fe80::. Le suffixe %interface indique le lien à utiliser."],
  ["Quel est le rôle de NDP ?", "Découvrir les voisins, les routeurs, les adresses MAC et remplacer ARP en IPv6."],
  ["Quelle est la différence entre SYN, SYN-ACK et ACK ?", "SYN ouvre, SYN-ACK accepte et acquitte, ACK confirme que la connexion TCP est établie."],
  ["Comment savoir si un port est ouvert avec Scapy ?", "Envoyer un SYN : SYN-ACK signifie ouvert, RST signifie fermé, absence de réponse signifie filtré ou bloqué."],
  ["Pourquoi FTP n'est pas sécurisé ?", "Parce qu'il transmet les commandes, identifiants et mots de passe en clair."],
  ["Quelle est la différence entre NAT et PAT ?", "NAT traduit l'adresse IP ; PAT traduit aussi les ports pour partager une même adresse."],
  ["À quoi sert ip_forward ?", "À autoriser Linux à transférer des paquets entre ses interfaces."],
  ["Pourquoi utilise-t-on MASQUERADE ?", "Pour remplacer l'adresse source privée par l'adresse de l'interface WAN du routeur Linux."],
  ["Quelle est la différence entre une ACL standard et une ACL étendue ?", "Standard filtre surtout la source ; étendue filtre source, destination, protocole et ports."],
  ["Pourquoi le DHCP ne traverse pas un routeur ?", "La demande DHCP initiale est un broadcast, et le routeur ne transmet pas les broadcasts par défaut."],
  ["À quoi sert ip helper-address ?", "À relayer les broadcasts DHCP vers un serveur distant en unicast."],
  ["Pourquoi utiliser un trunk ?", "Pour transporter plusieurs VLAN sur un même lien."],
  ["À quoi sert l'encapsulation dot1Q ?", "À marquer les trames avec leur VLAN sur un trunk ou une sous-interface."],
  ["Comment tester si un VLAN fonctionne ?", "Vérifier show vlan brief, IP/masque/passerelle, puis ping la passerelle du VLAN."],
  ["Comment diagnostiquer un problème de ping ?", "Tester local, IP, masque, passerelle, route, VLAN, trunk, ACL et service cible dans cet ordre."],
  ["Comment savoir si le problème vient du VLAN ?", "show vlan brief doit montrer le port dans le bon VLAN et le client doit recevoir une IP du bon réseau."],
  ["Comment savoir si le problème vient du trunk ?", "show interfaces trunk doit afficher le port trunk et les VLAN autorisés."],
  ["Comment savoir si le problème vient du DHCP ?", "Le client n'a pas de bail correct ; vérifier étendue, service, helper-address et VLAN du port."]
];

const troubleshootingSteps = [
  ["Vérifier le câblage ou la topologie", "Dans Packet Tracer ou en vrai TP, confirme que les câbles vont aux bons ports et que les interfaces sont up."],
  ["Vérifier l'adresse IP", "ip a, ipconfig ou show ip interface brief : l'adresse doit appartenir au bon réseau/VLAN."],
  ["Vérifier le masque", "Un /24 mal saisi peut envoyer le trafic au mauvais endroit ou empêcher la passerelle d'être locale."],
  ["Vérifier la passerelle", "Le client doit pointer vers l'interface routeur de son réseau : .1, .254 ou l'adresse demandée dans le TP."],
  ["Vérifier le VLAN du port", "show vlan brief : le port access doit être dans le VLAN attendu."],
  ["Vérifier le trunk", "show interfaces trunk : le port vers le routeur doit transporter les VLAN nécessaires."],
  ["Vérifier les sous-interfaces du routeur", "show ip interface brief : g0/0.10, g0/0.20, g0/0.100 ou g0/0.200 doivent être up/up avec dot1Q correct."],
  ["Vérifier le DHCP ou le relais DHCP", "Étendues actives, serveur statique, service démarré, ip helper-address sur les sous-interfaces clients."],
  ["Vérifier les ACL", "Ordre des règles, deny implicite, source/destination, protocole, ports et sens in/out."],
  ["Vérifier les services", "Apache2, vsftpd, DHCP : systemctl status ou console Windows Server."],
  ["Utiliser Wireshark ou les commandes show", "icmpv6, tcp.port == 21, DHCP Discover/Offer, show ipv6 neighbors, show ip route, compteurs iptables."]
];

const expressSheets = [
  {
    title: "10 minutes avant l'éval",
    items: ["Relire les passerelles des VLAN et les réseaux du TP5.", "Répéter SYN/SYN-ACK/ACK et SYN-ACK/RST/silence.", "Revoir ip_forward + FORWARD + MASQUERADE.", "Revoir trunk + dot1Q + sous-interfaces.", "Revoir ip helper-address et pourquoi DHCP broadcast bloque."]
  },
  {
    title: "Commandes à connaître par cœur",
    items: ["ip -br a, ip route, ip -6 route", "show vlan brief, show interfaces trunk", "show ip interface brief, show ipv6 route", "iptables -L -n -v, iptables -t nat -L -n -v", "dhclient -r interface puis dhclient interface"]
  },
  {
    title: "Erreurs à éviter",
    items: ["Confondre interface LAN et WAN dans MASQUERADE.", "Oublier %interface avec fe80::.", "Mettre une ACL dans le mauvais sens.", "Oublier no shutdown sur l'interface physique.", "Créer DHCP sans helper-address pour un serveur distant."]
  },
  {
    title: "Définitions à expliquer",
    items: ["NDP : découverte des voisins IPv6.", "Trunk : lien multi-VLAN.", "NAT/PAT : traduction adresse et ports.", "DMZ : zone serveur séparée et filtrée.", "DHCP relay : relais des broadcasts vers serveur distant."]
  },
  {
    title: "Tests systématiques",
    items: ["Ping passerelle avant ping distant.", "Vérifier la route avant de modifier une ACL.", "Regarder show vlan brief avant de toucher au DHCP.", "Capturer Wireshark si le comportement paraît bizarre.", "Lire les compteurs iptables pour voir si une règle matche."]
  }
];

let progress = loadProgress();
let currentRoute = "home";
let currentQuiz = null;
let currentFlash = {};
let currentExam = null;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { understood: {}, visited: {}, quizScores: {} };
  } catch {
    return { understood: {}, visited: {}, quizScores: {} };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  updateProgressUI();
}

function getUnderstandIds() {
  const ids = [];
  tpData.forEach(tp => {
    tp.keyIdeas.forEach((_, index) => ids.push(`${tp.id}-idea-${index}`));
    tp.course.forEach((_, index) => ids.push(`${tp.id}-course-${index}`));
    tp.memo.forEach((_, index) => ids.push(`${tp.id}-memo-${index}`));
  });
  return ids;
}

function updateProgressUI() {
  const ids = getUnderstandIds();
  const done = ids.filter(id => progress.understood[id]).length;
  const percent = ids.length ? Math.round((done / ids.length) * 100) : 0;
  document.getElementById("progress-percent").textContent = `${percent}%`;
  document.getElementById("progress-fill").style.width = `${percent}%`;
  document.getElementById("home-progress-fill").style.width = `${percent}%`;
  document.getElementById("home-progress-text").textContent = `${done} notion${done > 1 ? "s" : ""} comprise${done > 1 ? "s" : ""}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listHtml(items) {
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function codeBlock(code) {
  return `<div class="code-block"><button class="copy-button" type="button" data-copy="${escapeHtml(code)}">Copier</button><pre><code>${escapeHtml(code)}</code></pre></div>`;
}

function renderHome() {
  document.getElementById("tp-cards").innerHTML = tpData.map(tp => `
    <article class="tp-card" style="--accent:${tp.accent}">
      <div class="tp-index">${tp.number.replace("TP", "")}</div>
      <h3>${escapeHtml(tp.title)}</h3>
      <p>${escapeHtml(tp.summary)}</p>
      <strong>Notions clés</strong>
      ${listHtml(tp.keyIdeas.slice(0, 4))}
      <a class="primary-button" href="#${tp.id}" data-route="${tp.id}">Réviser ce TP</a>
    </article>
  `).join("");

  document.getElementById("must-know-list").innerHTML = mustKnow.map(card => `
    <article class="must-card">
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.text)}</p>
      ${listHtml(card.items)}
    </article>
  `).join("");
}

function renderTopology(tp) {
  return `
    <div class="topology">
      <p>${escapeHtml(tp.topology.description)}</p>
      <div class="topology-row">
        ${tp.topology.nodes.map((node, index) => `
          ${index ? `<span class="link-line" aria-hidden="true"></span>` : ""}
          <div class="node"><strong>${escapeHtml(node.label)}</strong><span>${node.detail}</span></div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderMarkItems(tp, title, items, type) {
  return `
    <div class="mark-list">
      ${items.map((item, index) => {
        const id = `${tp.id}-${type}-${index}`;
        const text = typeof item === "string" ? item : item.title;
        const body = typeof item === "string" ? "" : item.body;
        return `
          <div class="mark-item">
            <button class="understood-button ${progress.understood[id] ? "done" : ""}" type="button" data-understand="${id}" aria-label="Marquer compris">${progress.understood[id] ? "✓" : ""}</button>
            <div>
              <strong>${escapeHtml(text)}</strong>
              ${body ? `<p>${escapeHtml(body)}</p>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCommandCard(command) {
  return `
    <article class="command-card">
      <h4>${escapeHtml(command.title || command[1])}</h4>
      ${codeBlock(command.cmd || command[0])}
      <div class="command-meta">
        <span><strong>Machine :</strong> ${escapeHtml(command.machine || command[2])}</span>
        <span><strong>Moment :</strong> ${escapeHtml(command.when || command[3])}</span>
        <span><strong>Résultat :</strong> ${escapeHtml(command.expected || command[4])}</span>
        <span><strong>Si ça bloque :</strong> ${escapeHtml(command.fix || command[5])}</span>
      </div>
      ${command.explain ? `<details class="accordion"><summary>Explication ligne par ligne</summary><div class="accordion-content">${listHtml(command.explain)}</div></details>` : ""}
    </article>
  `;
}

function renderTP(tpId) {
  const tp = tpData.find(item => item.id === tpId) || tpData[0];
  progress.visited[tp.id] = true;
  saveProgress();

  document.getElementById("tp-page").innerHTML = `
    <div class="tp-layout">
      <div class="tp-main">
        <header class="tp-hero" style="border-color:${tp.accent}55">
          <p class="section-label">${escapeHtml(tp.number)} · ${escapeHtml(tp.short)}</p>
          <h1>${escapeHtml(tp.title)}</h1>
          <p>${escapeHtml(tp.summary)}</p>
          <div class="tag-list">${tp.keyIdeas.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="tp-nav">
            <a class="secondary-button" href="#${previousTp(tp.id).id}" data-route="${previousTp(tp.id).id}">TP précédent</a>
            <a class="secondary-button" href="#${nextTp(tp.id).id}" data-route="${nextTp(tp.id).id}">TP suivant</a>
            <a class="primary-button" href="#commands" data-route="commands">Commandes</a>
          </div>
        </header>

        <div class="section-stack">
          <section class="panel">
            <div class="panel-header"><h2>Objectifs du TP</h2></div>
            ${listHtml(tp.objectives)}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Topologie expliquée</h2></div>
            ${renderTopology(tp)}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Notions de cours</h2></div>
            ${tp.course.map((course, index) => `
              <details class="accordion" open>
                <summary>${escapeHtml(course.title)}</summary>
                <div class="accordion-content">
                  <p>${escapeHtml(course.body)}</p>
                  ${listHtml(course.bullets)}
                  ${renderMarkItems(tp, course.title, [course], `course-${index}-inline`).replaceAll(`${tp.id}-course-${index}-inline-0`, `${tp.id}-course-${index}`)}
                </div>
              </details>
            `).join("")}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Commandes importantes du TP</h2></div>
            <div class="command-grid">${tp.commands.map(renderCommandCard).join("")}</div>
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Méthode étape par étape</h2></div>
            <div class="steps-list">${tp.steps.map(step => `<div class="step-card">${escapeHtml(step)}</div>`).join("")}</div>
          </section>

          <section class="panel">
            <div class="panel-header"><h2>À observer dans Wireshark ou Packet Tracer</h2></div>
            ${listHtml(tp.observe)}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Questions probables du prof</h2></div>
            <div class="qa-grid">${tp.oral.map(item => `<article class="qa-card"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></article>`).join("")}</div>
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Erreurs fréquentes et solutions</h2></div>
            ${tp.errors.map(item => `<details class="accordion"><summary>${escapeHtml(item.issue)}</summary><div class="accordion-content"><p>${escapeHtml(item.solution)}</p></div></details>`).join("")}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Exercices pratiques</h2></div>
            ${listHtml(tp.exercises)}
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Fiche mémo à retenir</h2></div>
            ${renderMarkItems(tp, "Mémo", tp.memo, "memo")}
          </section>
        </div>
      </div>

      <aside class="tp-aside">
        <section class="panel">
          <h2>Notions comprises</h2>
          ${renderMarkItems(tp, "Notions", tp.keyIdeas, "idea")}
        </section>
        <section class="panel">
          <h2>Mini quiz</h2>
          <div id="quiz-box" class="quiz-box"></div>
        </section>
        <section class="panel">
          <h2>Flashcards</h2>
          <div id="flashcard-box" class="flashcard-box"></div>
        </section>
      </aside>
    </div>
  `;

  startQuiz(tp.id);
  currentFlash = { tpId: tp.id, index: 0, flipped: false };
  renderFlashcard();
}

function previousTp(tpId) {
  const index = tpData.findIndex(tp => tp.id === tpId);
  return tpData[(index - 1 + tpData.length) % tpData.length];
}

function nextTp(tpId) {
  const index = tpData.findIndex(tp => tp.id === tpId);
  return tpData[(index + 1) % tpData.length];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function startQuiz(tpId) {
  const tp = tpData.find(item => item.id === tpId);
  currentQuiz = { tpId, questions: shuffle(tp.quiz).slice(0, 3), index: 0, score: 0, answered: false };
  renderQuiz();
}

function renderQuiz() {
  const box = document.getElementById("quiz-box");
  if (!box || !currentQuiz) return;
  const question = currentQuiz.questions[currentQuiz.index];
  const finished = currentQuiz.index >= currentQuiz.questions.length;

  if (finished) {
    progress.quizScores[currentQuiz.tpId] = Math.max(progress.quizScores[currentQuiz.tpId] || 0, currentQuiz.score);
    saveProgress();
    box.innerHTML = `
      <p><strong>Score :</strong> ${currentQuiz.score}/${currentQuiz.questions.length}</p>
      <p>${currentQuiz.score === currentQuiz.questions.length ? "Solide. Tu peux expliquer sans réciter." : "Reprends les erreurs puis relance un quiz."}</p>
      <button class="exam-action" type="button" data-action="restart-quiz">Relancer</button>
    `;
    return;
  }

  box.innerHTML = `
    <p><strong>Question ${currentQuiz.index + 1}/${currentQuiz.questions.length}</strong></p>
    <h3>${escapeHtml(question.q)}</h3>
    <div class="quiz-options">
      ${question.choices.map((choice, index) => `<button class="quiz-option" type="button" data-quiz-option="${index}">${escapeHtml(choice)}</button>`).join("")}
    </div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <div class="quiz-actions">
      <button class="exam-action" type="button" data-action="next-quiz">Question suivante</button>
      <button class="ghost-button" type="button" data-action="restart-quiz">Mélanger</button>
    </div>
  `;
}

function answerQuiz(optionIndex) {
  if (!currentQuiz || currentQuiz.answered) return;
  const question = currentQuiz.questions[currentQuiz.index];
  currentQuiz.answered = true;
  const buttons = document.querySelectorAll("[data-quiz-option]");
  buttons.forEach(button => {
    const index = Number(button.dataset.quizOption);
    if (index === question.answer) button.classList.add("correct");
    if (index === optionIndex && optionIndex !== question.answer) button.classList.add("wrong");
  });
  if (optionIndex === question.answer) currentQuiz.score += 1;
  document.getElementById("quiz-feedback").textContent = `${optionIndex === question.answer ? "Correct." : "Pas exactement."} ${question.why}`;
}

function nextQuizQuestion() {
  if (!currentQuiz) return;
  if (!currentQuiz.answered) {
    showToast("Choisis une réponse avant de passer.");
    return;
  }
  currentQuiz.index += 1;
  currentQuiz.answered = false;
  renderQuiz();
}

function renderFlashcard() {
  const box = document.getElementById("flashcard-box");
  if (!box || !currentFlash.tpId) return;
  const tp = tpData.find(item => item.id === currentFlash.tpId);
  const card = tp.flashcards[currentFlash.index];
  box.innerHTML = `
    <button class="flashcard" type="button" data-action="flip-card">${escapeHtml(currentFlash.flipped ? card.back : card.front)}</button>
    <div class="flash-actions">
      <button class="ghost-button" type="button" data-action="prev-card">Précédente</button>
      <button class="ghost-button" type="button" data-action="next-card">Suivante</button>
    </div>
  `;
}

function moveFlashcard(direction) {
  const tp = tpData.find(item => item.id === currentFlash.tpId);
  currentFlash.index = (currentFlash.index + direction + tp.flashcards.length) % tp.flashcards.length;
  currentFlash.flipped = false;
  renderFlashcard();
}

function renderCommandReference(filter = "") {
  const query = filter.trim().toLowerCase();
  const html = commandCategories.map(category => {
    const commands = category.commands.filter(command => {
      const haystack = command.join(" ").toLowerCase();
      return !query || haystack.includes(query) || category.name.toLowerCase().includes(query);
    });
    if (!commands.length) return "";
    return `
      <section class="command-category">
        <div>
          <h2>${escapeHtml(category.name)}</h2>
          ${category.note ? `<p>${escapeHtml(category.note)}</p>` : ""}
        </div>
        <div class="command-grid">${commands.map(command => renderCommandCard(command)).join("")}</div>
      </section>
    `;
  }).join("");

  document.getElementById("command-reference").innerHTML = html || `<p>Aucune commande trouvée.</p>`;
}

function renderOral() {
  document.getElementById("oral-list").innerHTML = oralQuestions.map(([q, a]) => `
    <article class="qa-card">
      <h3>${escapeHtml(q)}</h3>
      <p>${escapeHtml(a)}</p>
    </article>
  `).join("");
}

function renderTroubleshooting() {
  document.getElementById("troubleshooting-steps").innerHTML = troubleshootingSteps.map(([title, text], index) => `
    <article class="timeline-step">
      <span class="step-number">${index + 1}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </article>
  `).join("");
}

function getAllExamSituations() {
  return tpData.flatMap(tp => tp.exam.map(item => ({ ...item, tp: tp.title })));
}

function pickExam() {
  const all = getAllExamSituations();
  currentExam = all[Math.floor(Math.random() * all.length)];
  renderExam(false);
}

function renderExam(showCorrection = false) {
  const box = document.getElementById("exam-mode");
  if (!currentExam) {
    pickExam();
    return;
  }
  box.innerHTML = `
    <div class="exam-situation">
      <p class="section-label">${escapeHtml(currentExam.tp)}</p>
      <h2>${escapeHtml(currentExam.title)}</h2>
      <p>${escapeHtml(currentExam.situation)}</p>
    </div>
    <div class="exam-actions">
      <button class="primary-button" type="button" data-action="show-exam-correction">Afficher la correction</button>
      <button class="ghost-button" type="button" data-action="new-exam">Nouvelle situation</button>
    </div>
    <div class="exam-situation ${showCorrection ? "" : "hidden"}" id="exam-correction">
      <h3>Correction attendue</h3>
      <p>${escapeHtml(currentExam.correction)}</p>
    </div>
  `;
}

function renderExpress() {
  document.getElementById("express-list").innerHTML = expressSheets.map(sheet => `
    <article class="express-card">
      <h3>${escapeHtml(sheet.title)}</h3>
      ${listHtml(sheet.items)}
    </article>
  `).join("");
}

function buildSearchIndex() {
  const entries = [];
  tpData.forEach(tp => {
    entries.push({ type: "TP", title: tp.title, text: `${tp.summary} ${tp.keyIdeas.join(" ")}`, route: tp.id });
    tp.course.forEach(course => entries.push({ type: "Cours", title: `${tp.number} · ${course.title}`, text: `${course.body} ${course.bullets.join(" ")}`, route: tp.id }));
    tp.commands.forEach(command => entries.push({ type: "Commande", title: `${tp.number} · ${command.title}`, text: `${command.cmd} ${command.machine} ${command.when} ${command.expected} ${command.fix}`, route: tp.id }));
    tp.errors.forEach(error => entries.push({ type: "Erreur", title: `${tp.number} · ${error.issue}`, text: error.solution, route: tp.id }));
  });
  commandCategories.forEach(category => {
    category.commands.forEach(command => entries.push({ type: "Commande", title: `${category.name} · ${command[0]}`, text: command.join(" "), route: "commands" }));
  });
  oralQuestions.forEach(([q, a]) => entries.push({ type: "Oral", title: q, text: a, route: "oral" }));
  troubleshootingSteps.forEach(([title, text]) => entries.push({ type: "Dépannage", title, text, route: "troubleshooting" }));
  return entries;
}

function renderSearch(query) {
  const q = query.trim().toLowerCase();
  const results = buildSearchIndex().filter(entry => `${entry.title} ${entry.text}`.toLowerCase().includes(q)).slice(0, 30);
  document.getElementById("search-count").textContent = `${results.length} résultat${results.length > 1 ? "s" : ""} pour "${query}"`;
  document.getElementById("results-list").innerHTML = results.map(entry => `
    <article class="result-card">
      <p class="section-label">${escapeHtml(entry.type)}</p>
      <h3>${highlight(entry.title, q)}</h3>
      <p>${highlight(entry.text.slice(0, 220), q)}${entry.text.length > 220 ? "..." : ""}</p>
      <a class="secondary-button" href="#${entry.route}" data-route="${entry.route}">Ouvrir</a>
    </article>
  `).join("") || `<p>Aucun résultat.</p>`;
  showSection("search-results");
}

function highlight(text, query) {
  const escaped = escapeHtml(text);
  if (!query) return escaped;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${safe})`, "ig"), "<mark>$1</mark>");
}

function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active"));
  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveNav(route) {
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.classList.toggle("active", link.dataset.route === route);
  });
}

function navigate(route) {
  currentRoute = route || "home";
  document.body.classList.remove("menu-open");
  document.getElementById("global-search").value = "";

  if (tpData.some(tp => tp.id === currentRoute)) {
    renderTP(currentRoute);
    showSection("tp-page");
  } else {
    showSection(currentRoute);
    if (currentRoute === "commands") renderCommandReference(document.getElementById("command-search").value || "");
    if (currentRoute === "exam" && !currentExam) pickExam();
  }
  setActiveNav(currentRoute);
}

function routeFromHash() {
  const route = location.hash.replace("#", "") || "home";
  navigate(route);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast("Commande copiée."));
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showToast("Commande copiée.");
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") document.body.classList.add("light");
  document.getElementById("theme-icon").textContent = document.body.classList.contains("light") ? "☀" : "☾";
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  localStorage.setItem(THEME_KEY, light ? "light" : "dark");
  document.getElementById("theme-icon").textContent = light ? "☀" : "☾";
}

function bindEvents() {
  window.addEventListener("hashchange", routeFromHash);

  document.addEventListener("click", event => {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink) {
      const route = routeLink.dataset.route;
      if (location.hash !== `#${route}`) location.hash = route;
      else navigate(route);
    }

    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) copyText(copyButton.dataset.copy);

    const understood = event.target.closest("[data-understand]");
    if (understood) {
      const id = understood.dataset.understand;
      progress.understood[id] = !progress.understood[id];
      understood.classList.toggle("done", progress.understood[id]);
      understood.textContent = progress.understood[id] ? "✓" : "";
      saveProgress();
    }

    const quizOption = event.target.closest("[data-quiz-option]");
    if (quizOption) answerQuiz(Number(quizOption.dataset.quizOption));

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "next-quiz") nextQuizQuestion();
    if (action === "restart-quiz" && currentQuiz) startQuiz(currentQuiz.tpId);
    if (action === "flip-card") {
      currentFlash.flipped = !currentFlash.flipped;
      renderFlashcard();
    }
    if (action === "next-card") moveFlashcard(1);
    if (action === "prev-card") moveFlashcard(-1);
    if (action === "new-exam") pickExam();
    if (action === "show-exam-correction") renderExam(true);
  });

  document.getElementById("global-search").addEventListener("input", event => {
    const query = event.target.value.trim();
    if (query.length >= 2) renderSearch(query);
    if (!query) navigate(currentRoute);
  });

  document.getElementById("command-search").addEventListener("input", event => {
    renderCommandReference(event.target.value);
  });

  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

  document.getElementById("reset-progress").addEventListener("click", () => {
    progress = { understood: {}, visited: {}, quizScores: {} };
    saveProgress();
    navigate(currentRoute);
    showToast("Progression réinitialisée.");
  });
}

function init() {
  initTheme();
  renderHome();
  renderCommandReference();
  renderOral();
  renderTroubleshooting();
  renderExpress();
  bindEvents();
  updateProgressUI();
  routeFromHash();
}

init();
