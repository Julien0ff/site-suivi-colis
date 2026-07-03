# 📦 TrackFlow

TrackFlow est une application web moderne de suivi de colis multi-transporteurs. Elle permet d'ajouter des numéros de suivi et d'obtenir des notifications en temps réel (via Discord) lorsque le statut de vos colis évolue.

## 🌟 Fonctionnalités

- **Suivi multi-transporteurs** : Supporte AfterShip et TrackingMore pour une détection automatique du transporteur.
- **Tableau de bord interactif** : Vue globale de vos colis avec statuts clairs et carte interactive (Leaflet).
- **Notifications Discord** : Recevez un MP Discord à chaque étape de l'acheminement de votre colis.
- **Interface 100% Responsive** : Utilisable sur PC comme sur smartphone avec une Bottom Tab Bar adaptative.
- **Authentification Sécurisée** : Connexion via Discord avec NextAuth.

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS (v4)
- **Base de données / Backend** : Firebase (Firestore & Admin SDK)
- **Authentification** : NextAuth.js
- **Cartographie** : React Leaflet

## 🚀 Installation & Déploiement

### Prérequis
- Node.js (v18+)
- Un compte Firebase avec Firestore configuré
- Une application Discord (Portail Développeur) pour l'OAuth2 et le Bot
- Des clés d'API (AfterShip ou TrackingMore)

### Développement local

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/Julien0ff/site-suivi-colis.git
   cd site-suivi-colis
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Copiez le fichier `.env.example` en `.env` et remplissez vos identifiants (Firebase, Discord, API).
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Déploiement sur Vercel
1. Poussez le code sur GitHub.
2. Liez le dépôt sur Vercel.
3. Configurez les variables d'environnement dans les paramètres Vercel, en prenant soin de changer `NEXTAUTH_URL` et `NEXT_PUBLIC_APP_URL`.
4. Vercel gérera le build et le déploiement automatiquement.

## ⚖️ License

Ce projet est sous licence **GPL-3.0**. Voir le fichier `LICENSE` pour plus de détails.
