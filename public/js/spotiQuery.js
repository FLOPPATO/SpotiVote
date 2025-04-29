function getOrSetUserId() {
    let userId = getCookie('userId');
    if (!userId) {
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
                    (Math.random() * 16 | 0).toString(16)
                    );
        const cookieString = `userId=${userId}; max-age=86400; path=/; SameSite=Strict` +
            (window.location.protocol === 'https:' ? '; Secure' : '');
        document.cookie = cookieString;
    }
    return userId;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


const resultsContainer = document.getElementById('resultsContainer');

document.getElementById('searchInput').addEventListener('input', function() {

    const query = document.getElementById('searchInput').value;
    
    if (!query) return;

    fetch(`/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
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
                        const userId = await getOrSetUserId();

                        console.log(userId);
                        
                        fetch("/vote", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'UserID': userId,
                            },
                            body: JSON.stringify({id : track.id})
                        }).then(data => {
                            console.log('API response:', data);
                            alert(`Vote registered for: ${track.name}`);
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

