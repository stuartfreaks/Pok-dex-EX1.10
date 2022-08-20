const pokemonRepository = (function () {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
    const loadingMessageEl = document.getElementById('loading-message');
    const modalContainer = document.querySelector('#modal-container');

    function add(pokemon) {
        if (
            typeof pokemon === "object" &&
            "name" in pokemon
        ) {
            pokemonList.push(pokemon);
        } else {
            console.log('pokemon is not correct');
        }
    }

    function getAll() {
        return pokemonList;
    };

    //Show Details updated to show modal with pokemon, picture and height

    function showDetails(pokemon) {
        loadDetails(pokemon).then(function () {
            modalContainer.innerHTML = '';
            const modal = document.createElement('div');
            modal.classList.add('modal');

            const closeButtonElement = document.createElement('button');
            closeButtonElement.classList.add('modal-close');
            closeButtonElement.innerHTML = 'Close';
            closeButtonElement.addEventListener('click', hideModal);

            const navigateLeftElement = document.createElement('div');
            navigateLeftElement.classList.add('pokemon-nav');
            if (getPokemonIndex(pokemon) === 0) {
                navigateLeftElement.classList.add('pokemon-nav--disabled');
            }
            navigateLeftElement.innerText = 'Previous';
            navigateLeftElement.addEventListener('click', () => loadPreviousPokemon(pokemon));

            const navigateRightElement = document.createElement('div');
            navigateRightElement.classList.add('pokemon-nav');
            if (getPokemonIndex(pokemon) === pokemonList.length - 1) {
                navigateRightElement.classList.add('pokemon-nav--disabled');
            }
            navigateRightElement.innerText = 'Next';
            navigateRightElement.addEventListener('click', () => loadNextPokemon(pokemon));

            const pokemonInfoElement = document.createElement('div');
            pokemonInfoElement.classList.add('pokemon-info');

            const pokemonContainerElement = document.createElement('div');
            pokemonContainerElement.classList.add('pokemon-container');

            const titleElement = document.createElement('h1');
            titleElement.innerText = pokemon.name;

            const pictureElement = document.createElement('img');
            pictureElement.src = pokemon.imageUrl;
            pictureElement.style.width = '300px';

            const contentElement = document.createElement('p');
            contentElement.innerText = 'Height: ' + pokemon.height / 10 + 'm';

            modal.appendChild(closeButtonElement);
            pokemonInfoElement.appendChild(titleElement);
            pokemonInfoElement.appendChild(pictureElement);
            pokemonInfoElement.appendChild(contentElement);
            pokemonContainerElement.appendChild(navigateLeftElement);
            pokemonContainerElement.appendChild(pokemonInfoElement);
            pokemonContainerElement.appendChild(navigateRightElement);
            modal.appendChild(pokemonContainerElement);
            modalContainer.appendChild(modal);

            modalContainer.classList.add('is-visible');
        });
    }

    let dialogPromiseReject;

    function hideModal() {
        modalContainer.classList.remove('is-visible');
        if (dialogPromiseReject) {
            dialogPromiseReject();
            dialogPromiseReject = null;
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
            hideModal();
        }
    });

    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            hideModal();
        }
    });

    function buttonEvent(buttonEl, pokemon) {
        buttonEl.addEventListener('click', function () {
            showDetails(pokemon);
        })
    }

    function addListItem(pokemon) {
        const pokemonList = document.querySelector('.pokemon-list');
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.innerText = pokemon.name;
        button.classList.add('my-button');
        listItem.appendChild(button);
        pokemonList.appendChild(listItem);
        buttonEvent(button, pokemon);
    }

    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl).then(function (response) {
            return response.json();
        }).then(function (json) {
            json.results.forEach(function (pokemon) {
                add({
                    name: pokemon.name[0].toUpperCase() + pokemon.name.slice(1),
                    detailsUrl: pokemon.url
                });
            });
            hideLoadingMessage();
        }).catch(function (e) {
            console.error(e);
            hideLoadingMessage();
        })
    }

    function loadDetails(pokemon) {
        showLoadingMessage();
        return fetch(pokemon.detailsUrl).then(function (response) {
            return response.json();
        }).then(function (details) {
            pokemon.imageUrl = details.sprites.other.dream_world.front_default;
            pokemon.height = details.height;
            pokemon.types = details.types;
            hideLoadingMessage();
        }).catch(function (e) {
            console.error(e);
            hideLoadingMessage();
        });
    }

    function showLoadingMessage() {
        loadingMessageEl.innerText = "Loading...";
    };

    function hideLoadingMessage() {
        loadingMessageEl.innerText = "";
    };

    function getPokemonIndex(pokemon) {
        return pokemonList.findIndex(p => p.name === pokemon.name);
    }

    function loadPreviousPokemon(pokemon) {
        showDetails(pokemonList[getPokemonIndex(pokemon) - 1]);
    }

    function loadNextPokemon(pokemon) {
        showDetails(pokemonList[getPokemonIndex(pokemon) + 1]);
    }

    return { getAll, addListItem, loadList, loadDetails };
})();

// Rendering DOM
pokemonRepository.loadList().then(function () {
    pokemonRepository.getAll().forEach(function (pokemon) {
        pokemonRepository.addListItem(pokemon);
    });
});