export type Role =
  | "ADMINISTRATION"
  | "DIRECTION"
  | "COMMERCIAL"
  | "MARKETING"
  | "RESPONSABLE_AO"
  | "CHEF_DE_PROJET"
  | "TECHNICIEN";

export interface User {
  id: string;
  nom: string;
  role: Role;
  initiales: string;
  email: string;
  specialite?: string;
  chargePct?: number;
}

export interface Client {
  id: string;
  nom: string;
  secteur: string;
  ville: string;
  contact: string;
  fonction: string;
  email: string;
  telephone: string;
  type: "Privé" | "Public" | "Semi-public";
  ca: number;
}

export const SERVICES = [
  "Topographie",
  "Photogrammétrie",
  "LIDAR / Scanner 3D",
  "Mobile Mapping",
  "SIG",
  "Cartographie",
  "BIM",
  "Ingénierie foncière",
  "Étude technique",
  "Métrologie",
  "Autre",
] as const;
export type Service = (typeof SERVICES)[number];

export const OPP_STAGES = [
  "Nouveau",
  "À qualifier",
  "Qualifié",
  "Devis à préparer",
  "Devis en validation",
  "Devis envoyé",
  "Relance",
  "Gagné",
  "Perdu",
] as const;
export type OppStage = (typeof OPP_STAGES)[number];

export const OPP_TYPES = [
  "Demande de devis",
  "Consultation restreinte",
  "Demande directe",
  "Recommandation",
  "Client existant",
  "Réseau / partenaire",
] as const;
export type OppType = (typeof OPP_TYPES)[number];

export interface Interaction {
  id: string;
  date: string;
  canal: "Email" | "Téléphone" | "WhatsApp" | "Réunion" | "Système";
  auteur: string;
  contenu: string;
}

export interface DocFile {
  id: string;
  nom: string;
  type: string;
  taille: string;
  date: string;
}

export interface Tache {
  id: string;
  libelle: string;
  type:
    | "Terrain"
    | "Bureau"
    | "Traitement"
    | "Contrôle"
    | "SIG"
    | "DAO"
    | "Photogrammétrie"
    | "LIDAR"
    | "Autre";
  responsableId: string;
  dateDebut: string;
  dureeJours: number;
  progression: 0 | 25 | 50 | 75 | 100;
  statut: "À faire" | "En cours" | "En attente de validation" | "Validée" | "Correction demandée";
  commentaire?: string;
  livrables: DocFile[];
  commandeInterneId: string;
  rejetRef?: string;
}

export interface Opportunite {
  id: string;
  reference: string;
  titre: string;
  clientId: string;
  contact: string;
  type: OppType;
  service: Service;
  serviceSecondaire?: Service;
  localisation: string;
  surface?: string;
  delaiDemande?: string;
  montantEstime: number;
  budgetFourchette?: string;
  responsableId: string;
  stage: OppStage;
  prochaineAction: string;
  echeance: string;
  scoreIA: number;
  besoin: string;
  infosDisponibles: string[];
  infosManquantes: string[];
  recommandationIA: string;
  documents: DocFile[];
  interactions: Interaction[];
  affaireId?: string;
  createdAt: string;
}

export interface LigneDevis {
  id: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Devis {
  id: string;
  reference: string;
  opportuniteId: string;
  clientId: string;
  objet: string;
  lignes: LigneDevis[];
  delaiSemaines: number;
  statut: "Brouillon" | "En validation" | "Validé" | "Envoyé" | "Accepté" | "Refusé";
  dateCreation: string;
  dateEnvoi?: string;
  responsableId: string;
  conditions: string;
}

export const AO_STATUTS = [
  "Détecté",
  "À analyser",
  "Go / No-Go",
  "À préparer",
  "En préparation",
  "Validation interne",
  "Déposé",
  "Gagné",
  "Perdu",
] as const;
export type AoStatut = (typeof AO_STATUTS)[number];

export interface ChecklistItem {
  id: string;
  categorie: "Administratif" | "Technique" | "Financier";
  libelle: string;
  fait: boolean;
}

export interface AppelOffre {
  id: string;
  reference: string;
  organisme: string;
  objet: string;
  localisation: string;
  categorie: Service;
  budget: number;
  caution: number;
  datePublication: string;
  dateLimite: string;
  scoreIA: number;
  responsableId?: string;
  statut: AoStatut;
  decision?: "GO" | "NO-GO";
  competences: { nom: string; match: "forte" | "moyenne" | "faible"; note: string }[];
  risques: string[];
  vigilance: string[];
  extraction: { champ: string; valeur: string }[];
  checklist: ChecklistItem[];
  referencesIds: string[];
  documents: DocFile[];
  historique: { date: string; evenement: string }[];
  affaireId?: string;
}

export interface ReferenceProjet {
  id: string;
  projet: string;
  client: string;
  annee: number;
  service: Service;
  montant: number;
  localisation: string;
  description: string;
  equipe: string[];
  technologies: string[];
  documents: DocFile[];
}

export interface Rejet {
  id: string;
  ref: string;
  date: string;
  origine: "Client" | "Administration";
  motif: string;
  commentaires: string;
  corrections: string[];
  commandeInterneId: string;
  resolu: boolean;
}

export interface CommandeInterne {
  id: string;
  reference: string;
  commandeId: string;
  designation: string;
  quantite: number;
  dateLimite: string;
  chefDeProjetId: string;
  description: string;
  priorite: "Basse" | "Normale" | "Haute" | "Critique";
  statut:
    | "À planifier"
    | "Planifiée"
    | "En exécution"
    | "En validation"
    | "Livraison interne"
    | "Livraison en attente"
    | "Contrôle en cours"
    | "Rejetée"
    | "Livrée client"
    | "Prêt à facturer";
  controle?: {
    type: "Contrôle client" | "Contrôle administration";
    dateEnvoi: string;
    responsable: string;
    documents: string[];
    commentaires: string;
    resultat?: "VALIDÉ" | "REJETÉ";
  };
  livraisonClient?: {
    date: string;
    version: string;
    responsable: string;
    livrables: string[];
    factureProposee: boolean;
  };
  historique: { date: string; evenement: string }[];
}

export interface Commande {
  id: string;
  reference: string;
  affaireId: string;
  designation: string;
  quantite: number;
  dateLimite: string;
  chefDeProjetId: string;
  statut: "À planifier" | "Planifiée" | "En cours" | "Livrée" | "Prêt à facturer";
}

export interface Affaire {
  id: string;
  reference: string;
  titre: string;
  clientId: string;
  source: string;
  sourceType: "Devis" | "Appel d'offres";
  chefDeProjetId: string;
  dateDebut: string;
  dateLimite: string;
  montant: number;
  progression: number;
  statut:
    | "En lancement"
    | "En planification"
    | "En exécution"
    | "En validation"
    | "En livraison"
    | "Clôturée";
  services: Service[];
  livrables: string[];
  conditions: string;
}

export const POST_STATUTS = [
  "Idée",
  "Brouillon",
  "À valider",
  "Validé",
  "Planifié",
  "Publié",
] as const;
export type PostStatut = (typeof POST_STATUTS)[number];

export interface SocialPost {
  id: string;
  date: string;
  plateforme: "LinkedIn" | "Facebook" | "Instagram";
  sujet: string;
  objectif: string;
  service: string;
  ton: string;
  hook: string;
  corps: string;
  cta: string;
  hashtags: string[];
  visuel: string;
  statut: PostStatut;
  vues?: number;
  interactions?: number;
}

export interface Notification {
  id: string;
  type: "Commercial" | "AO" | "Projet" | "Validation" | "Retard" | "Livraison" | "Rejet";
  message: string;
  date: string;
  lue: boolean;
  lien?: string;
}

export interface DataState {
  users: User[];
  clients: Client[];
  opportunites: Opportunite[];
  devis: Devis[];
  appelsOffres: AppelOffre[];
  references: ReferenceProjet[];
  affaires: Affaire[];
  commandes: Commande[];
  commandesInternes: CommandeInterne[];
  taches: Tache[];
  rejets: Rejet[];
  posts: SocialPost[];
  notifications: Notification[];
}
