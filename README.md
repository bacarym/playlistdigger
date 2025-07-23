# 🎵 Générateur de Playlist YouTube

Une application web qui génère automatiquement une playlist YouTube triée par popularité (nombre de likes) à partir d'une URL de chaîne.

## ✨ Fonctionnalités

- **Génération automatique de playlist** : Collez simplement l'URL d'une chaîne YouTube
- **Tri par popularité** : Les vidéos sont automatiquement triées par nombre de likes (du plus populaire au moins populaire)
- **Lecteur audio intégré** : Écoutez directement l'audio des vidéos sans afficher la vidéo
- **Nombre de vidéos personnalisable** : Choisissez entre 10, 25, 50 ou 100 vidéos
- **Ouverture dans YouTube** : Bouton pour ouvrir la playlist complète dans YouTube
- **Interface responsive** : Fonctionne sur desktop et mobile
- **Statistiques détaillées** : Affiche les likes et vues pour chaque vidéo

## 🚀 Utilisation

1. **Ouvrez le fichier `index.html`** dans votre navigateur web
2. **Collez l'URL** de la chaîne YouTube dans le champ de saisie
3. **Sélectionnez le nombre de vidéos** souhaité (10, 25, 50 ou 100)
4. **Cliquez sur "Générer la Playlist"**
5. **Attendez** que l'application récupère et trie les vidéos
6. **Écoutez** les vidéos directement ou **ouvrez dans YouTube**

## 📝 Formats d'URL supportés

L'application supporte tous les formats d'URL de chaînes YouTube :

- `https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxx`
- `https://www.youtube.com/c/NomDeLaChaine`
- `https://www.youtube.com/user/nomutilisateur`
- `https://www.youtube.com/@nomduchaine`

## 🎯 Fonctionnalités détaillées

### Tri par popularité
- Les vidéos sont triées automatiquement par nombre de likes
- Les vidéos les plus populaires apparaissent en premier
- Affichage du classement numéroté

### Lecteur audio
- Cliquez sur "▶️ Écouter" pour lancer la lecture audio
- Le bouton devient "⏸️ Pause" pendant la lecture
- Un seul audio peut être lu à la fois
- Lecteur intégré directement dans la page

### Statistiques
- Nombre de likes (👍) formaté (K, M)
- Nombre de vues (👀) formaté (K, M)
- Classement par position dans la playlist

### Ouverture dans YouTube
- Bouton "Ouvrir dans YouTube" pour accéder à la playlist complète
- Ouvre dans un nouvel onglet
- Conserve l'ordre de tri par popularité

## 🛠️ Technologies utilisées

- **HTML5** : Structure de la page
- **CSS3** : Style moderne et responsive
- **JavaScript ES6+** : Logique de l'application
- **YouTube Data API v3** : Récupération des données YouTube
- **API REST** : Communication avec les services YouTube

## 📋 Prérequis

- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Connexion internet pour accéder à l'API YouTube
- Clé API YouTube intégrée dans l'application

## 🔧 Installation

1. Téléchargez tous les fichiers :
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

2. Placez tous les fichiers dans le même dossier

3. Ouvrez `index.html` dans votre navigateur

## 🎨 Interface utilisateur

L'application dispose d'une interface moderne et intuitive :

- **Header** : Titre et description de l'application
- **Formulaire** : Champ URL et sélection du nombre de vidéos
- **Zone de playlist** : Affichage des vidéos triées avec lecteurs
- **Boutons d'action** : Lecture audio et ouverture dans YouTube

## 🐛 Résolution des problèmes

### Erreurs courantes

1. **"URL de chaîne YouTube invalide"**
   - Vérifiez que l'URL est complète et correcte
   - Assurez-vous qu'il s'agit bien d'une chaîne (pas d'une vidéo)

2. **"Impossible de trouver la chaîne"**
   - La chaîne existe peut-être mais n'est pas accessible
   - Vérifiez que la chaîne est publique

3. **"Aucune vidéo trouvée"**
   - La chaîne n'a peut-être pas de vidéos publiques
   - Certaines chaînes ont des restrictions d'accès

### Limitations techniques

- **Lecture audio** : Utilise des iframes YouTube (certaines vidéos peuvent avoir des restrictions)
- **Quotas API** : L'API YouTube a des limites de requêtes quotidiennes
- **Vidéos privées** : Seules les vidéos publiques sont accessibles

## 📊 Optimisations

- **Tri intelligent** : Utilise le nombre de likes comme critère principal
- **Chargement progressif** : Affichage des résultats en temps réel
- **Gestion des erreurs** : Messages d'erreur clairs pour l'utilisateur
- **Performance** : Requêtes API optimisées et mise en cache

## 🔜 Améliorations futures possibles

- Support pour d'autres critères de tri (vues, date, durée)
- Sauvegarde de playlists favorites
- Export vers d'autres plateformes musicales
- Mode hors ligne pour les playlists sauvegardées

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Assurez-vous que votre connexion internet fonctionne
3. Essayez avec une autre chaîne YouTube
4. Rechargez la page et réessayez

---

**Développé pour une expérience musicale optimisée avec YouTube** 🎵 