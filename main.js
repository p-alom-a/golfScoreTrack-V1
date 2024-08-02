import pub from './pub-database.js';
import holes from './parcours-database.js';

(function() {
    emailjs.init("bNLINAH9U9QfeBPG3");
})();

window.addEventListener('beforeunload', function (e) {
    const confirmationMessage = 'Vous allez perdre les données non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
});

document.addEventListener('DOMContentLoaded', () => {
    
    const addPlayerButton = document.getElementById('addPlayerButton');
    const registerPlayersButton = document.getElementById('registerPlayersButton');
    const playerFormStep = document.getElementById('playerFormStep');
    const holePresentationStep = document.getElementById('holePresentationStep');
    const scoreStep = document.getElementById('scoreStep');
    const modal = document.getElementById('modal');
    const satelliteModal = document.getElementById('satelliteModal');
    const closeModal = document.getElementById('transitionClose');
    const closeSatelliteModal = document.getElementById('satelliteClose');
    const satelliteMapEl = document.getElementById('satelliteMap');

    const holeNumberEl = document.getElementById('holeNumber');
    const holeInfosEl = document.getElementById('holeInfos');
    const startHoleButton = document.getElementById('startHoleButton');
    const currentHoleNumberEl = document.getElementById('currentHoleNumber');
    const scoreFormsContainer = document.getElementById('scoreForms');
    const nextHoleButton = document.getElementById('nextHoleButton');
    

    const satelliteViewButton = document.getElementById('satelliteViewButton');
    let currentHole = 0;
    const totalHoles = 5;

    let satelliteMap = null;
    let currentMarker = null;

    class Player {
        constructor(name, color) {
            this.name = name;
            this.color = color;
            this.scores = [];
        }

        setScore(hole, score) {
            this.scores[hole] = score;
        }
    }

    class GolfApp {
        constructor() {
            this.players = [];
        }

        addPlayer(player) {
            this.players.push(player);
        }

        getAllPlayers() {
            return this.players;
        }

        getCurrentHole() {
            return currentHole;
        }

        incrementHole() {
            currentHole++;
        }

        decrementHole() {
            if (currentHole > 0) {
                currentHole--;
            }
        }

        resetHole() {
            currentHole = 0;
        }
    }

    const golfApp = new GolfApp();

    function hideAllSteps() {
        playerFormStep.style.display = 'none';
        holePresentationStep.style.display = 'none';
        scoreStep.style.display = 'none';
        const resultStep = document.querySelector('.resultStep');
        if (resultStep) {
            resultStep.style.display = 'none';
        }
    }    


    addPlayerButton.addEventListener('click', () => {
        const playerForms = document.getElementById('playerForms');
        const playerCount = playerForms.children.length + 1;
        const playerForm = document.createElement('div');
        playerForm.className = 'playerForm';
        playerForm.innerHTML = `
            <label for="name${playerCount}">Nom:</label>
            <input type="text" id="name${playerCount}" name="name${playerCount}" required>
            <label for="color${playerCount}">Couleur de départ:</label>
            <select id="color${playerCount}" name="color${playerCount}" required>
                <option value="jaune">Jaune</option>
                <option value="blanc">Blanc</option>
                <option value="noir">Noir</option>
                <option value="bleu">Bleu</option>
                <option value="rouge">Rouge</option>
            </select>
        `;
        playerForms.appendChild(playerForm);
        updateHistoryState('playerFormStep');
    });

    registerPlayersButton.addEventListener('click', () => {
        const playerForms = document.querySelectorAll('#playerForms .playerForm');
        golfApp.players = [];
        let allValid = true;

        playerForms.forEach(form => {
            const name = form.querySelector(`input[id^='name']`).value;
            const color = form.querySelector(`select[id^='color']`).value;

            if (name && color) {
                golfApp.addPlayer(new Player(name, color));
            } else {
                allValid = false;
            }
        });

        if (!allValid) {
            alert('Veuillez remplir tous les champs pour chaque joueur.');
            return;
        }

        updateHistoryState('holePresentationStep', currentHole);
        hideAllSteps();
        holePresentationStep.style.display = 'block';
        showHolePresentation();
    });



startHoleButton.addEventListener('click', () => {
    // Préparer l'image du prochain trou
    const nextHole = golfApp.getCurrentHole() + 1;
    if (nextHole < totalHoles) {
        const nextImage = pub[nextHole];
        const nextHoleImage = new Image();
        nextHoleImage.src = nextImage;  // Précharger l'image pour le prochain trou
    }

    updateHistoryState('scoreStep', currentHole);
    hideAllSteps();
    scoreStep.style.display = 'block';
    currentHoleNumberEl.textContent = currentHole + 1;
    generateScoreForms();
});


    nextHoleButton.addEventListener('click', () => {
        const scoreInputs = document.querySelectorAll('#scoreForms input');
        let allScoresEntered = true;

        golfApp.getAllPlayers().forEach((player, index) => {
            const score = scoreInputs[index].value;
            if (score !== '') {
                player.setScore(currentHole, score);
            } else {
                allScoresEntered = false;
            }
        });

        if (!allScoresEntered) {
            alert('Veuillez entrer un score pour chaque joueur.');
            return;
        }

        golfApp.incrementHole();
        if (golfApp.getCurrentHole() < totalHoles) {
            showModal();
        } else {
            displayResults();
        }
    });

    // closeModal.addEventListener('click', () => {
    //     modal.style.display = 'none';
    //     if (golfApp.getCurrentHole() < totalHoles) {
    //         updateHistoryState('holePresentationStep', currentHole);
    //         hideAllSteps();
    //         holePresentationStep.style.display = 'block';
    //         showHolePresentation();
    //     }
    // });


    closeModal.addEventListener('click', () => {
        // Préparer la prochaine image en la définissant comme source
        const nextHole = golfApp.getCurrentHole() + 1;
        if (nextHole < totalHoles) {
            const nextImage = pub[nextHole];
            const modalImage = document.querySelector('.modal-image');
            modalImage.src = nextImage;  // Précharger l'image pour la prochaine modal
        }
    
        // Fermer la modal actuelle
        modal.style.display = 'none';
    
        if (golfApp.getCurrentHole() < totalHoles) {
            updateHistoryState('holePresentationStep', currentHole);
            hideAllSteps();
            holePresentationStep.style.display = 'block';
            showHolePresentation();
        }
    });
    
    






    closeSatelliteModal.addEventListener('click', () => {
        satelliteModal.style.display = 'none';
    });

    satelliteViewButton.addEventListener('click', () => {
        satelliteModal.style.display = 'block';
        updateSatelliteMap();
    });

    function updateSatelliteMap() {
        if (satelliteMap) {
            satelliteMap.setView(holes[currentHole].center, 17);
            if (currentMarker) {
                currentMarker.remove();
            }
            currentMarker = L.marker(holes[currentHole].center).addTo(satelliteMap)
                .bindPopup('Trou ' + (currentHole + 1))
                .openPopup();
        } else {
            initializeSatelliteMap();
        }
    }

    function initializeSatelliteMap() {
        satelliteMap = L.map('satelliteMap', {
            center: holes[currentHole].center,
            zoom: 17
        });

        L.tileLayer('https://api.tomtom.com/map/1/tile/sat/main/{z}/{x}/{y}.jpg?key=PI1Ru8ymjK0WhxPAccrLofhaq0BIb77T', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://tomtom.com">TomTom</a>'
        }).addTo(satelliteMap);

        currentMarker = L.marker(holes[currentHole].center).addTo(satelliteMap)
            .bindPopup('Trou ' + (currentHole + 1))
            .openPopup();

        satelliteMap.locate({ setView: true, maxZoom: 17 });

        satelliteMap.on('locationfound', onLocationFound);
        satelliteMap.on('locationerror', onLocationError);
    }

    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        L.circle(e.latlng, radius).addTo(satelliteMap);
    }

    function onLocationError(e) {
        alert(e.message);
    }




    function generateScoreForms() {
        scoreFormsContainer.innerHTML = '';
        golfApp.getAllPlayers().forEach(player => {
            const scoreForm = document.createElement('div');
            scoreForm.className = 'scoreForm';
            scoreForm.innerHTML = `
                <p>${player.name}</p>
                <input type="number" value="${player.scores[currentHole] || ''}" placeholder="Entrez votre score" required>
            `;
            scoreFormsContainer.appendChild(scoreForm);
        });
    }



    // function showModal() {
    //     const modalImage = document.querySelector('.modal-image');
    //     modalImage.src = pub[currentHole];
    //     modal.style.display = 'block';
    // }

    function showModal() {
        const modalImage = document.querySelector('.modal-image');
        modalImage.src = pub[currentHole];
        modal.style.display = 'block';
    }
    
    

    

    //function showHolePresentation() {
       // const hole = holes[currentHole];
        //holeNumberEl.textContent = currentHole + 1;

        //document.getElementById('map').style.backgroundImage = `url("${hole.image}")`;

        //holeInfosEl.innerHTML = `
          //  <div>Par: ${hole.par}</div>
        //`;

       // const uniqueColors = new Set(golfApp.getAllPlayers().map(player => player.color));

        //uniqueColors.forEach(color => {
          //  const distance = hole.distances[color];
            //holeInfosEl.innerHTML += `<div>Distance départ ${color}: ${distance}</div>`;
       // });
   // }


function showHolePresentation() {
        const hole = holes[currentHole];
        holeNumberEl.textContent = currentHole + 1;
    
        // Créer une balise <img> pour lazy loading
        const lazyImage = document.createElement('img');
        lazyImage.src = hole.image; // Définir la source de l'image
        lazyImage.loading = 'lazy'; // Activer le lazy loading
        lazyImage.style.display = 'none'; // Cacher l'image
    
        // Définir l'image de fond lorsque l'image est chargée
        lazyImage.onload = () => {
            document.getElementById('map').style.backgroundImage = `url("${hole.image}")`;
        };
    
        // Ajouter l'image au DOM
        document.body.appendChild(lazyImage); // Ajouter l'image au body ou à un conteneur adéquat
    
        holeInfosEl.innerHTML = `
            <div>Par: ${hole.par}</div>
        `;
    
        const uniqueColors = new Set(golfApp.getAllPlayers().map(player => player.color));
    
        uniqueColors.forEach(color => {
            const distance = hole.distances[color];
            holeInfosEl.innerHTML += `<div>Distance départ ${color}: ${distance}</div>`;
        });
    }



    function displayResults() {
        hideAllSteps(); 

        const resultStep = document.createElement('div');
        resultStep.className = 'resultStep container'; 
        resultStep.innerHTML = '<h2>Résultats</h2>';

        golfApp.getAllPlayers().forEach(player => {
            resultStep.innerHTML += `<div class="player-results">
                <p><strong>Nom: ${player.name}</strong></p>
                ${player.scores.map((score, index) => `<p>Score du trou ${index + 1}: ${score}</p>`).join('')}
            </div>`;
        });

        const signatureContainer = document.createElement('div');
        signatureContainer.className = 'signature-container'; // Appliquez la classe CSS
        signatureContainer.innerHTML = `
            <p>Signature:</p>
            <canvas id="signature-pad" width="350" height="200"></canvas>
            <button id="clear-signature">Effacer la signature</button>
        `;
        resultStep.appendChild(signatureContainer);
        

        const sendResultsButton = document.createElement('button');
        sendResultsButton.textContent = 'Envoyer les résultats';
        sendResultsButton.id = 'sendResultsButton';
        resultStep.appendChild(sendResultsButton);

        document.body.innerHTML = '';
        document.body.appendChild(resultStep);

        const canvas = document.getElementById('signature-pad');
        const signaturePad = new SignaturePad(canvas);

        document.getElementById('clear-signature').addEventListener('click', () => {
            signaturePad.clear();
        });

        sendResultsButton.addEventListener('click', () => sendResults(signaturePad));
    }

    function sendResults(signaturePad) {
        if (signaturePad.isEmpty()) {
            alert('Veuillez signer avant d\'envoyer les résultats.');
            return;
        }

        const results = golfApp.getAllPlayers().map(player => {
            return `Nom: ${player.name}\n${player.scores.map((score, index) => `Score du trou ${index + 1}: ${score}`).join('\n')}`;
        }).join('\n\n');

        const playerNames = golfApp.getAllPlayers().map(player => player.name).join(', ');

        const signatureDataUrl = signaturePad.toDataURL();

        emailjs.send('service_vkyjis8', 'template_yzyr9hy', {
            results: results,
            playerNames: playerNames,
            signature: signatureDataUrl
        })
        .then((response) => {
            alert('Les résultats ont été envoyés avec succès !');
        }, (error) => {
            alert('Erreur lors de l\'envoi des résultats : ' + JSON.stringify(error));
        });
    }

    function updateHistoryState(step, hole = null) {
        const state = { step };
        if (hole !== null) {
            state.hole = hole;
        }
        history.pushState(state, '', `#${step}`);
    }

    window.addEventListener('popstate', event => {
        if (event.state && event.state.step) {
            hideAllSteps();
            if (event.state.step === 'playerFormStep') {
                playerFormStep.style.display = 'block';
            } else if (event.state.step === 'holePresentationStep') {
                currentHole = event.state.hole !== undefined ? event.state.hole : currentHole;
                holePresentationStep.style.display = 'block';
                showHolePresentation();
            } else if (event.state.step === 'scoreStep') {
                currentHole = event.state.hole !== undefined ? event.state.hole : currentHole;
                scoreStep.style.display = 'block';
                currentHoleNumberEl.textContent = currentHole + 1;
                generateScoreForms();
            }
        }
    });

    updateHistoryState('playerFormStep');
    hideAllSteps();
    playerFormStep.style.display = 'block';
});
