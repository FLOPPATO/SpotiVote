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

                        fetch("/vote", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                //handle dynamic token plz 
                                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhYW8iLCJpYXQiOjE3NDc2ODU2NzQsImV4cCI6MTc0Nzc3MjA3NH0.LsI_sKwtsdEjffxCMOG6lj-e1QNF9YbrqtpnXGzoB8U`
                            },
                            body: JSON.stringify({id : track.id})
                        }).then(response => response.json())
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

