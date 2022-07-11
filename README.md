# ImmoBloc

Github du projet de 5ème année du groupe Sid-Ahmed MIR, Helder SALVADOR, Gautier ROUX.
Ce ReadMe sera mis à jour au fur et à mesure du projet.

Vous pouvez trouver dans le dossier database, le script de création de la base de données et un screenshot de celle-ci.
Plusieurs autres dossiers sont également créés pour nos différents besoins à savoir: "Front", "Back" et "SmartContract".
Cette architecture de dossier fera l'objet d'une révision dans le futur de ce projet et n'est que temporaire.

## Pré-requis

- [NodeJS](https://nodejs.org/en/ "NodeJS")
- [NextJS](https://nextjs.org/docs "NextJS")
- [NextJS](https://nextjs.org/docs "NextJS")
- [Temple Wallet](https://templewallet.com/ "Temple Wallet")
> Installer [Docker](https://www.hostinger.fr/tutoriels/installer-docker-sur-ubuntu), cela est important pour lancer le projet ou compiler le smart-contrat
 #### Install and run :
```bash
git clone https://github.com/NG0W/Blocky.git
cd Blocky
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Organisation

Dans un premier temps, chacun s'occupe de la base d'une partie

Base front et taquito : Sid-Ahmed
Base API et BDD : Gautier
Base déploiement et smart-contrat : Helder

Une fois ces 3 bases faites chacunes des parties prenantes feront monter en compétences les deux afin que par la suite chacun puisse développer une feature de bout en bout.

## Compilation du smart-contract

En soit vous n'aurez pas besoin de le compiler le smart-contract vu qu'il sera déjà déployé cependant voici tout de même la commande pour le faire :

```bash
sudo docker run --rm -v "$PWD":"$PWD" -w "$PWD" ligolang/ligo:0.43.0 compile contract NFT.ligo --michelson-format json > NFT.json
```
L'option michelson-format nous permet de choisir le format .json afin de pouvoir déployer via un script en Javascript.

Nous resterons sur la version 0.43.0 par soucis de sécurité

## Deploiement
Avoir rempli au préalable un fichier .env à mettre dans le dossier deploy/ selon cette forme
```env
PK=esdk... (Mettez votre private key, récupérable dans Temple wallet)
RPC=https://jakartanet.tezos.marigold.dev/
```
Ensuite, depuis la racine du dossier Blocky : 

```
ts-node deploy/deploy_Marketplace.ts 
ts-node deploy/deploy_NFT.ts
```

## Tester le code via Better Call Dev

Voici le lien du [contrat](https://better-call.dev/jakartanet/KT18cGSFVY6sTSeFLYnHVnzzcJgVT8XooqBz/operations/ "contrat") où vous pouvez vous amuser :
 
## Scénario

Pour pouvoir appréciez l'expérience front-end de notre application, voici comment s'y prendre

-  Commencer par connecter son wallet en cliquant sur le bouton "Connect wallet dans la page d'accueil"
-  Ensuite aller sur la page "Mint NFT", il suffira de remplir les champs name et symbol et de charger en plus un fichier image. NB : Il faut cliquer 2 fois sur le bouton Mint afin qu'il prenne en compte l'URI de l'image téléchargée. Le hook ne se met pas à jour correctement sur React.
-  Une fois fait, nous aurions pu aller sur la page createSale afin de créer une vente. Cependant, lors de l'intégration, des problématiques de type de variables nous ont bloqués. Pour continuer, nous irons sur le nôtre [Better Call Dev](https://better-call.dev/jakartanet/KT18cGSFVY6sTSeFLYnHVnzzcJgVT8XooqBz/operations)
-  Allons sur l'entrypoint createSale, les paramètres "nft_id" et "token_id" sont semblables c'est l'ID du NFT minté. Le price est en mutez il faut donc choisir un nombre et le mettre à 10^6 (ex: 5 tez = 5000000 mutez). Pour finir, l'adresse "to_pay" est l'adresse qui recevra le paiement après achat, l'adresse "from" est celle du possésseur du NFT ou d'un NFT dont les droits vous sont délégués et enfin l'adresse "to" est celle du contrat. La page est tout de même créée en front.
-  Enfin, à l'accueil apparaitra alors la sale en question avec les données du NFT, "name", "symbol" et l'image avec un bouton buy qui vous permettra d'acheter en tezos le NFT
-  L'adresse définie en "to_pay" recevra le paiement
## License

GNU Affero General Public License, abrégée AGPL, est une licence libre copyleft, ayant pour but d'obliger les services accessibles par le réseau de publier leur code source.

Basée sur la licence GNU GPL, dans le cadre général du projet GNU, elle répond à un besoin spécifique du projet Affero, qui souhaite que tout opérateur d'un service Web utilisant leur logiciel et l'améliorant publie ses modifications.

![License overview](https://snyk.io/wp-content/uploads/Licenses-image-2048x1202.png)
