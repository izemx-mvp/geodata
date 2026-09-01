import type {
  Affaire,
  AppelOffre,
  ChecklistItem,
  Client,
  Commande,
  CommandeInterne,
  DataState,
  Devis,
  DocFile,
  Notification,
  Opportunite,
  ReferenceProjet,
  Rejet,
  Service,
  SocialPost,
  Tache,
  User,
} from "./types";

const doc = (id: string, nom: string, type: string, taille: string, date: string): DocFile => ({
  id,
  nom,
  type,
  taille,
  date,
});

export const users: User[] = [
  { id: "u1", nom: "Nadia El Fassi", role: "ADMINISTRATION", initiales: "NE", email: "n.elfassi@geodata.ma" },
  { id: "u2", nom: "Rachid Bennani", role: "DIRECTION", initiales: "RB", email: "r.bennani@geodata.ma" },
  { id: "u3", nom: "Sara Benali", role: "COMMERCIAL", initiales: "SB", email: "s.benali@geodata.ma" },
  { id: "u4", nom: "Imane Tazi", role: "COMMERCIAL", initiales: "IT", email: "i.tazi@geodata.ma" },
  { id: "u5", nom: "Othmane Sbai", role: "MARKETING", initiales: "OS", email: "o.sbai@geodata.ma" },
  { id: "u6", nom: "Meryem Chraibi", role: "RESPONSABLE_AO", initiales: "MC", email: "m.chraibi@geodata.ma" },
  { id: "u7", nom: "Karim Alaoui", role: "CHEF_DE_PROJET", initiales: "KA", email: "k.alaoui@geodata.ma", specialite: "Topographie / LIDAR", chargePct: 82 },
  { id: "u8", nom: "Salma Bouhlal", role: "CHEF_DE_PROJET", initiales: "SB", email: "s.bouhlal@geodata.ma", specialite: "SIG / Cartographie", chargePct: 64 },
  { id: "u9", nom: "Hamza Ouazzani", role: "CHEF_DE_PROJET", initiales: "HO", email: "h.ouazzani@geodata.ma", specialite: "Photogrammétrie", chargePct: 71 },
  { id: "u10", nom: "Leila Mansouri", role: "CHEF_DE_PROJET", initiales: "LM", email: "l.mansouri@geodata.ma", specialite: "BIM / 3D", chargePct: 55 },
  { id: "u11", nom: "Ahmed Rifai", role: "TECHNICIEN", initiales: "AR", email: "a.rifai@geodata.ma", specialite: "Topographe GPS", chargePct: 90 },
  { id: "u12", nom: "Yassine Kabbaj", role: "TECHNICIEN", initiales: "YK", email: "y.kabbaj@geodata.ma", specialite: "Scanner 3D", chargePct: 76 },
  { id: "u13", nom: "Salma Idrissi", role: "TECHNICIEN", initiales: "SI", email: "s.idrissi@geodata.ma", specialite: "Traitement données", chargePct: 68 },
  { id: "u14", nom: "Hamza Berrada", role: "TECHNICIEN", initiales: "HB", email: "h.berrada@geodata.ma", specialite: "DAO / Plans", chargePct: 58 },
  { id: "u15", nom: "Zineb Naciri", role: "TECHNICIEN", initiales: "ZN", email: "z.naciri@geodata.ma", specialite: "SIG", chargePct: 47 },
  { id: "u16", nom: "Mehdi Lahlou", role: "TECHNICIEN", initiales: "ML", email: "m.lahlou@geodata.ma", specialite: "Drone / Photogrammétrie", chargePct: 83 },
  { id: "u17", nom: "Anas Cherkaoui", role: "TECHNICIEN", initiales: "AC", email: "a.cherkaoui@geodata.ma", specialite: "Mobile Mapping", chargePct: 61 },
  { id: "u18", nom: "Kenza Moujahid", role: "TECHNICIEN", initiales: "KM", email: "k.moujahid@geodata.ma", specialite: "Contrôle qualité", chargePct: 39 },
];

export const clients: Client[] = [
  { id: "c1", nom: "Groupe Atlas Industrie", secteur: "Industrie", ville: "Casablanca", contact: "Youssef Amrani", fonction: "Directeur Technique", email: "y.amrani@atlas-industrie.ma", telephone: "+212 522 44 18 90", type: "Privé", ca: 1250000 },
  { id: "c2", nom: "Agence d'Aménagement Bouregreg (démo)", secteur: "Aménagement", ville: "Rabat", contact: "Fatima Zahra Idrissi", fonction: "Chef de division SIG", email: "fz.idrissi@demo.ma", telephone: "+212 537 26 11 04", type: "Public", ca: 3400000 },
  { id: "c3", nom: "Commune Urbaine Témara (démo)", secteur: "Collectivité", ville: "Témara", contact: "Abdellah Sekkat", fonction: "Chef service technique", email: "a.sekkat@demo.ma", telephone: "+212 537 74 55 12", type: "Public", ca: 780000 },
  { id: "c4", nom: "OCP Développement (démo)", secteur: "Mines", ville: "Khouribga", contact: "Hicham Belkhayat", fonction: "Responsable projets", email: "h.belkhayat@demo.ma", telephone: "+212 523 49 77 30", type: "Semi-public", ca: 2900000 },
  { id: "c5", nom: "Société Marocaine des Autoroutes (démo)", secteur: "Infrastructure", ville: "Rabat", contact: "Nawal Bekkali", fonction: "Ingénieure d'études", email: "n.bekkali@demo.ma", telephone: "+212 537 71 22 88", type: "Public", ca: 4100000 },
  { id: "c6", nom: "Promoteur Résidences Anfa (démo)", secteur: "Immobilier", ville: "Casablanca", contact: "Omar Filali", fonction: "Directeur Général", email: "o.filali@demo.ma", telephone: "+212 522 95 03 41", type: "Privé", ca: 660000 },
  { id: "c7", nom: "ONEE – Branche Eau (démo)", secteur: "Énergie / Eau", ville: "Rabat", contact: "Souad Bennis", fonction: "Chef de projet réseaux", email: "s.bennis@demo.ma", telephone: "+212 537 66 44 21", type: "Public", ca: 1830000 },
  { id: "c8", nom: "Cimenterie Souss (démo)", secteur: "Industrie", ville: "Agadir", contact: "Rachid Ait Baha", fonction: "Responsable HSE", email: "r.aitbaha@demo.ma", telephone: "+212 528 33 90 17", type: "Privé", ca: 540000 },
  { id: "c9", nom: "Agence Urbaine de Marrakech (démo)", secteur: "Urbanisme", ville: "Marrakech", contact: "Khalid Ouhbi", fonction: "Directeur SIG", email: "k.ouhbi@demo.ma", telephone: "+212 524 43 12 76", type: "Public", ca: 1120000 },
  { id: "c10", nom: "Port Tanger Med Logistique (démo)", secteur: "Logistique", ville: "Tanger", contact: "Ilham Rahmouni", fonction: "Ingénieure infrastructures", email: "i.rahmouni@demo.ma", telephone: "+212 539 33 70 55", type: "Semi-public", ca: 2260000 },
  { id: "c11", nom: "Groupe Agricole Doukkala (démo)", secteur: "Agriculture", ville: "El Jadida", contact: "Mustapha Znaidi", fonction: "Gérant", email: "m.znaidi@demo.ma", telephone: "+212 523 34 08 62", type: "Privé", ca: 320000 },
  { id: "c12", nom: "Direction Régionale Équipement Fès (démo)", secteur: "Équipement", ville: "Fès", contact: "Amina Sqalli", fonction: "Ingénieure principale", email: "a.sqalli@demo.ma", telephone: "+212 535 62 41 09", type: "Public", ca: 1490000 },
];

const oppSeeds: Array<Partial<Opportunite> & { titre: string; clientId: string; stage: Opportunite["stage"] }> = [
  { titre: "Consultation – Relevé topographique Site Industriel", clientId: "c1", stage: "Devis à préparer", type: "Consultation restreinte", service: "Topographie", serviceSecondaire: "LIDAR / Scanner 3D", localisation: "Casablanca", surface: "38 500 m²", delaiDemande: "3 semaines", montantEstime: 100000, budgetFourchette: "80 000 – 120 000 MAD", responsableId: "u3", scoreIA: 94, prochaineAction: "Demander les informations manquantes", echeance: "2026-09-04" },
  { titre: "Mise à jour du plan cadastral communal", clientId: "c3", stage: "Qualifié", type: "Demande directe", service: "Cartographie", localisation: "Témara", surface: "210 ha", montantEstime: 240000, responsableId: "u4", scoreIA: 81, prochaineAction: "Planifier visite technique", echeance: "2026-09-08" },
  { titre: "Scan 3D usine – état des lieux BIM", clientId: "c8", stage: "Devis envoyé", type: "Demande de devis", service: "BIM", serviceSecondaire: "LIDAR / Scanner 3D", localisation: "Agadir", montantEstime: 178000, responsableId: "u3", scoreIA: 88, prochaineAction: "Relance J+5", echeance: "2026-09-02" },
  { titre: "Mobile Mapping voirie urbaine – 120 km", clientId: "c9", stage: "Devis en validation", type: "Consultation restreinte", service: "Mobile Mapping", localisation: "Marrakech", montantEstime: 640000, responsableId: "u4", scoreIA: 91, prochaineAction: "Validation direction", echeance: "2026-09-03" },
  { titre: "Levé bathymétrique et topographique portuaire", clientId: "c10", stage: "À qualifier", type: "Réseau / partenaire", service: "Topographie", localisation: "Tanger", montantEstime: 410000, responsableId: "u3", scoreIA: 72, prochaineAction: "Premier contact technique", echeance: "2026-09-05" },
  { titre: "SIG réseaux d'eau potable – structuration base", clientId: "c7", stage: "Devis à préparer", type: "Demande de devis", service: "SIG", localisation: "Rabat", montantEstime: 520000, responsableId: "u4", scoreIA: 89, prochaineAction: "Chiffrer la charge SIG", echeance: "2026-09-06" },
  { titre: "Photogrammétrie drone – carrière", clientId: "c4", stage: "Relance", type: "Client existant", service: "Photogrammétrie", localisation: "Khouribga", montantEstime: 195000, responsableId: "u3", scoreIA: 84, prochaineAction: "Relancer M. Belkhayat", echeance: "2026-09-01" },
  { titre: "Bornage et morcellement lotissement", clientId: "c6", stage: "Gagné", type: "Recommandation", service: "Ingénierie foncière", localisation: "Casablanca", montantEstime: 132000, responsableId: "u4", scoreIA: 79, prochaineAction: "Lancer le projet", echeance: "2026-09-01" },
  { titre: "Auscultation d'ouvrage – métrologie de précision", clientId: "c5", stage: "À qualifier", type: "Demande directe", service: "Métrologie", localisation: "Rabat – Salé", montantEstime: 288000, responsableId: "u3", scoreIA: 68, prochaineAction: "Qualifier le besoin de précision", echeance: "2026-09-09" },
  { titre: "Plan topographique parcelles agricoles 400 ha", clientId: "c11", stage: "Devis envoyé", type: "Demande de devis", service: "Topographie", localisation: "El Jadida", montantEstime: 96000, responsableId: "u4", scoreIA: 74, prochaineAction: "Relance téléphonique", echeance: "2026-09-07" },
  { titre: "Étude technique – tracé de déviation routière", clientId: "c12", stage: "Qualifié", type: "Consultation restreinte", service: "Étude technique", localisation: "Fès", montantEstime: 750000, responsableId: "u3", scoreIA: 86, prochaineAction: "Constituer l'équipe d'étude", echeance: "2026-09-11" },
  { titre: "Numérisation et géoréférencement d'archives plans", clientId: "c2", stage: "À qualifier", type: "Client existant", service: "SIG", localisation: "Rabat", montantEstime: 145000, responsableId: "u4", scoreIA: 63, prochaineAction: "Cadrer le volume d'archives", echeance: "2026-09-12" },
  { titre: "Modélisation BIM d'un bâtiment patrimonial", clientId: "c9", stage: "Perdu", type: "Demande de devis", service: "BIM", localisation: "Marrakech", montantEstime: 310000, responsableId: "u3", scoreIA: 58, prochaineAction: "Archiver – budget client insuffisant", echeance: "2026-08-25" },
  { titre: "Levé LIDAR terrestre tunnel technique", clientId: "c5", stage: "À qualifier", type: "Réseau / partenaire", service: "LIDAR / Scanner 3D", localisation: "Casablanca", montantEstime: 220000, responsableId: "u4", scoreIA: 77, prochaineAction: "Vérifier conditions d'accès", echeance: "2026-09-10" },
  { titre: "Cartographie thématique risques d'inondation", clientId: "c2", stage: "Devis à préparer", type: "Consultation restreinte", service: "Cartographie", localisation: "Rabat – Bouregreg", montantEstime: 385000, responsableId: "u3", scoreIA: 90, prochaineAction: "Préparer devis multi-lots", echeance: "2026-09-05" },
];

export const opportunites: Opportunite[] = oppSeeds.map((o, i) => ({
  id: `o${i + 1}`,
  reference: `OPP-2026-${String(101 + i)}`,
  titre: o.titre,
  clientId: o.clientId,
  contact: clients.find((c) => c.id === o.clientId)!.contact,
  type: o.type ?? "Demande de devis",
  service: (o.service ?? "Topographie") as Service,
  ...(o.serviceSecondaire ? { serviceSecondaire: o.serviceSecondaire } : {}),
  localisation: o.localisation ?? "Casablanca",
  ...(o.surface ? { surface: o.surface } : {}),
  ...(o.delaiDemande ? { delaiDemande: o.delaiDemande } : {}),
  montantEstime: o.montantEstime ?? 100000,
  ...(o.budgetFourchette ? { budgetFourchette: o.budgetFourchette } : {}),
  responsableId: o.responsableId ?? "u3",
  stage: o.stage,
  prochaineAction: o.prochaineAction ?? "À définir",
  echeance: o.echeance ?? "2026-09-15",
  scoreIA: o.scoreIA ?? 70,
  besoin:
    i === 0
      ? "Relevé topographique et modélisation 3D d'un site industriel en exploitation, incluant les réseaux enterrés visibles et les ouvrages techniques."
      : `Besoin exprimé : ${o.titre.toLowerCase()} pour le compte de ${clients.find((c) => c.id === o.clientId)!.nom}.`,
  infosDisponibles: i === 0 ? ["Plans PDF", "Localisation", "Surface", "Délai"] : ["Localisation", "Service demandé"],
  infosManquantes:
    i === 0
      ? ["Niveau de précision attendu", "Format de livraison", "Conditions d'accès au site"]
      : ["Budget confirmé", "Délai souhaité"],
  recommandationIA:
    i === 0
      ? "Demander au client les trois informations manquantes avant préparation du devis."
      : "Qualifier le besoin par un échange technique avant chiffrage.",
  documents:
    i === 0
      ? [doc("d1", "plan_masse_site.pdf", "PDF", "3,2 Mo", "2026-08-28"), doc("d2", "cahier_des_charges.pdf", "PDF", "780 Ko", "2026-08-28")]
      : [],
  interactions: [
    { id: `it${i}a`, date: "2026-08-27", canal: "Email", auteur: "Client", contenu: "Réception de la demande initiale." },
    { id: `it${i}b`, date: "2026-08-28", canal: "Système", auteur: "Agent IA Commercial", contenu: "Opportunité créée et qualifiée automatiquement." },
  ],
  createdAt: "2026-08-27",
}));

export const devis: Devis[] = [
  {
    id: "dv1",
    reference: "DEV-2026-041",
    opportuniteId: "o1",
    clientId: "c1",
    objet: "Relevé topographique et scan 3D – Site industriel Casablanca",
    lignes: [
      { id: "l1", designation: "Mission terrain", unite: "jour", quantite: 3, prixUnitaire: 4800 },
      { id: "l2", designation: "Scanner 3D", unite: "jour", quantite: 2, prixUnitaire: 7500 },
      { id: "l3", designation: "Ingénieur topographe", unite: "jour", quantite: 4, prixUnitaire: 3800 },
      { id: "l4", designation: "Techniciens", unite: "journée", quantite: 6, prixUnitaire: 1600 },
      { id: "l5", designation: "Traitement des données", unite: "jour", quantite: 5, prixUnitaire: 3200 },
      { id: "l6", designation: "Production des plans", unite: "jour", quantite: 2, prixUnitaire: 2900 },
    ],
    delaiSemaines: 3,
    statut: "Brouillon",
    dateCreation: "2026-08-30",
    responsableId: "u3",
    conditions: "Paiement 30% à la commande, solde à la livraison. Validité 30 jours.",
  },
  { id: "dv2", reference: "DEV-2026-038", opportuniteId: "o3", clientId: "c8", objet: "Scan 3D usine – nuage de points et maquette BIM LOD200", lignes: [ { id: "l1", designation: "Scanner 3D", unite: "jour", quantite: 4, prixUnitaire: 7500 }, { id: "l2", designation: "Modélisation BIM", unite: "jour", quantite: 12, prixUnitaire: 4200 } ], delaiSemaines: 6, statut: "Envoyé", dateCreation: "2026-08-20", dateEnvoi: "2026-08-27", responsableId: "u3", conditions: "Validité 45 jours." },
  { id: "dv3", reference: "DEV-2026-036", opportuniteId: "o4", clientId: "c9", objet: "Mobile Mapping voirie – 120 km linéaires", lignes: [ { id: "l1", designation: "Acquisition Mobile Mapping", unite: "km", quantite: 120, prixUnitaire: 2400 }, { id: "l2", designation: "Post-traitement et extraction", unite: "jour", quantite: 22, prixUnitaire: 3600 } ], delaiSemaines: 10, statut: "En validation", dateCreation: "2026-08-24", responsableId: "u4", conditions: "Validité 60 jours." },
  { id: "dv4", reference: "DEV-2026-034", opportuniteId: "o6", clientId: "c7", objet: "Structuration base SIG réseaux eau potable", lignes: [ { id: "l1", designation: "Analyse et modèle de données", unite: "jour", quantite: 8, prixUnitaire: 4400 }, { id: "l2", designation: "Intégration et contrôle", unite: "jour", quantite: 30, prixUnitaire: 3100 } ], delaiSemaines: 12, statut: "Brouillon", dateCreation: "2026-08-29", responsableId: "u4", conditions: "Validité 30 jours." },
  { id: "dv5", reference: "DEV-2026-031", opportuniteId: "o7", clientId: "c4", objet: "Photogrammétrie drone – suivi de carrière trimestriel", lignes: [ { id: "l1", designation: "Vol drone et acquisition", unite: "vol", quantite: 4, prixUnitaire: 12500 }, { id: "l2", designation: "Calcul de cubatures", unite: "jour", quantite: 8, prixUnitaire: 3400 } ], delaiSemaines: 4, statut: "Envoyé", dateCreation: "2026-08-12", dateEnvoi: "2026-08-27", responsableId: "u3", conditions: "Contrat cadre annuel possible." },
  { id: "dv6", reference: "DEV-2026-029", opportuniteId: "o8", clientId: "c6", objet: "Bornage et morcellement – lotissement Anfa", lignes: [ { id: "l1", designation: "Travaux de bornage", unite: "lot", quantite: 24, prixUnitaire: 3600 }, { id: "l2", designation: "Dossier technique foncier", unite: "forfait", quantite: 1, prixUnitaire: 45600 } ], delaiSemaines: 5, statut: "Accepté", dateCreation: "2026-08-05", dateEnvoi: "2026-08-07", responsableId: "u4", conditions: "Accepté le 26/08/2026." },
  { id: "dv7", reference: "DEV-2026-027", opportuniteId: "o10", clientId: "c11", objet: "Plan topographique parcelles agricoles – 400 ha", lignes: [ { id: "l1", designation: "Levé GPS RTK", unite: "jour", quantite: 9, prixUnitaire: 4800 }, { id: "l2", designation: "Production plans", unite: "jour", quantite: 6, prixUnitaire: 2900 } ], delaiSemaines: 5, statut: "Envoyé", dateCreation: "2026-08-14", dateEnvoi: "2026-08-18", responsableId: "u4", conditions: "Validité 30 jours." },
  { id: "dv8", reference: "DEV-2026-022", opportuniteId: "o13", clientId: "c9", objet: "Maquette BIM bâtiment patrimonial", lignes: [ { id: "l1", designation: "Relevé scanner patrimoine", unite: "jour", quantite: 5, prixUnitaire: 7500 }, { id: "l2", designation: "Modélisation HBIM", unite: "jour", quantite: 18, prixUnitaire: 4200 } ], delaiSemaines: 9, statut: "Refusé", dateCreation: "2026-07-22", dateEnvoi: "2026-07-25", responsableId: "u3", conditions: "Refusé – budget client insuffisant." },
];

const checklistBase = (): ChecklistItem[] => [
  { id: "k1", categorie: "Administratif", libelle: "Attestation fiscale", fait: true },
  { id: "k2", categorie: "Administratif", libelle: "CNSS", fait: true },
  { id: "k3", categorie: "Administratif", libelle: "Registre de commerce (RC)", fait: true },
  { id: "k4", categorie: "Administratif", libelle: "ICE", fait: true },
  { id: "k5", categorie: "Administratif", libelle: "Caution provisoire", fait: false },
  { id: "k6", categorie: "Technique", libelle: "Mémoire technique", fait: true },
  { id: "k7", categorie: "Technique", libelle: "Planning d'exécution", fait: false },
  { id: "k8", categorie: "Technique", libelle: "Références similaires", fait: true },
  { id: "k9", categorie: "Technique", libelle: "CV de l'équipe", fait: false },
  { id: "k10", categorie: "Financier", libelle: "Bordereau des prix", fait: false },
  { id: "k11", categorie: "Financier", libelle: "Détail estimatif", fait: false },
  { id: "k12", categorie: "Financier", libelle: "Acte d'engagement", fait: false },
];

const aoSeeds: Array<[string, string, string, string, Service, number, number, string, string, number, AppelOffre["statut"], string | undefined]> = [
  ["AO-18/2026", "Agence Nationale d'Aménagement (démo)", "Travaux topographiques et établissement de plans", "Rabat", "Topographie", 1450000, 25000, "2026-08-18", "2026-09-18", 93, "En préparation", "u6"],
  ["AO-22/2026", "Direction Régionale de l'Équipement Fès (démo)", "Étude topographique du tracé de la RR-503", "Fès", "Étude technique", 2300000, 40000, "2026-08-21", "2026-09-02", 88, "Validation interne", "u6"],
  ["AO-25/2026", "Commune Urbaine de Témara (démo)", "Établissement d'un SIG communal", "Témara", "SIG", 980000, 15000, "2026-08-24", "2026-09-03", 85, "À préparer", "u6"],
  ["AO-27/2026", "ONEE Branche Eau (démo)", "Levé et cartographie des réseaux d'assainissement", "Kénitra", "Cartographie", 1750000, 30000, "2026-08-25", "2026-09-30", 79, "Go / No-Go", "u6"],
  ["AO-31/2026", "Port Tanger Med (démo)", "Acquisition LIDAR terrestre des quais", "Tanger", "LIDAR / Scanner 3D", 3100000, 60000, "2026-08-26", "2026-10-12", 91, "À analyser", undefined],
  ["AO-33/2026", "Agence Urbaine de Marrakech (démo)", "Orthophotographie et modèle numérique de terrain", "Marrakech", "Photogrammétrie", 2650000, 45000, "2026-08-27", "2026-10-05", 87, "À analyser", undefined],
  ["AO-35/2026", "Société des Autoroutes (démo)", "Mobile Mapping du réseau autoroutier – lot 2", "Casablanca", "Mobile Mapping", 4200000, 80000, "2026-08-28", "2026-10-20", 82, "Détecté", undefined],
  ["AO-12/2026", "Ministère de l'Habitat (démo)", "Travaux de bornage de terrains domaniaux", "Meknès", "Ingénierie foncière", 890000, 14000, "2026-07-30", "2026-08-22", 74, "Déposé", "u6"],
  ["AO-09/2026", "Conseil Régional Souss-Massa (démo)", "Cartographie des zones à risque", "Agadir", "Cartographie", 1320000, 22000, "2026-07-12", "2026-08-05", 76, "Gagné", "u6"],
  ["AO-05/2026", "Office des Chemins de Fer (démo)", "Auscultation métrologique d'ouvrages d'art", "Casablanca", "Métrologie", 1600000, 28000, "2026-06-20", "2026-07-18", 61, "Perdu", "u6"],
];

export const appelsOffres: AppelOffre[] = aoSeeds.map(
  ([reference, organisme, objet, localisation, categorie, budget, caution, datePublication, dateLimite, scoreIA, statut, responsableId], i) => ({
    id: `ao${i + 1}`,
    reference,
    organisme,
    objet,
    localisation,
    categorie,
    budget,
    caution,
    datePublication,
    dateLimite,
    scoreIA,
    ...(responsableId ? { responsableId } : {}),
    statut,
    ...(statut === "En préparation" || statut === "Validation interne" || statut === "Déposé" || statut === "Gagné"
      ? { decision: "GO" as const }
      : {}),
    competences: [
      { nom: "Topographie", match: "forte", note: "Correspondance forte" },
      { nom: "SIG", match: "moyenne", note: "Correspondance" },
      { nom: "Photogrammétrie", match: "forte", note: "GEODATA dispose de cette expertise" },
      { nom: "Matériel GPS", match: "forte", note: "Disponible" },
      { nom: "Scanner 3D", match: "forte", note: "Disponible" },
    ],
    risques: i % 2 === 0 ? ["Délai de réponse court"] : ["Caution provisoire élevée", "Concurrence locale forte"],
    vigilance: [
      "Une visite obligatoire des lieux est prévue le 08/09/2026.",
      "3 références similaires des cinq dernières années sont demandées.",
      "Un ingénieur topographe avec minimum 10 ans d'expérience est exigé.",
    ],
    extraction: [
      { champ: "Objet du marché", valeur: objet },
      { champ: "Maître d'ouvrage", valeur: organisme },
      { champ: "Date limite", valeur: dateLimite },
      { champ: "Caution provisoire", valeur: `${caution.toLocaleString("fr-FR")} MAD` },
      { champ: "Budget estimé", valeur: `${budget.toLocaleString("fr-FR")} MAD` },
      { champ: "Visite des lieux", valeur: "Obligatoire – 08/09/2026 à 10h00" },
      { champ: "Qualifications demandées", valeur: "Secteur T – Classe 2 minimum" },
      { champ: "Personnel demandé", valeur: "1 ingénieur topographe (10 ans), 2 techniciens" },
      { champ: "Matériel demandé", valeur: "GPS RTK, station totale, scanner 3D" },
      { champ: "Références demandées", valeur: "3 marchés similaires (5 dernières années)" },
      { champ: "Méthodologie", valeur: "Note méthodologique détaillée exigée" },
      { champ: "Livrables", valeur: "Plans DWG, rapport PDF, données SIG (SHP)" },
      { champ: "Critères de notation", valeur: "Technique 60% / Financier 40%" },
    ],
    checklist: checklistBase(),
    referencesIds: ["r1", "r3", "r5", "r8"],
    documents: [
      doc(`aod${i}1`, "reglement_consultation.pdf", "Règlement de consultation", "1,8 Mo", datePublication),
      doc(`aod${i}2`, "CPS.pdf", "CPS", "4,4 Mo", datePublication),
      doc(`aod${i}3`, "bordereau_des_prix.xlsx", "Bordereau des prix", "220 Ko", datePublication),
    ],
    historique: [
      { date: datePublication, evenement: "Appel d'offres détecté par l'Agent IA" },
      { date: datePublication, evenement: `Score de pertinence GEODATA calculé : ${scoreIA}%` },
    ],
  }),
);

const refSeeds: Array<[string, string, number, Service, number, string]> = [
  ["Relevé topographique zone industrielle Aïn Sebaâ", "Groupe Atlas Industrie", 2025, "Topographie", 620000, "Casablanca"],
  ["SIG communal et cadastre numérique", "Commune Urbaine Témara (démo)", 2024, "SIG", 890000, "Témara"],
  ["Orthophoto et MNT – 4 200 ha", "Agence Urbaine de Marrakech (démo)", 2025, "Photogrammétrie", 1450000, "Marrakech"],
  ["Scan 3D et maquette BIM usine", "Cimenterie Souss (démo)", 2024, "BIM", 730000, "Agadir"],
  ["Mobile Mapping voirie – 240 km", "Société des Autoroutes (démo)", 2025, "Mobile Mapping", 2100000, "Casablanca – Rabat"],
  ["Cartographie des risques d'inondation", "Conseil Régional Souss-Massa (démo)", 2023, "Cartographie", 980000, "Agadir"],
  ["Auscultation d'un pont métallique", "ONCF (démo)", 2024, "Métrologie", 460000, "Kénitra"],
  ["Levé LIDAR terrestre de quais portuaires", "Port Tanger Med (démo)", 2025, "LIDAR / Scanner 3D", 1680000, "Tanger"],
  ["Bornage de 340 lots domaniaux", "Ministère de l'Habitat (démo)", 2023, "Ingénierie foncière", 540000, "Meknès"],
  ["Étude topographique tracé routier 38 km", "DRE Fès (démo)", 2024, "Étude technique", 1230000, "Fès"],
  ["Suivi photogrammétrique de carrière", "OCP Développement (démo)", 2025, "Photogrammétrie", 380000, "Khouribga"],
  ["Base SIG réseaux d'eau potable", "ONEE Branche Eau (démo)", 2023, "SIG", 1120000, "Rabat"],
  ["Plan topographique agricole 1 200 ha", "Groupe Agricole Doukkala (démo)", 2024, "Topographie", 310000, "El Jadida"],
  ["Modélisation 3D d'un site patrimonial", "Agence Urbaine de Marrakech (démo)", 2023, "BIM", 420000, "Marrakech"],
  ["Cartographie thématique d'aménagement", "Agence Bouregreg (démo)", 2025, "Cartographie", 760000, "Rabat"],
];

export const references: ReferenceProjet[] = refSeeds.map(([projet, client, annee, service, montant, localisation], i) => ({
  id: `r${i + 1}`,
  projet,
  client,
  annee,
  service,
  montant,
  localisation,
  description: `Mission ${service.toLowerCase()} réalisée pour ${client} à ${localisation}. Livrables conformes au cahier des charges et réceptionnés sans réserve.`,
  equipe: ["Karim Alaoui (chef de projet)", "Ahmed Rifai", "Salma Idrissi"],
  technologies: ["GPS RTK Trimble", "Station totale Leica", "Scanner 3D Faro", "ArcGIS / QGIS"],
  documents: [doc(`rd${i}`, "attestation_bonne_execution.pdf", "Attestation", "410 Ko", `${annee}-12-15`)],
}));

const affSeeds: Array<[string, string, string, string, string, string, string, number, number, Affaire["statut"], Service[]]> = [
  ["AFF-2026-041", "Mise à jour topographique Zone Industrielle", "c2", "Appel d'offres AO-18/2026", "Appel d'offres", "u7", "2026-09-20", 1450000, 42, "En exécution", ["Topographie", "SIG"]],
  ["AFF-2026-040", "SIG communal – Commune de Témara", "c3", "Appel d'offres AO-25/2026", "Appel d'offres", "u8", "2026-08-10", 980000, 68, "En validation", ["SIG", "Cartographie"]],
  ["AFF-2026-039", "Scan 3D et BIM – Cimenterie Souss", "c8", "Devis DEV-2026-038", "Devis", "u10", "2026-08-01", 178000, 85, "En livraison", ["BIM", "LIDAR / Scanner 3D"]],
  ["AFF-2026-038", "Photogrammétrie de carrière – T3", "c4", "Devis DEV-2026-031", "Devis", "u9", "2026-07-15", 195000, 100, "Clôturée", ["Photogrammétrie"]],
  ["AFF-2026-037", "Cartographie risques inondation", "c2", "Devis DEV-2026-019", "Devis", "u8", "2026-07-01", 385000, 74, "En exécution", ["Cartographie", "SIG"]],
  ["AFF-2026-036", "Levé bathymétrique portuaire", "c10", "Devis DEV-2026-017", "Devis", "u7", "2026-06-20", 410000, 91, "En livraison", ["Topographie"]],
  ["AFF-2026-035", "Mobile Mapping voirie Marrakech", "c9", "Devis DEV-2026-036", "Devis", "u9", "2026-09-01", 640000, 12, "En planification", ["Mobile Mapping"]],
  ["AFF-2026-034", "Relevé topographique Client Atlas", "c1", "Devis DEV-2026-014", "Devis", "u7", "2026-06-05", 148000, 96, "En validation", ["Topographie"]],
  ["AFF-2026-033", "Base SIG réseaux eau", "c7", "Devis DEV-2026-034", "Devis", "u8", "2026-05-18", 520000, 58, "En exécution", ["SIG"]],
  ["AFF-2026-032", "Étude tracé RR-503", "c12", "Appel d'offres AO-22/2026", "Appel d'offres", "u7", "2026-05-02", 2300000, 46, "En exécution", ["Étude technique", "Topographie"]],
  ["AFF-2026-031", "Auscultation ouvrages d'art", "c5", "Devis DEV-2026-008", "Devis", "u10", "2026-04-14", 288000, 100, "Clôturée", ["Métrologie"]],
  ["AFF-2026-030", "Bornage lotissement Anfa", "c6", "Devis DEV-2026-029", "Devis", "u9", "2026-09-05", 132000, 5, "En lancement", ["Ingénierie foncière"]],
];

export const affaires: Affaire[] = affSeeds.map(
  ([reference, titre, clientId, source, sourceType, chefDeProjetId, dateDebut, montant, progression, statut, services]) => ({
    id: reference,
    reference,
    titre,
    clientId,
    source,
    sourceType: sourceType as Affaire["sourceType"],
    chefDeProjetId,
    dateDebut,
    dateLimite: "2026-11-30",
    montant,
    progression,
    statut,
    services,
    livrables: ["Plans DWG", "Rapport technique PDF", "Données SIG (SHP)"],
    conditions: "Réception par phases. Contrôle administration avant livraison finale.",
  }),
);

export const commandes: Commande[] = [];
export const commandesInternes: CommandeInterne[] = [];
export const taches: Tache[] = [];

const techIds = ["u11", "u12", "u13", "u14", "u15", "u16", "u17", "u18"];
const tacheLibelles: Array<[string, Tache["type"]]> = [
  ["Relevé GPS terrain", "Terrain"],
  ["Scanner 3D", "LIDAR"],
  ["Traitement des données", "Traitement"],
  ["Production des plans", "DAO"],
  ["Contrôle qualité", "Contrôle"],
  ["Intégration SIG", "SIG"],
];

let cIdx = 0;
let ciIdx = 0;
let tIdx = 0;
affaires.forEach((aff, ai) => {
  const nbCmd = ai < 5 ? 3 : 2;
  for (let k = 0; k < nbCmd; k++) {
    cIdx += 1;
    const cmdId = `${aff.reference}-C0${k + 1}`;
    const designation =
      k === 0 ? `Levé topographique – ${aff.titre.split(" ").slice(0, 3).join(" ")}` : k === 1 ? "Traitement et modélisation" : "Production cartographique";
    const cmdStatut: Commande["statut"] =
      aff.progression >= 100 ? "Prêt à facturer" : aff.progression > 60 ? "En cours" : k === 0 ? "Planifiée" : "À planifier";
    commandes.push({
      id: cmdId,
      reference: `C-${String(cIdx).padStart(2, "0")}`,
      affaireId: aff.id,
      designation,
      quantite: 1,
      dateLimite: k === 0 ? "2026-10-15" : "2026-10-30",
      chefDeProjetId: aff.chefDeProjetId,
      statut: cmdStatut,
    });

    ciIdx += 1;
    const ciId = `${cmdId}-CI`;
    const ciStatut: CommandeInterne["statut"] =
      aff.progression >= 100
        ? "Prêt à facturer"
        : aff.progression >= 90
          ? "Livraison en attente"
          : aff.progression >= 60
            ? "En validation"
            : k === 0
              ? "En exécution"
              : "À planifier";
    commandesInternes.push({
      id: ciId,
      reference: `CI-${String(ciIdx).padStart(3, "0")}`,
      commandeId: cmdId,
      designation,
      quantite: 1,
      dateLimite: k === 0 ? "2026-10-15" : "2026-10-30",
      chefDeProjetId: aff.chefDeProjetId,
      description: `Commande interne issue de la commande ${cmdId} de l'affaire ${aff.reference}.`,
      priorite: ai === 0 ? "Haute" : "Normale",
      statut: ciStatut,
      historique: [{ date: aff.dateDebut, evenement: "Commande interne créée" }],
    });

    if (ciStatut !== "À planifier") {
      const nb = k === 0 ? 4 : 2;
      for (let t = 0; t < nb; t++) {
        tIdx += 1;
        const [libelle, type] = tacheLibelles[(t + k) % tacheLibelles.length]!;
        const prog: Tache["progression"] =
          aff.progression >= 90 ? 100 : t === 0 ? 100 : t === 1 ? 75 : t === 2 ? 50 : 0;
        const statutT: Tache["statut"] =
          prog === 100 ? (aff.progression >= 90 ? "Validée" : "En attente de validation") : prog === 0 ? "À faire" : "En cours";
        taches.push({
          id: `T${String(tIdx).padStart(3, "0")}`,
          libelle: `${libelle} – ${aff.reference.slice(-3)}`,
          type,
          responsableId: techIds[tIdx % techIds.length]!,
          dateDebut: `2026-09-${String(10 + ((tIdx * 2) % 18)).padStart(2, "0")}`,
          dureeJours: 1 + (tIdx % 4),
          progression: prog,
          statut: statutT,
          ...(prog > 0 && prog < 100 ? { commentaire: "Zone nord terminée. Partie sud prévue demain." } : {}),
          livrables: prog === 100 ? [doc(`lv${tIdx}`, `livrable_${String(tIdx).padStart(3, "0")}.dwg`, "DWG", "12,4 Mo", "2026-09-22")] : [],
          commandeInterneId: ciId,
        });
      }
    }
  }
});

export const rejets: Rejet[] = [
  {
    id: "rj1",
    ref: "R1",
    date: "2026-09-29",
    origine: "Administration",
    motif: "Plans incomplets – zone B",
    commentaires: "La zone B ne comporte pas les altimétries demandées. Reprise partielle exigée.",
    corrections: ["Compléter le levé altimétrique zone B", "Mettre à jour le plan DWG", "Joindre la note de calcul"],
    commandeInterneId: commandesInternes[0]!.id,
    resolu: false,
  },
];

const postSujets: Array<[string, SocialPost["plateforme"], string, string]> = [
  ["Comment le LIDAR transforme les relevés topographiques", "LinkedIn", "2026-09-02", "Expertise"],
  ["Projet de Mobile Mapping – coulisses terrain", "Facebook", "2026-09-05", "Projet réalisé"],
  ["SIG : transformer les données géographiques en outil de décision", "LinkedIn", "2026-09-09", "Expertise"],
  ["Scanner 3D en intervention terrain", "Instagram", "2026-09-12", "Technologie"],
  ["Photogrammétrie par drone : précision centimétrique", "LinkedIn", "2026-09-15", "Technologie"],
  ["GEODATA recrute un ingénieur topographe", "LinkedIn", "2026-09-17", "Recrutement"],
  ["Retour sur notre mission de bornage à Anfa", "Facebook", "2026-09-19", "Projet réalisé"],
  ["Les 5 erreurs fréquentes dans un levé topographique", "LinkedIn", "2026-09-22", "Notoriété"],
  ["BIM et patrimoine : numériser pour conserver", "LinkedIn", "2026-09-24", "Expertise"],
  ["Une journée avec nos équipes terrain", "Instagram", "2026-09-26", "Notoriété"],
  ["Cartographie des risques : anticiper les inondations", "LinkedIn", "2026-09-29", "Expertise"],
  ["Nouveau scanner 3D dans notre parc matériel", "Instagram", "2026-10-01", "Technologie"],
  ["Comment choisir son prestataire topographe", "LinkedIn", "2026-10-03", "Génération de leads"],
  ["Mobile Mapping : 240 km cartographiés", "Facebook", "2026-10-06", "Projet réalisé"],
  ["Ingénierie foncière : les étapes d'un morcellement", "LinkedIn", "2026-10-08", "Pédagogique"],
  ["Nos équipes en formation continue", "Instagram", "2026-10-10", "Notoriété"],
  ["Étude technique routière : notre méthodologie", "LinkedIn", "2026-10-13", "Expertise"],
  ["Portrait : Ahmed, technicien topographe", "Instagram", "2026-10-15", "Notoriété"],
  ["Données géospatiales et décision publique", "LinkedIn", "2026-10-17", "Génération de leads"],
  ["GEODATA au salon de la géomatique", "Facebook", "2026-10-20", "Notoriété"],
];

export const posts: SocialPost[] = postSujets.map(([sujet, plateforme, date, objectif], i) => ({
  id: `p${i + 1}`,
  date,
  plateforme,
  sujet,
  objectif,
  service: ["Topographie", "SIG", "LIDAR", "Photogrammétrie", "Mobile Mapping", "BIM"][i % 6]!,
  ton: ["Professionnel", "Technique", "Pédagogique"][i % 3]!,
  hook: `${sujet} — ce que peu de maîtres d'ouvrage savent.`,
  corps: `Chez GEODATA, nous accompagnons les maîtres d'ouvrage marocains dans l'acquisition et l'exploitation de données géographiques fiables.\n\n${sujet} : nos équipes combinent matériel de dernière génération et méthodologie rigoureuse pour livrer des données exploitables immédiatement.\n\nRésultat : des décisions plus rapides, des chantiers mieux maîtrisés et des livrables conformes aux exigences techniques.`,
  cta: "Un projet en cours ? Parlons-en en message privé.",
  hashtags: ["#GEODATA", "#Topographie", "#SIG", "#Géomatique", "#Maroc"],
  visuel: "Photo terrain d'un technicien avec station totale, cadrage large, lumière naturelle.",
  statut: (["Publié", "Publié", "Planifié", "Validé", "À valider", "Brouillon", "Idée"] as const)[i % 7]!,
  ...(i % 7 < 2 ? { vues: 1200 + i * 340, interactions: 45 + i * 7 } : {}),
}));

export const notifications: Notification[] = [
  { id: "n1", type: "Commercial", message: "Le devis DEV-2026-031 doit être relancé aujourd'hui.", date: "2026-09-01", lue: false, lien: "/devis" },
  { id: "n2", type: "AO", message: "AO-22/2026 expire dans 48 heures.", date: "2026-09-01", lue: false, lien: "/appels-offres" },
  { id: "n3", type: "Projet", message: "Ahmed Rifai a terminé la tâche « Relevé GPS terrain ».", date: "2026-09-01", lue: false, lien: "/affaires" },
  { id: "n4", type: "Validation", message: "3 tâches sont en attente de votre validation.", date: "2026-08-31", lue: false, lien: "/affaires" },
  { id: "n5", type: "Rejet", message: "L'administration a rejeté la livraison AFF-2026-041 – R1.", date: "2026-08-31", lue: false, lien: "/affaires" },
  { id: "n6", type: "Retard", message: "La tâche « Traitement photogrammétrique » accuse 3 jours de retard.", date: "2026-08-30", lue: true, lien: "/affaires" },
  { id: "n7", type: "Livraison", message: "La livraison de AFF-2026-039 attend le contrôle client.", date: "2026-08-30", lue: true, lien: "/affaires" },
  { id: "n8", type: "AO", message: "Nouvel appel d'offres détecté : AO-35/2026 (score 82%).", date: "2026-08-29", lue: true, lien: "/opportunites-detectees" },
  { id: "n9", type: "Commercial", message: "Nouvelle consultation reçue de Groupe Atlas Industrie.", date: "2026-08-28", lue: true, lien: "/opportunites" },
  { id: "n10", type: "Projet", message: "L'affaire AFF-2026-030 est prête à être planifiée.", date: "2026-08-28", lue: true, lien: "/affaires" },
];

export const initialState: DataState = {
  users,
  clients,
  opportunites,
  devis,
  appelsOffres,
  references,
  affaires,
  commandes,
  commandesInternes,
  taches,
  rejets,
  posts,
  notifications,
};
