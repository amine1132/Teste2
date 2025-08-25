# 💖 Site Amoureux Privé

Un site web immersif et romantique créé avec Next.js 15, TailwindCSS, Framer Motion et Three.js pour célébrer une histoire d'amour en quatre chapitres.

## ✨ Fonctionnalités

- **Intro animée** avec nom personnalisé et particules Three.js
- **4 chapitres interactifs** avec des scènes 3D uniques
- **Animations fluides** avec Framer Motion
- **Optimisé iPad Pro** avec interactions tactiles
- **Easter Eggs cachés** dans chaque chapitre
- **Design romantique** avec palette rose/violet/doré

## 🚀 Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd love-site

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎨 Personnalisation

### Changer le prénom
Édite `src/app/intro/page.tsx` ligne 17 :
```typescript
const loverName = "Charlotte" // ← Remplace par le prénom souhaité
```

### Personnaliser les chapitres
- **Chapitre 1** : Premier Regard (`src/app/chapter1/page.tsx`)
- **Chapitre 2** : Premiers Mots (`src/app/chapter2/page.tsx`) 
- **Chapitre 3** : L'Engagement (`src/app/chapter3/page.tsx`)
- **Chapitre 4** : Notre Éternité (`src/app/chapter4/page.tsx`)

### Couleurs et styles
Modifie `src/app/globals.css` pour ajuster :
- Palette de couleurs romantiques
- Typographie (Playfair Display + Inter)
- Effets et animations

## 🎮 Easter Eggs

Chaque chapitre contient un Easter Egg caché :
- **Chapitre 1** : ✨ (coin supérieur droit)
- **Chapitre 2** : 💌 (coin inférieur gauche)  
- **Chapitre 3** : 💎 (coin supérieur droit)
- **Chapitre 4** : 🌟 (coin inférieur droit)

## 📱 Optimisations mobiles

- Interface tactile optimisée
- Support iPad Pro complet
- Gestes et interactions naturelles
- Prévention du zoom accidentel
- Safe areas iOS

## 🛠️ Technologies

- **Next.js 15** - Framework React avec App Router
- **TailwindCSS v4** - Styles utilitaires
- **Framer Motion** - Animations fluides
- **Three.js** - Scènes 3D via @react-three/fiber
- **TypeScript** - Typage statique

## 📁 Structure

```
src/
├── app/
│   ├── intro/          # Page d'introduction animée
│   ├── chapter1/       # Premier chapitre
│   ├── chapter2/       # Deuxième chapitre  
│   ├── chapter3/       # Troisième chapitre
│   ├── chapter4/       # Quatrième chapitre
│   ├── layout.tsx      # Layout global
│   ├── page.tsx        # Redirection vers intro
│   └── globals.css     # Styles globaux
└── utils/
    └── easterEggs.ts   # Système d'Easter Eggs
```

## 🎯 Prochaines étapes

- Ajouter des interactions Three.js plus complexes
- Personnaliser les Easter Eggs avec des effets spéciaux
- Intégrer de la musique d'ambiance
- Ajouter des photos/souvenirs
- Créer des mini-jeux romantiques

## 💝 Notes

Ce site est conçu pour être privé et personnel. Il célèbre une histoire d'amour unique avec des détails intimes et des références personnelles.

---

*Créé avec ❤️ pour célébrer l'amour*