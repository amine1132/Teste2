# Dossier Musique

Ce dossier contient les fichiers audio pour le projet.

## Fichiers disponibles :

- `KatyPerry-Firework(Lyrics).mp3` - **MUSIQUE PRINCIPALE** de Katy Perry (6.5 MB)
- `Cover Your Tracks.mp3` - **MUSIQUE PRINCIPALE** du Chapitre 2 (5.5 MB)
- `drawing-music.mp3` - Musique de secours (si ajoutée)

## Configuration par chapitre :

### 🎆 **Chapitre 1 - Premier Regard** :
- **Playlist** : `firework`
- **Musique** : `KatyPerry-Firework(Lyrics).mp3` (priorité 1)
- **Fallback** : `Cover Your Tracks.mp3` puis `drawing-music.mp3`

### 🌊 **Chapitre 2 - Le Rythme des Rivières** :
- **Playlist** : `cover-tracks`
- **Musique** : `Cover Your Tracks.mp3` (priorité 1)
- **Fallback** : `KatyPerry-Firework(Lyrics).mp3` puis `drawing-music.mp3`

### 🎵 **Chapitre 3 et autres** :
- **Playlist** : `default` (ou non spécifiée)
- **Musique** : `KatyPerry-Firework(Lyrics).mp3` (priorité 1)
- **Fallback** : `Cover Your Tracks.mp3` puis `drawing-music.mp3`

## Notes :

- **Volume** : Réglé à 40% pour une expérience immersive
- **Autoplay** : Démarre automatiquement après 1 seconde
- **Loop** : Musique en boucle continue
- **Contrôles** : Disponibles en bas-droite (Play/Pause, Mute, Masquer)

## Test :

1. **Chapitre 1** : `npm run dev` → `/chapter1` → **Firework de Katy Perry** 🎆
2. **Chapitre 2** : `/chapter2` → **Cover Your Tracks** 🌊
3. **Contrôles** : Gère le son à tout moment ! 🎛️