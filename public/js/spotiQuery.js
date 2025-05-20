const loginModal = document.getElementById('loginModal');
const closeButton = document.querySelector('.close');
const loginSubmit = document.getElementById('loginSubmit');

const registerSubmit = document.getElementById('registerSubmit');


function showhideModal(alt = 0) {
    //0 alternate 1 force true 2 force false
    if(alt == 0)
        loginModal.style.display = loginModal.style.display == 'none'?'block':'none';
    else if(alt == 1)
        loginModal.style.display = 'block';
    else if(alt == 2)
        loginModal.style.display = 'none';
}

closeButton.onclick = () => showhideModal(2);

window.onclick = function(event) {
    if (event.target == loginModal) {
        showhideModal(2);
    }
}

loginSubmit.onclick = async function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            showhideModal(2);
            alert('Login andato bene. Rivota');
        } else {
            alert('login sbagliato: ' + data.message);
        }
    } catch (err) {
        alert('errore nel login');
        console.error(err);
    }
};

registerSubmit.onclick = async function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            showhideModal(2);
            alert('register andato bene. Rivota');
        } else {
            alert('register errore: ' + data.message);
        }
    } catch (err) {
        alert('errore nel login');
        console.error(err);
    }
};



const resultsContainer = document.getElementById('resultsContainer');

document.getElementById('searchInput').addEventListener('input', function() {

    const query = document.getElementById('searchInput').value;
    
    if (!query) return;

    fetch(`/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                resultsContainer.innerHTML = '<p>too many requests :(</p>';
                throw (response.status);
            }
            return response.json();
        })
        .then(data => {
            resultsContainer.innerHTML = '';

            if (data.length == 0) {
                resultsContainer.innerHTML = '<p>nessuna traccia</p>';
            } else {
                data.forEach(track => {
                    const trackElement = document.createElement('div');
                    trackElement.classList.add('track');

                    trackElement.innerHTML = 
                    `
                        <strong>${track.name}</strong> <br />
                        <small>${track.artists.map(artist => artist.name).join(', ')}</small><br/>
                        <img src="${track.album.images[0].url}" alt="${track.album.images[1].url}" style="width: 100px;">
                    `;

                    
                    
                    trackElement.addEventListener('click', async function() {
                        const token = localStorage.getItem('token');

                        if (!token) {
                            showhideModal(1);
                            return;
                        }

                        fetch("/vote", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                //handle dynamic token plz  DONE
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({id : track.id})
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('API response:', data);
                            if(data.success)
                                alert(data.message);
                            else
                                alert(data.message + " for " + data.name);
                        })
                    });
                    
                    resultsContainer.appendChild(trackElement);
                    
                });
            }
        })
        .catch(error => {
            console.error(error);
        });
});

