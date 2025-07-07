# CTFD-Attempts-Viewer
**CTFD-Attempts-Remover** est un plugin pour [CTFd](https://ctfd.io) permettant aux utilisateurs de visualiser leurs tentatives de submit pour un challenge précis. 

---

## Fonctionnalités principales

- **Consultation des tentatives d'équipe** :
  - Les joueurs peuvent visualiser toutes les tentatives soumises par leur équipe, challenge par challenge.
- **Nouvel onglet "Tentatives" dans chaque challenge** :
  - Directement depuis le modal d’un challenge, l’équipe peut voir l’historique complet des soumissions liées à ce challenge.
- **Page dédiée d’historique global** :
  - Une page centrale permettant d’explorer l’ensemble des tentatives faites pendant l’événement, avec filtres avancés (joueur, challenge, statut).
- **Configuration admin simple** :
  - Activation/désactivation du bouton principal sur la page Challenges directement depuis le panneau d’administration.

## Pourquoi ce plugin ?

> "Combien de fois ai-je soumis ce flag ? Qui l’a tenté ? Quelle était ma dernière tentative ?"

Avec ce plugin, chaque joueur peut enfin suivre ses tentatives en toute autonomie, sans solliciter l’organisation.  
Ils disposent d’une vision claire et détaillée de leurs soumissions, que ce soit challenge par challenge ou sur l’ensemble de l’événement.

Côté administration, plus besoin de répondre aux demandes répétitives sur l’historique des tentatives.  
Les équipes gagnent en autonomie, et l’organisation en confort et en temps.

Grâce à ce plugin, tout le monde reste concentré sur le jeu et la progression, sans distractions.


## Installation

1. Clonez ce dépôt dans le dossier `CTFd/plugins` :
   
   ```bash
   cd /path/to/CTFd/plugins
   git clone https://github.com/HACK-OLYTE/CTFD-Attempts-Viewer.git

3. Restart your CTFd instance to load the plugin.


## Configuration

Accédez au panneau d’administration **Plugins > Attempts-Viewer** pour :

- Activer ou désactiver le bouton "Historique de vos tentatives" sur la page challenges (bouton permettant de consulter l'ensemble de ces subits).


Voici une vidéo de démonstration du plugin : 

https://github.com/user-attachments/assets/293011ee-3942-4d98-a4ef-39c04a18a298


## Dépendances

- CTFd ≥ v3.x
- Compatible avec les installations Docker et locales.
- Un navigateur à jour et JavaScript d'activé.


## Support

Pour toute question ou problème, ouvrez une [issue](https://github.com/votre-utilisateur/CTFD-Attempts-Viewer/issues). <br>
Ou contactez nous sur le site de l'association Hack'olyte : [contact](https://hackolyte.fr/contact/).


## Contribuer

Les contributions sont les bienvenues !  
Vous pouvez :

- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests


## Licences 

Ce plugin est sous licence [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr).  
Merci de ne pas retirer le footer de chaque fichier HTML sans l'autorisation préalable de l'association Hack'olyte.


